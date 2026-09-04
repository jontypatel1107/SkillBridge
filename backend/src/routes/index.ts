import { Router } from "express";
import authRoutes from "./authRoutes";
import skillRoutes from "./skillRoutes";
import bookingRoutes from "./bookingRoutes";
import userRoutes from "./userRoutes";
import reviewRoutes from "./reviewRoutes";
import notificationRoutes from "./notificationRoutes";
import chatRoutes from "./chatRoutes";
import aiRoutes from "./aiRoutes";
import adminRoutes from "./adminRoutes";
import meetingRoutes from "./meetingRoutes";

const router = Router();

router.get("/health", (req, res) => res.json({ success: true, status: "ok" }));
router.use("/auth", authRoutes);
router.use("/skills", skillRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);
router.use("/reviews", reviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/chat", chatRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);
router.use("/meetings", meetingRoutes);

export default router;
