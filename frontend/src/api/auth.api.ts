import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth.types";
import { apiClient } from "./axios";

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const meRequest = async (): Promise<{ user: User }> => {
  const { data } = await apiClient.get<{ user: User }>("/auth/me");
  return data;
};
