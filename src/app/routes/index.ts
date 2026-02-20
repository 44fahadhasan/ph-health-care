import { Router } from "express";
import { AdminRoutes } from "../modules/admin/admin.route";
import { AppointmentRoutes } from "../modules/appointment/appointment.route";
import { authRoutes } from "../modules/auth/auth.route";
import { doctorRoutes } from "../modules/doctor/doctor.route";
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";
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
router.use("/doctor-schedules", doctorScheduleRoutes);
router.use("/appointments", AppointmentRoutes);

export const indexRoutes = router;
