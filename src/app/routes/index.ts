import { Router } from "express";
import { AdminRoutes } from "../modules/admin/admin.route";
import { authRoutes } from "../modules/auth/auth.route";
import { doctorRoutes } from "../modules/doctor/doctor.route";
import { scheduleRoutes } from "../modules/schedule/schedule.route";
import { specialtyRoutes } from "../modules/specialty/specialty.route";
import { userRoutes } from "../modules/user/user.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/admins", AdminRoutes);
router.use("/schedules", scheduleRoutes);

export const indexRoutes = router;
