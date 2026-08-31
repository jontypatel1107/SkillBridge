import { Response } from "express";
import { Types } from "mongoose";
import { Notification } from "../models/Notification";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";

export async function listMyNotifications(req: AuthedRequest, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user!.id }),
    Notification.countDocuments({ recipient: req.user!.id, isRead: false }),
  ]);

  return ok(res, {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function markRead(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user!.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return ok(res, { notification });
}

export async function markAllRead(req: AuthedRequest, res: Response) {
  await Notification.updateMany(
    { recipient: req.user!.id, isRead: false },
    { isRead: true }
  );
  return ok(res, { message: "All notifications marked as read" });
}
