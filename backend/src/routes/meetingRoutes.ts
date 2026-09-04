import { Router } from "express";
import * as meetingController from "../controllers/meetingController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/:otherUserId", meetingController.getOrCreateMeeting);
router.post("/:otherUserId/end", meetingController.endMeeting);
router.post("/booking/:bookingId/start", meetingController.startBookingMeeting);

export default router;
