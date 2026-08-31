import { Response } from "express";
import { Types } from "mongoose";
import { Message } from "../models/Message";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";

// Conversation history between the current user and one other user.
export async function getConversation(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
  const skip = (page - 1) * limit;

  const otherUserId = req.params.userId;
  const meId = req.user!.id;

  const filter = {
    $or: [
      { sender: meId, recipient: otherUserId },
      { sender: otherUserId, recipient: meId },
    ],
  };

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(filter),
  ]);

  await Message.updateMany(
    { sender: otherUserId, recipient: meId, readAt: { $exists: false } },
    { readAt: new Date() }
  );

  return ok(res, {
    messages: messages.reverse(),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// Distinct list of people the current user has exchanged messages with,
// most recent message first — powers the chat list screen.
export async function listConversations(req: AuthedRequest, res: Response) {
  const meId = new Types.ObjectId(req.user!.id);

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: meId }, { recipient: meId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$sender", meId] }, "$recipient", "$sender"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$recipient", meId] }, { $eq: [{ $ifNull: ["$readAt", null] }, null] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        "user.name": 1,
        "user.username": 1,
        "user.avatarUrl": 1,
        lastMessage: 1,
        unreadCount: 1,
      },
    },
  ]);

  return ok(res, { conversations });
}
