import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { validate } from "../middleware/validate";
import { requireAuth, requireRole } from "../middleware/auth";
import { setSuspendedSchema } from "../validators/adminValidators";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", adminController.listUsers);
router.patch("/users/:id/verify-mentor", adminController.verifyMentor);
router.patch("/users/:id/suspend", validate(setSuspendedSchema), adminController.setSuspended);
router.get("/analytics", adminController.analytics);

export default router;
