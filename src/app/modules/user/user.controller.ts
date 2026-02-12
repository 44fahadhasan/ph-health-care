import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { userServices } from "./user.service";

const registerDoctor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await userServices.registerDoctor(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Doctor register success!",
    data: result,
  });
});

export const userController = {
  registerDoctor,
};
