import type { Booking, BookingQuery, BookingStatus } from "../types/booking.types";
import type { Paginated } from "../types/product.types";
import { apiClient } from "./axios";

export const createBookingRequest = async (): Promise<{ booking: Booking }> => {
  const { data } = await apiClient.post<{ booking: Booking }>("/bookings");
  return data;
};

export const getBookingsRequest = async (params: BookingQuery): Promise<Paginated<Booking>> => {
  const { data } = await apiClient.get<Paginated<Booking>>("/bookings", { params });
  return data;
};

export const updateBookingStatusRequest = async (id: string, status: BookingStatus): Promise<{ booking: Booking }> => {
  const { data } = await apiClient.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status });
  return data;
};
