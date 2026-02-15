import { Router } from "express";
import { multerUpload } from "../../../config/multer.config";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/check-auth";
import { validateRequest } from "../../middleware/validate-request";
import { specialtyController } from "./specialty.controller";
import { specialtyValidation } from "./specialty.validation";

const router = Router();

router.get("/", specialtyController.getSpecialty);

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(specialtyValidation.createSpecialtyZodSchema),
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
