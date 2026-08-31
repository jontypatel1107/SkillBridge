import { Schema, model, Document } from "mongoose";

export type OtpPurpose = "forgot-password" | "verify-email";

export interface IOtp extends Document {
  email: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  used: boolean;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ["forgot-password", "verify-email"], required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 });

export const Otp = model<IOtp>("Otp", otpSchema);
