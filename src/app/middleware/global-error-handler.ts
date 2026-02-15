/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import z from "zod";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { envVars } from "../../config/env";
import AppError from "../error-helpers/app-error";
import { handleZodError } from "../error-helpers/handle-zod-error";
import { IErrorResponse, IErrorSource } from "../interfaces/error.interface";

export const globalError = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error("❌ [GLOBAL ERROR]", err);
  }

  if (req.file) {
    await deleteFileFromCloudinary(req.file.path);
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const urls = req.files.map((file) => file.path);

    await Promise.all(urls.map((url) => deleteFileFromCloudinary(url)));
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";
  let stack: string | undefined = undefined;
  let errorSources: IErrorSource[] = [];

  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError.statusCode!;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources!;
    stack = err.stack;

    //
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;

    //
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
  }

  const errorResponse: IErrorResponse = {
    success: false,
    message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
    error: envVars.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
