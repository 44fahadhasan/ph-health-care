import { Doctor } from "../../../generated/prisma/client";
import {
  DoctorInclude,
  DoctorWhereInput,
} from "../../../generated/prisma/models";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import { doctorConstant } from "./doctor.constant";
import { DoctorUpdatePayload } from "./doctor.interface";

export const getDoctors = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Doctor,
    DoctorWhereInput,
    DoctorInclude
  >(prisma.doctor, queryParams, doctorConstant.queryConfig);

  const doctors = await queryBuilder
    .where({
      isDeleted: false,
    })
    .search()
    .filter()
    .fields()
    .include({
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      specialties: {
        select: {
          specialty: {
            select: {
              title: true,
              icon: true,
            },
          },
        },
      },
    })
    .dynamicInclude(doctorConstant.dynamicIncludeConfig)
    .sort()
    .pagination()
    .execute();

  return doctors;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      specialties: {
        include: {
          specialty: true,
        },
      },
      user: true,
    },
  });

  return doctor;
};

// todo
const updateDoctor = async (id: string, payload: DoctorUpdatePayload) => {
  const doctor = await prisma.doctor.update({
    where: { id },
    data: payload,
  });

  return doctor;
};

const deleteDoctor = async (id: string) => {
  const doctor = await prisma.doctor.delete({
    where: { id },
  });

  return doctor;
};

export const doctorService = {
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
