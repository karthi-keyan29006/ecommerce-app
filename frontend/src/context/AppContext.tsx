import { createContext, useMemo, type ReactNode } from "react";
import { useAppStore } from "../store/app.store";
import { APP_NAME } from "../utils/constants";
import { formatDate, formatPrice } from "../utils/format";

export interface AppContextValue {
  appName: string;
  formatPrice: (value: number) => string;
  formatDate: (iso: string) => string;
  notify: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

export const AppContext = createContext<AppContextValue | null>(null);

/** App-wide values (name, formatters, toast helpers). Consume it with the useAppContext hook. */
export function AppProvider({ children }: { children: ReactNode }) {
  const showToast = useAppStore((state) => state.showToast);

  const value = useMemo<AppContextValue>(
    () => ({
      appName: APP_NAME,
      formatPrice,
      formatDate,
      notify: {
        success: (message) => showToast("success", message),
        error: (message) => showToast("error", message),
        info: (message) => showToast("info", message),
      },
    }),
    [showToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
