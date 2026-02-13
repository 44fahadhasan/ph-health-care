import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/check-auth";
import { authController } from "./auth.controller";

const router = Router();

router.get(
  "/me",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  authController.getMe,
);
router.post("/login", authController.userLogin);
router.post("/register", authController.registerPatient);
router.post("/refresh-tokens", authController.refreshTokens);
router.post(
  "/change-password",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  authController.changePassword,
);
router.post(
  "/logout",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  authController.userLogout,
);

export const authRoutes = router;
