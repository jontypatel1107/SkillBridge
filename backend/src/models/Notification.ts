import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "booking_requested"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "new_message"
  | "new_review"
  | "new_follower";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "booking_requested",
        "booking_confirmed",
        "booking_cancelled",
        "booking_completed",
        "new_message",
        "new_review",
        "new_follower",
      ],
    },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 300 },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
