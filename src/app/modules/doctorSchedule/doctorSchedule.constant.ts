import { DoctorScheduleInclude } from "../../../generated/prisma/models";
import { IQueryConfig } from "../../interfaces/query.interface";

export const searchFields = ["id", "doctorId", "scheduleId"];

export const filterFields = [
  "id",
  "doctorId",
  "scheduleId",
  "createdAt",
  "updatedAt",
  "isBooked",
  "schedule.startDateTime",
  "schedule.endDateTime",
];

export const dynamicIncludeConfig: DoctorScheduleInclude = {
  doctor: {
    include: {
      user: true,
      appointments: true,
      specialties: true,
    },
  },
  schedule: true,
};

export const doctorScheduleConstant = {
  dynamicIncludeConfig,
  queryConfig: {
    searchFields,
    filterFields,
  } as IQueryConfig,
};
