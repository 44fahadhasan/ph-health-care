/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import status from "http-status";
import { v7 as uuidV7 } from "uuid";
import AppError from "../app/error-helpers/app-error";
import { getCloudinaryPublicId } from "../app/utils/get-cloudinary-public-id";
import { toSafeFileName } from "../app/utils/safe-file-name";
import { envVars } from "./env";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileFromCloudinary = (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "File name and buffer are required",
    );
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  const safeName = toSafeFileName(fileName);
  const uniqueName = `${safeName}-${uuidV7()}`;
  const folder = extension === "pdf" ? "pdfs" : "images";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        overwrite: false,
        resource_type: "auto",
        public_id: uniqueName,
        folder: `ph-healthcare/${folder}`,
      },
      (error, result) => {
        if (error) {
          const message =
            error.message || "Failed to upload file to Cloudinary";
          return reject(new AppError(status.INTERNAL_SERVER_ERROR, message));
        }
        resolve(result as UploadApiResponse);
      },
    );

    stream.end(buffer);
  });
};

export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const publicId = getCloudinaryPublicId(url);

    if (!publicId) {
      throw new AppError(status.NOT_FOUND, "Cloudinary public id is required.");
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (envVars.NODE_ENV === "development") {
      console.log(
        `🗑️  [Cloudinary] File successfully deleted | Public ID: ${publicId}`,
      );
    }
  } catch (error: any) {
    const message = error.message || "Failed to delete form cloudinary";
    throw new AppError(status.INTERNAL_SERVER_ERROR, message);
  }
};

export const cloudinaryUpload = cloudinary;
