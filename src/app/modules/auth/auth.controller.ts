import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { authServices } from "./auth.service";

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await authServices.userLogin(payload);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Login success!",
    data: result,
  });
});

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await authServices.registerPatient(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Patient register success!",
    data: result,
  });
});

export const authController = {
  userLogin,
  registerPatient,
};
