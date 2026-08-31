import { Router } from "express";
import * as skillController from "../controllers/skillController";
import { validate } from "../middleware/validate";
import { validateQuery } from "../middleware/validateQuery";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createSkillSchema,
  updateSkillSchema,
  searchSkillsQuerySchema,
} from "../validators/skillValidators";

const router = Router();

// Public — browse/search the marketplace
router.get("/", validateQuery(searchSkillsQuerySchema), skillController.searchSkills);
router.get("/:id", skillController.getSkill);

// Mentor-only — manage own listings
router.get(
  "/mentor/mine",
  requireAuth,
  requireRole("mentor", "admin"),
  skillController.myListings
);
router.post(
  "/",
  requireAuth,
  requireRole("mentor", "admin"),
  validate(createSkillSchema),
  skillController.createSkill
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("mentor", "admin"),
  validate(updateSkillSchema),
  skillController.updateSkill
);
router.delete("/:id", requireAuth, requireRole("mentor", "admin"), skillController.deleteSkill);

export default router;
