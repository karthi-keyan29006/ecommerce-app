import { z } from "zod";
import { listBookingsQuerySchema, updateStatusSchema } from "../validators/booking.validator";

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
