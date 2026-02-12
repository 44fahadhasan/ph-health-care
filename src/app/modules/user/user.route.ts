import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/register-doctor", userController.registerDoctor);

export const userRoutes = router;
