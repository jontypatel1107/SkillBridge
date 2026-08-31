import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  booking: Types.ObjectId;
  reviewer: Types.ObjectId;
  mentor: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// One review per booking — enforced at the schema level so a learner
// can't leave duplicate reviews for the same completed session.
reviewSchema.index({ booking: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
