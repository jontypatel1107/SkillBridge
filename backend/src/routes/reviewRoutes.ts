import { Router } from "express";
import * as reviewController from "../controllers/reviewController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { createReviewSchema } from "../validators/reviewValidators";

const router = Router();

router.get("/mentor/:mentorId", reviewController.listMentorReviews);
router.post("/", requireAuth, validate(createReviewSchema), reviewController.createReview);

export default router;
