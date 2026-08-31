import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "student" | "mentor" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  languages: string[];
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    city?: string;
  };
  rating: number;
  ratingCount: number;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  isVerified: boolean;
  isSuspended: boolean;
  refreshTokenHash?: string | null;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
    },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 300 },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: { type: [Number], default: undefined },
      city: { type: String },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    refreshTokenHash: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", userSchema);
