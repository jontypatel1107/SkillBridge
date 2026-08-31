import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  booking?: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  text?: string;
  imageUrl?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, maxlength: 2000 },
    imageUrl: { type: String },
    readAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

export const Message = model<IMessage>("Message", messageSchema);
