import { DoctorInclude } from "../../../generated/prisma/models";
import { IQueryConfig } from "../../interfaces/query.interface";

const searchFields: string[] = [
  "name",
  "email",
  "user.email",
  "registrationNumber",
  "specialties.specialty.title",
];

const filterFields: string[] = [
  "gender",
  "isDeleted",
  "experience",
  "averageRating",
  "specialties.doctorId",
  "specialties.specialtyId",
  "specialties.specialty.title",
];

const dynamicIncludeConfig: DoctorInclude = {
  user: true,
  specialties: true,
};

export const doctorConstant = {
  dynamicIncludeConfig,
  queryConfig: {
    searchFields,
    filterFields,
  } as IQueryConfig,
};
