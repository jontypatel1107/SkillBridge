import { Router } from "express";
import * as aiController from "../controllers/aiController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { generateRoadmapSchema, chatSummarySchema } from "../validators/aiValidators";

const router = Router();

router.use(requireAuth);

router.post("/roadmap", validate(generateRoadmapSchema), aiController.generateRoadmap);
router.get("/roadmap/mine", aiController.listMyRoadmaps);
router.post("/chat-summary", validate(chatSummarySchema), aiController.chatSummary);
router.get("/recommend-mentors", aiController.recommendMentors);
router.get("/suggest-skills", aiController.suggestSkills);

export default router;
