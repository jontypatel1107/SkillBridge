import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingMode = "online" | "offline";

export interface IBooking extends Document {
  learner: Types.ObjectId;
  mentor: Types.ObjectId;
  skill: Types.ObjectId;
  mode: BookingMode;
  scheduledAt: Date;
  durationMinutes: number;
  status: BookingStatus;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    learner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    mode: { type: String, enum: ["online", "offline"], required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 15, default: 60 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    cancelReason: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

bookingSchema.index({ mentor: 1, scheduledAt: 1 });
bookingSchema.index({ learner: 1, scheduledAt: 1 });

export const Booking = model<IBooking>("Booking", bookingSchema);
