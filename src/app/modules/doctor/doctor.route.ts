import { Router } from "express";
import { doctorController } from "./doctor.controller";

const router = Router();

router.get("/", doctorController.getDoctors);
router.get("/:id", doctorController.getDoctorById);
router.patch("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deleteDoctor);

export const doctorRoutes = router;
