import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { specialtyRoutes } from "../modules/specialty/specialty.route";
import { userRoutes } from "../modules/user/user.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/users", userRoutes);

export const indexRoutes = router;
