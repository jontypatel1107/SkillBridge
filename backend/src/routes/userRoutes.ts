import { Router } from "express";
import * as userController from "../controllers/userController";
import { validate } from "../middleware/validate";
import { validateQuery } from "../middleware/validateQuery";
import { requireAuth } from "../middleware/auth";
import { updateProfileSchema, nearbyQuerySchema } from "../validators/userValidators";

const router = Router();

router.get("/nearby", requireAuth, validateQuery(nearbyQuerySchema), userController.nearbyMentors);
router.get("/:username", userController.getPublicProfile);

router.patch("/me", requireAuth, validate(updateProfileSchema), userController.updateProfile);
router.post("/:id/follow", requireAuth, userController.followUser);
router.delete("/:id/follow", requireAuth, userController.unfollowUser);

export default router;
