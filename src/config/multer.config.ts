import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v7 as uuidV7 } from "uuid";
import { toSafeFileName } from "../app/utils/safe-file-name";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const safeName = toSafeFileName(originalName);
    const uniqueName = `${safeName}-${uuidV7()}`;
    const folder = extension === "pdf" ? "pdfs" : "images";

    return {
      folder: `ph-healthcare/${folder}`,
      public_id: uniqueName,
      resource_type: "auto",
      overwrite: false,
    };
  },
});

export const multerUpload = multer({ storage });
