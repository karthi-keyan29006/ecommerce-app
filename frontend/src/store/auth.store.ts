import { create } from "zustand";
import { setUnauthorizedHandler } from "../api/axios";
import { authService } from "../services/auth.service";
import type { AuthResponse, AuthStatus, LoginPayload, RegisterPayload, User } from "../types/auth.types";
import { useAppStore } from "./app.store";
import { useCartStore } from "./cart.store";

interface AuthState {
  user: User | null;
  token: string | null;
  /** "hydrating" while a saved token is being checked at app start (prevents a login-page flash). */
  status: AuthStatus;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

const savedToken = authService.getStoredToken();

export const useAuthStore = create<AuthState>((set, get) => {
  const authenticate = async (request: () => Promise<AuthResponse>, fallback: string): Promise<boolean> => {
    set({ status: "loading", error: null });
    try {
      const { user, token } = await request();
      set({ user, token, status: "idle" });
      return true;
    } catch (error) {
      set({ status: "idle", error: error instanceof Error ? error.message : fallback });
      return false;
    }
  };

  return {
    user: null,
    token: savedToken,
    status: savedToken ? "hydrating" : "idle", // nothing to restore when there is no saved token
    error: null,

    login: (payload) => authenticate(() => authService.login(payload), "Login failed"),
    register: (payload) => authenticate(() => authService.register(payload), "Registration failed"),

    logout: () => {
      authService.clearSession();
      useCartStore.getState().clear();
      set({ user: null, token: null, status: "idle", error: null });
    },

    hydrate: async () => {
      if (!get().token || get().user) {
        if (get().status === "hydrating") set({ status: "idle" });
        return;
      }
      try {
        const user = await authService.me();
        set({ user, status: "idle" });
      } catch {
        // Saved token is no longer valid
        authService.clearSession();
        set({ user: null, token: null, status: "idle" });
      }
    },

    clearError: () => set({ error: null }),
  };
});

// If the API answers 401 for a logged-in user, the session expired: clear it and tell the user.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
  useAppStore.getState().showToast("info", "Your session expired. Please log in again.");
});
