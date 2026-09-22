import { BookingStatus } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../middleware/validation.middleware";

export const listBookingsQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(BookingStatus).optional(),
});

export const bookingIdParamSchema = z.object({ id: z.string().uuid("Invalid booking id") });

export const updateStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus, { errorMap: () => ({ message: "Invalid booking status" }) }),
});
