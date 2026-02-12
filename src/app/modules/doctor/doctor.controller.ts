import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { doctorService } from "./doctor.service";

const getDoctors = catchAsync(async (req: Request, res: Response) => {
  const result = await doctorService.getDoctors();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctors fetched success!",
    data: result,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await doctorService.getDoctorById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor get success!",
    data: result,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await doctorService.updateDoctor(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor update success!",
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await doctorService.deleteDoctor(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor delete success!",
    data: result,
  });
});

export const doctorController = {
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
