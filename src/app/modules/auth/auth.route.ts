import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", authController.userLogin);
router.post("/register", authController.registerPatient);

export const authRoutes = router;
