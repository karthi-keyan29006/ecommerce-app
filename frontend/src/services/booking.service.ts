import { createBookingRequest, getBookingsRequest, updateBookingStatusRequest } from "../api/booking.api";
import type { Booking, BookingQuery, BookingStatus } from "../types/booking.types";
import type { Paginated } from "../types/product.types";
import { withErrorMessage } from "../utils/error";

export const bookingService = {
  async create(): Promise<Booking> {
    return (await withErrorMessage(() => createBookingRequest())).booking;
  },
  list: (query: BookingQuery): Promise<Paginated<Booking>> => withErrorMessage(() => getBookingsRequest(query)),
  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return (await withErrorMessage(() => updateBookingStatusRequest(id, status))).booking;
  },
};
