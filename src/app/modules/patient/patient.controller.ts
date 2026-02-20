import { Request, Response } from "express";
import status from "http-status";
import { IReqUser } from "../../interfaces/req-user.interface";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { PatientService } from "./patient.service";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const payload = req.body;

  const result = await PatientService.updateMyProfile(user, payload);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
};
