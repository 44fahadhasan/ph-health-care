import { ScheduleInclude } from "../../../generated/prisma/models";
import { IQueryConfig } from "../../interfaces/query.interface";

const searchFields = ["id", "startDateTime", "endDateTime"];

const filterFields = ["id", "startDateTime", "endDateTime"];

const dynamicIncludeConfig: ScheduleInclude = {
  appointments: {
    include: {
      doctor: true,
      patient: true,
      payment: true,
      review: true,
      prescription: true,
    },
  },
  doctorSchedules: true,
};

export const scheduleConstant = {
  dynamicIncludeConfig,
  queryConfig: {
    searchFields,
    filterFields,
  } as IQueryConfig,
};
