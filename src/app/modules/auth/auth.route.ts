import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/check-auth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", authController.userLogin);
router.post("/register", authController.registerPatient);
router.get(
  "/me",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  authController.getMe,
);
router.post("/refresh-tokens", authController.refreshTokens);

export const authRoutes = router;
