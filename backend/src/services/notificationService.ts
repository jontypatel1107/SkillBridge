import { Types } from "mongoose";
import { Notification, NotificationType } from "../models/Notification";

interface CreateNotificationInput {
  recipient: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: Types.ObjectId | string;
}

export async function notify(input: CreateNotificationInput) {
  // Fire-and-forget by design — a notification failing to write should
  // never fail the parent action (booking, review, message, etc).
  try {
    await Notification.create(input);
  } catch (err) {
    console.error("[notify] failed to create notification:", err);
  }
}
