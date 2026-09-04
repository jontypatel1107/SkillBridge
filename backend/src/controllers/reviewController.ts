import { Response } from "express";
import { Types } from "mongoose";
import { Review } from "../models/Review";
import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import { CreateReviewInput } from "../validators/reviewValidators";
import { notify } from "../services/notificationService";
import { onReviewCreated } from "../services/gamificationService";

async function recalculateMentorRating(mentorId: Types.ObjectId | string) {
  const stats = await Review.aggregate([
    { $match: { mentor: new Types.ObjectId(mentorId.toString()) } },
    { $group: { _id: "$mentor", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] ?? {};
  await User.findByIdAndUpdate(mentorId, {
    rating: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
}

export async function createReview(req: AuthedRequest, res: Response) {
  const { bookingId, rating, comment } = req.body as CreateReviewInput;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.learner.toString() !== req.user!.id) {
    throw new ApiError(403, "Only the learner from this booking can leave a review");
  }

  if (booking.status !== "completed") {
    throw new ApiError(400, "You can only review a completed session");
  }

  const existing = await Review.findOne({ booking: booking._id });
  if (existing) {
    throw new ApiError(409, "This booking already has a review");
  }

  const review = await Review.create({
    booking: booking._id,
    reviewer: req.user!.id,
    mentor: booking.mentor,
    rating,
    comment,
  });

  await recalculateMentorRating(booking.mentor);

  await notify({
    recipient: booking.mentor,
    type: "new_review",
    title: "New review received",
    body: `You received a ${rating}-star review`,
    relatedId: review._id,
  });

  await onReviewCreated({ mentor: booking.mentor, rating });

  return ok(res, { review }, 201);
}

export async function listMentorReviews(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.mentorId)) {
    throw new ApiError(400, "Invalid mentor id");
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ mentor: req.params.mentorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reviewer", "name username avatarUrl"),
    Review.countDocuments({ mentor: req.params.mentorId }),
  ]);

  return ok(res, {
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
