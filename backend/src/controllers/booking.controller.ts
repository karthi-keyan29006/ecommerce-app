import { Request, Response } from "express";
import { bookingService } from "../services/booking.service";
import { ListBookingsQuery } from "../types/booking.types";
import { asyncHandler, sendResponse } from "../utils/response";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 201, { booking: await bookingService.createFromCart(req.user!.id) });
});

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, await bookingService.list(req.user!, req.query as unknown as ListBookingsQuery));
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, { booking: await bookingService.updateStatus(req.params.id, req.body) });
});
