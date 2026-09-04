import { Router } from "express";
import * as userController from "../controllers/userController";
import { validate } from "../middleware/validate";
import { validateQuery } from "../middleware/validateQuery";
import { requireAuth } from "../middleware/auth";
import { updateProfileSchema, nearbyQuerySchema, leaderboardQuerySchema, avatarUploadSchema } from "../validators/userValidators";

const router = Router();

router.get("/nearby", requireAuth, validateQuery(nearbyQuerySchema), userController.nearbyMentors);
router.get("/leaderboard", requireAuth, validateQuery(leaderboardQuerySchema), userController.leaderboard);
router.get("/me/gamification", requireAuth, userController.myGamification);
router.get("/:username", userController.getPublicProfile); // must stay after "/leaderboard" and "/me/gamification"

router.patch("/me", requireAuth, validate(updateProfileSchema), userController.updateProfile);
router.post("/me/avatar", requireAuth, validate(avatarUploadSchema), userController.uploadAvatar);
router.post("/:id/follow", requireAuth, userController.followUser);
router.delete("/:id/follow", requireAuth, userController.unfollowUser);

export default router;
