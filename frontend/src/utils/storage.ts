import { TOKEN_KEY } from "./constants";

/** Small wrappers around localStorage. try/catch keeps the app working if storage is blocked. */
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable: user simply has to log in again next visit */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const tokenStorage = {
  get: (): string | null => storage.get(TOKEN_KEY),
  set: (token: string): void => storage.set(TOKEN_KEY, token),
  clear: (): void => storage.remove(TOKEN_KEY),
};
