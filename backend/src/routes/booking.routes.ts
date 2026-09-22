import { Router } from "express";
import { createBooking, listBookings, updateBookingStatus } from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";
import { Role } from "../types/auth.types";
import { bookingIdParamSchema, listBookingsQuerySchema, updateStatusSchema } from "../validators/booking.validator";

const router = Router();

router.use(authenticate);

router.post("/", createBooking);
router.get("/", validate({ query: listBookingsQuerySchema }), listBookings);
router.patch(
  "/:id/status",
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  validate({ params: bookingIdParamSchema, body: updateStatusSchema }),
  updateBookingStatus
);

export default router;
