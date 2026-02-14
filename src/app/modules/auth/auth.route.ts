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
router.post("/verify-email", authController.verifyEmail);
router.post("/refresh-tokens", authController.refreshTokens);
router.post(
  "/change-password",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  authController.changePassword,
);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password", authController.passwordReset);
router.post(
  "/logout",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  authController.userLogout,
);

router.get("/login/google", authController.googleLogin);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/oauth/error", authController.handleOAuthError);

export const authRoutes = router;
