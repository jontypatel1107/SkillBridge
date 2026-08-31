import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Otp } from "../models/Otp";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { ApiError, ok } from "../utils/apiResponse";
import { LoginInput, RegisterInput, ForgotPasswordInput, VerifyOtpInput, ResetPasswordInput, ConfirmEmailInput } from "../validators/authValidators";
import { AuthedRequest } from "../middleware/auth";
import { generateOtp, sendOtpEmail } from "../services/emailService";

function issueTokens(userId: string, role: string) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId, role });
  return { accessToken, refreshToken };
}

function toUserResponse(user: any) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    skills: user.skills ?? [],
    interests: user.interests ?? [],
    languages: user.languages ?? [],
    isVerified: user.isVerified,
    isMentorApproved: user.isMentorApproved,
    rating: user.rating,
    ratingCount: user.ratingCount,
    links: user.links,
    hourlyPrice: user.hourlyPrice,
    availability: user.availability,
    createdAt: user.createdAt,
  };
}

export async function register(req: Request, res: Response) {
  const { name, username, email, password, role } = req.body as RegisterInput;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(409, "Email or username already in use");
  }

  const user = await User.create({ name, username, email, password, role });

  const { accessToken, refreshToken } = issueTokens(user._id.toString(), user.role);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return ok(
    res,
    {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    },
    201
  );
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password +refreshTokenHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.isSuspended) {
    throw new ApiError(403, "This account has been suspended");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = issueTokens(user._id.toString(), user.role);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return ok(res, {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken: string };

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    throw new ApiError(401, "Session no longer valid — please log in again");
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!matches) {
    throw new ApiError(401, "Session no longer valid — please log in again");
  }

  const tokens = issueTokens(user._id.toString(), user.role);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await user.save();

  return ok(res, tokens);
}

export async function logout(req: AuthedRequest, res: Response) {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
  }
  return ok(res, { message: "Logged out" });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return ok(res, { user });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as ForgotPasswordInput;

  const user = await User.findOne({ email });
  if (!user) {
    return ok(res, { message: "If an account exists with that email, an OTP has been sent." });
  }

  await Otp.deleteMany({ email, purpose: "forgot-password", used: false });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({ email, code, purpose: "forgot-password", expiresAt });
  await sendOtpEmail(email, code, "forgot-password");

  return ok(res, { message: "If an account exists with that email, an OTP has been sent." });
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, code, purpose } = req.body as VerifyOtpInput;

  const otp = await Otp.findOne({ email, purpose, used: false }).sort({ createdAt: -1 });
  if (!otp) {
    throw new ApiError(400, "No valid OTP found. Please request a new one.");
  }

  if (otp.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (otp.code !== code) {
    throw new ApiError(400, "Invalid OTP code.");
  }

  otp.used = true;
  await otp.save();

  return ok(res, { message: "OTP verified successfully." });
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body as ResetPasswordInput;

  const otp = await Otp.findOne({ email, purpose: "forgot-password", used: false }).sort({ createdAt: -1 });
  if (!otp) {
    throw new ApiError(400, "No valid OTP found. Please request a new one.");
  }

  if (otp.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (otp.code !== code) {
    throw new ApiError(400, "Invalid OTP code.");
  }

  const user = await User.findOne({ email }).select("+refreshTokenHash");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = newPassword;
  user.refreshTokenHash = null;
  await user.save();

  otp.used = true;
  await otp.save();

  return ok(res, { message: "Password reset successfully. Please log in with your new password." });
}

export async function verifyEmail(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    return ok(res, { message: "Email is already verified." });
  }

  await Otp.deleteMany({ email: user.email, purpose: "verify-email", used: false });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({ email: user.email, code, purpose: "verify-email", expiresAt });
  await sendOtpEmail(user.email, code, "verify-email");

  return ok(res, { message: "Verification OTP sent to your email." });
}

export async function confirmEmail(req: AuthedRequest, res: Response) {
  const { code } = req.body as ConfirmEmailInput;
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = await Otp.findOne({ email: user.email, purpose: "verify-email", used: false }).sort({ createdAt: -1 });
  if (!otp) {
    throw new ApiError(400, "No valid OTP found. Please request a new one.");
  }

  if (otp.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (otp.code !== code) {
    throw new ApiError(400, "Invalid OTP code.");
  }

  otp.used = true;
  await otp.save();

  user.isVerified = true;
  await user.save();

  return ok(res, { message: "Email verified successfully.", user });
}
