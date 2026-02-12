import status from "http-status";
import z from "zod";
import { IErrorResponse, IErrorSource } from "../interfaces/error.interface";

export const handleZodError = (err: z.ZodError): IErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod validation error";
  const errorSources: IErrorSource[] = [];

  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message,
    });
  });

  return {
    statusCode,
    success: false,
    message,
    errorSources,
  };
};
