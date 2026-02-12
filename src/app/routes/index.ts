import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { specialtyRoutes } from "../modules/specialty/specialty.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);

export const indexRoutes = router;
