import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface AppState {
  /** How many API requests are running right now. Drives the loading bar at the top. */
  pendingRequests: number;
  toasts: Toast[];
  startLoading: () => void;
  stopLoading: () => void;
  showToast: (type: ToastType, message: string) => void;
  dismissToast: (id: number) => void;
}

let nextToastId = 1;

export const useAppStore = create<AppState>((set) => ({
  pendingRequests: 0,
  toasts: [],
  startLoading: () => set((state) => ({ pendingRequests: state.pendingRequests + 1 })),
  stopLoading: () => set((state) => ({ pendingRequests: Math.max(0, state.pendingRequests - 1) })),
  showToast: (type, message) => set((state) => ({ toasts: [...state.toasts, { id: nextToastId++, type, message }] })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
