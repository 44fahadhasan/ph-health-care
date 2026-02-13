import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/check-auth";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.get("/", specialtyController.getSpecialty);

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  specialtyController.createSpecialty,
);
router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  specialtyController.updateSpecialty,
);
router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  specialtyController.deleteSpecialty,
);

export const specialtyRoutes = router;
