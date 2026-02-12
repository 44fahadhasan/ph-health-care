import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { userController } from "./user.controller";
import { registerDoctorZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register-doctor",
  validateRequest(registerDoctorZodSchema),
  userController.registerDoctor,
);

export const userRoutes = router;
