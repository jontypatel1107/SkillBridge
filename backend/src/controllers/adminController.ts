import { Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { Booking } from "../models/Booking";
import { Skill } from "../models/Skill";
import { Review } from "../models/Review";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";

export async function listUsers(req: AuthedRequest, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.suspended !== undefined) filter.isSuspended = req.query.suspended === "true";

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return ok(res, {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function verifyMentor(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "mentor") {
    throw new ApiError(400, "Only mentors can be verified");
  }

  user.isVerified = true;
  await user.save();

  return ok(res, { user });
}

export async function setSuspended(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const { suspended } = req.body as { suspended: boolean };

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isSuspended: suspended },
    { new: true }
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return ok(res, { user });
}

export async function analytics(req: AuthedRequest, res: Response) {
  const [
    totalUsers,
    totalMentors,
    totalStudents,
    totalSkills,
    totalBookings,
    bookingsByStatus,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "mentor" }),
    User.countDocuments({ role: "student" }),
    Skill.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Review.countDocuments(),
  ]);

  return ok(res, {
    totalUsers,
    totalMentors,
    totalStudents,
    totalSkills,
    totalBookings,
    bookingsByStatus: Object.fromEntries(
      bookingsByStatus.map((b: { _id: string; count: number }) => [b._id, b.count])
    ),
    totalReviews,
  });
}
