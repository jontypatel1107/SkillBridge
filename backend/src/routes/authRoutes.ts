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

// Tighter limit on auth endpoints to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, validate(refreshSchema), authController.refresh);
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
