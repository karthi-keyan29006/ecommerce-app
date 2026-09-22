import axios from "axios";
import { useAppStore } from "../store/app.store";
import { API_URL } from "../utils/constants";
import { tokenStorage } from "../utils/storage";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// The auth store registers this callback so we can clear the session on an expired token
// without this file importing the auth store (which would create a circular import).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};

// 1) Attach the JWT to every request and count it for the global loading bar
apiClient.interceptors.request.use((config) => {
  useAppStore.getState().startLoading();
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) If the server says 401 while we hold a token, that token is expired/invalid: clear auth.
apiClient.interceptors.response.use(
  (response) => {
    useAppStore.getState().stopLoading();
    return response;
  },
  (error: unknown) => {
    useAppStore.getState().stopLoading();
    if (axios.isAxiosError(error) && error.response?.status === 401 && tokenStorage.get()) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
