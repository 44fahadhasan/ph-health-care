import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.get("/", specialtyController.getSpecialty);
router.post("/", specialtyController.createSpecialty);
router.patch("/:id", specialtyController.updateSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);

export const specialtyRoutes = router;
