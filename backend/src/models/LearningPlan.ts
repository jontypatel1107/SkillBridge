import { Schema, model, Document, Types } from "mongoose";

export interface RoadmapWeek {
  week: number;
  title: string;
  dailyTasks: string[];
  resources: string[];
  milestone: string;
}

export interface ILearningPlan extends Document {
  user: Types.ObjectId;
  goal: string;
  durationDays: number;
  weeks: RoadmapWeek[];
  createdAt: Date;
  updatedAt: Date;
}

const roadmapWeekSchema = new Schema<RoadmapWeek>(
  {
    week: { type: Number, required: true },
    title: { type: String, required: true },
    dailyTasks: [{ type: String }],
    resources: [{ type: String }],
    milestone: { type: String, required: true },
  },
  { _id: false }
);

const learningPlanSchema = new Schema<ILearningPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: String, required: true, maxlength: 300 },
    durationDays: { type: Number, required: true, min: 1, max: 365 },
    weeks: [roadmapWeekSchema],
  },
  { timestamps: true }
);

learningPlanSchema.index({ user: 1, createdAt: -1 });

export const LearningPlan = model<ILearningPlan>("LearningPlan", learningPlanSchema);
