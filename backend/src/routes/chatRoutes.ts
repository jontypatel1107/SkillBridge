import { Router } from "express";
import * as chatController from "../controllers/chatController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/conversations", chatController.listConversations);
router.get("/conversations/:userId", chatController.getConversation);

export default router;
