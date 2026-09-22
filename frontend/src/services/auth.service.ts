import { loginRequest, meRequest, registerRequest } from "../api/auth.api";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth.types";
import { withErrorMessage } from "../utils/error";
import { tokenStorage } from "../utils/storage";

export const authService = {
  getStoredToken: (): string | null => tokenStorage.get(),

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await withErrorMessage(() => loginRequest(payload));
    tokenStorage.set(data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await withErrorMessage(() => registerRequest(payload));
    tokenStorage.set(data.token);
    return data;
  },

  /** Restores the session after a page refresh using the saved token. */
  async me(): Promise<User> {
    const data = await withErrorMessage(() => meRequest());
    return data.user;
  },

  clearSession: (): void => tokenStorage.clear(),
};
