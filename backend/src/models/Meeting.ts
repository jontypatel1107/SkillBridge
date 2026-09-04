import { Schema, model, Document, Types } from "mongoose";

export interface IMeeting extends Document {
  booking?: Types.ObjectId;
  initiator: Types.ObjectId;
  participant: Types.ObjectId;
  roomName: string;
  roomUrl: string;
  dailyToken?: string;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    initiator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomName: { type: String, required: true, unique: true },
    roomUrl: { type: String, required: true },
    dailyToken: { type: String },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

meetingSchema.index({ initiator: 1, participant: 1, createdAt: -1 });

export const Meeting = model<IMeeting>("Meeting", meetingSchema);
