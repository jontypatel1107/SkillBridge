import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  confirmEmailSchema,
} from "../validators/authValidators";

const router = Router();

// Tighter limit on credential-type endpoints to slow down brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Generous limit for refresh because the client rotates the access token every ~14 min
// plus on any 401; too tight a limit would knock valid users into forced re-login.
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", refreshLimiter, validate(refreshSchema), authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

// Password reset flow
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-otp", authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Email verification flow
router.post("/verify-email", authLimiter, requireAuth, authController.verifyEmail);
router.post("/confirm-email", authLimiter, requireAuth, validate(confirmEmailSchema), authController.confirmEmail);

export default router;
