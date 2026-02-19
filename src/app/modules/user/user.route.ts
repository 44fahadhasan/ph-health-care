import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/check-auth";
import { validateRequest } from "../../middleware/validate-request";
import { userController } from "./user.controller";
import {
  registerAdminZodSchema,
  registerDoctorZodSchema,
} from "./user.validation";

const router = Router();

router.post(
  "/register-doctor",
  validateRequest(registerDoctorZodSchema),
  userController.registerDoctor,
);
router.post(
  "/register-admin",
  validateRequest(registerAdminZodSchema),
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  userController.registerAdmin,
);

export const userRoutes = router;
