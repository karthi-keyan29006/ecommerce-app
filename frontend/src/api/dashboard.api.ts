import type { DashboardStats } from "../types/booking.types";
import { apiClient } from "./axios";

export const getDashboardRequest = async (): Promise<{ stats: DashboardStats }> => {
  const { data } = await apiClient.get<{ stats: DashboardStats }>("/admin/dashboard");
  return data;
};
