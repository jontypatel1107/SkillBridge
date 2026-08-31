import { Router } from "express";
import * as bookingController from "../controllers/bookingController";
import { validate } from "../middleware/validate";
import { validateQuery } from "../middleware/validateQuery";
import { requireAuth } from "../middleware/auth";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  listBookingsQuerySchema,
} from "../validators/bookingValidators";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createBookingSchema), bookingController.createBooking);
router.get("/", validateQuery(listBookingsQuerySchema), bookingController.listMyBookings);
router.get("/:id", bookingController.getBooking);
router.patch(
  "/:id/status",
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

export default router;
