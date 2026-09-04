import { Response } from "express";
import { Types } from "mongoose";
import { Booking, BookingStatus } from "../models/Booking";
import { Skill } from "../models/Skill";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import {
  CreateBookingInput,
  UpdateBookingStatusInput,
  ListBookingsQuery,
} from "../validators/bookingValidators";
import { notify } from "../services/notificationService";
import { onBookingCompleted } from "../services/gamificationService";

// Which status transitions are legal, and who is allowed to make them.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  expired: ["completed", "cancelled"],
};

function buildMeetingUrl(bookingId: Types.ObjectId | string): string {
  return `https://meet.jit.si/skillbridge-${bookingId.toString()}`;
}

async function expireStaleConfirmedBookings(userId?: string) {
  const filter: Record<string, unknown> = {
    status: "confirmed",
    $expr: {
      $lt: [
        { $add: ["$scheduledAt", { $multiply: ["$durationMinutes", 60 * 1000] }] },
        new Date(),
      ],
    },
  };

  if (userId) {
    filter.$or = [{ learner: userId }, { mentor: userId }];
  }

  await Booking.updateMany(filter, { status: "expired" });
}

export async function createBooking(req: AuthedRequest, res: Response) {
  const { skillId, mode, scheduledAt, durationMinutes } = req.body as CreateBookingInput;

  const skill = await Skill.findById(skillId);
  if (!skill || !skill.isActive) {
    throw new ApiError(404, "Skill listing not found");
  }

  if (skill.mentor.toString() === req.user!.id) {
    throw new ApiError(400, "You can't book your own skill listing");
  }

  const booking = await Booking.create({
    learner: req.user!.id,
    mentor: skill.mentor,
    skill: skill._id,
    mode,
    scheduledAt,
    durationMinutes,
    status: "pending",
  });

  if (mode === "online") {
    booking.meetingUrl = buildMeetingUrl(booking._id);
    await booking.save();
  }

  await notify({
    recipient: skill.mentor,
    type: "booking_requested",
    title: "New booking request",
    body: `Someone requested a session for "${skill.title}"`,
    relatedId: booking._id,
  });

  return ok(res, { booking }, 201);
}

export async function listMyBookings(req: AuthedRequest, res: Response) {
  await expireStaleConfirmedBookings(req.user!.id);

  const query = (req as AuthedRequest & { validatedQuery: ListBookingsQuery }).validatedQuery;
  const { status, page, limit } = query;

  const filter: Record<string, unknown> = {
    $or: [{ learner: req.user!.id }, { mentor: req.user!.id }],
  };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("learner", "name username avatarUrl")
      .populate("mentor", "name username avatarUrl")
      .populate("skill", "title category hourlyPrice"),
    Booking.countDocuments(filter),
  ]);

  return ok(res, {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getBooking(req: AuthedRequest, res: Response) {
  await expireStaleConfirmedBookings(req.user!.id);

  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(req.params.id)
    .populate("learner", "name username avatarUrl")
    .populate("mentor", "name username avatarUrl")
    .populate("skill", "title category hourlyPrice");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const isParticipant =
    booking.learner._id.toString() === req.user!.id ||
    booking.mentor._id.toString() === req.user!.id;
  if (!isParticipant && req.user!.role !== "admin") {
    throw new ApiError(403, "You don't have access to this booking");
  }

  return ok(res, { booking });
}

export async function updateBookingStatus(req: AuthedRequest, res: Response) {
  await expireStaleConfirmedBookings(req.user!.id);

  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const { status: nextStatus, cancelReason } = req.body as UpdateBookingStatusInput;
  const isLearner = booking.learner.toString() === req.user!.id;
  const isMentor = booking.mentor.toString() === req.user!.id;
  const isAdmin = req.user!.role === "admin";

  if (!isLearner && !isMentor && !isAdmin) {
    throw new ApiError(403, "You don't have access to this booking");
  }

  // Only the mentor (or admin) can confirm or mark a session complete —
  // either side can cancel.
  if (nextStatus === "confirmed" || nextStatus === "completed") {
    if (!isMentor && !isAdmin) {
      throw new ApiError(403, "Only the mentor can do that");
    }
  }

  const allowed = ALLOWED_TRANSITIONS[booking.status];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(
      400,
      `Cannot move booking from "${booking.status}" to "${nextStatus}"`
    );
  }

  booking.status = nextStatus;
  if (nextStatus === "cancelled" && cancelReason) {
    booking.cancelReason = cancelReason;
  }
  await booking.save();

  const notifyRecipient = isMentor ? booking.learner : booking.mentor;
  const typeMap = {
    confirmed: "booking_confirmed",
    completed: "booking_completed",
    cancelled: "booking_cancelled",
  } as const;
  const titleMap = {
    confirmed: "Booking confirmed",
    completed: "Session marked complete",
    cancelled: "Booking cancelled",
  } as const;

  await notify({
    recipient: notifyRecipient,
    type: typeMap[nextStatus as keyof typeof typeMap],
    title: titleMap[nextStatus as keyof typeof titleMap],
    body: `Your booking status changed to "${nextStatus}"`,
    relatedId: booking._id,
  });

  if (nextStatus === "completed") {
    await onBookingCompleted({ _id: booking._id, learner: booking.learner, mentor: booking.mentor });
  }

  return ok(res, { booking });
}
