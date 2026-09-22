import { useEffect } from "react";
import { useAppStore, type Toast } from "../../store/app.store";
import { TOAST_DURATION_MS } from "../../utils/constants";

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [dismissToast, toast.id]);

  return (
    <div className={`toast toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"}>
      <span>{toast.message}</span>
      <button className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useAppStore((state) => state.toasts);
  return (
    <div className="toast-host">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
