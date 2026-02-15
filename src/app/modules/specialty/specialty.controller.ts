import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { specialtyService } from "./specialty.service";

const getSpecialty = catchAsync(async (req: Request, res: Response) => {
  const result = await specialtyService.getSpecialty();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Specialties fetched success!",
    data: result,
  });
});

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    icon: req.file?.path,
  };

  const result = await specialtyService.createSpecialty(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Specialty create success!",
    data: result,
  });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await specialtyService.updateSpecialty(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Specialty update success!",
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await specialtyService.deleteSpecialty(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Specialty delete success!",
    data: result,
  });
});

export const specialtyController = {
  getSpecialty,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
