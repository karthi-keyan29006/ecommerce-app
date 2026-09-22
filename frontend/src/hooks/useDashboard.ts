import { useEffect, useState } from "react";
import { getDashboardRequest } from "../api/dashboard.api";
import type { DashboardStats } from "../types/booking.types";
import type { LoadStatus } from "../types/product.types";
import { getErrorMessage } from "../utils/error";
import { useAppContext } from "./useAppContext";

export function useDashboard() {
  const { notify } = useAppContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    getDashboardRequest()
      .then((result) => {
        if (cancelled) return;
        setStats(result.stats);
        setStatus("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("failed");
        notify.error(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

  return { stats, status };
}
