import { Schema, model, Document, Types } from "mongoose";

export interface ISkill extends Document {
  mentor: Types.ObjectId;
  title: string;
  category: string;
  description: string;
  hourlyPrice: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: {
      type: String,
      required: true,
      enum: [
        "development",
        "ai",
        "music",
        "fitness",
        "design",
        "business",
        "photography",
        "cooking",
        "languages",
      ],
    },
    description: { type: String, required: true, maxlength: 1000 },
    hourlyPrice: { type: Number, required: true, min: 0 },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

skillSchema.index({ title: "text", tags: "text", category: "text" });

export const Skill = model<ISkill>("Skill", skillSchema);
