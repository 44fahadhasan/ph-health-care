import { DoctorSchedule } from "../../../generated/prisma/client";
import {
  DoctorScheduleInclude,
  DoctorScheduleWhereInput,
} from "../../../generated/prisma/models";
import { IQueryParams } from "../../interfaces/query.interface";
import { IReqUser } from "../../interfaces/req-user.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import { doctorScheduleConstant } from "./doctorSchedule.constant";
import {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "./doctorSchedule.interface";

const createMyDoctorSchedule = async (
  user: IReqUser,
  payload: ICreateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  await prisma.doctorSchedule.createMany({
    data: doctorScheduleData,
  });

  const result = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: {
        in: payload.scheduleIds,
      },
    },
    include: {
      schedule: true,
    },
  });

  return result;
};

const getMyDoctorSchedules = async (user: IReqUser, query: IQueryParams) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const queryBuilder = new QueryBuilder<
    DoctorSchedule,
    DoctorScheduleWhereInput,
    DoctorScheduleInclude
  >(
    prisma.doctorSchedule,
    {
      doctorId: doctorData.id,
      ...query,
    },
    doctorScheduleConstant.queryConfig,
  );
  const doctorSchedules = await queryBuilder
    .search()
    .filter()
    .pagination()
    .include({
      schedule: true,
      doctor: {
        include: {
          user: true,
        },
      },
    })
    .sort()
    .fields()
    .dynamicInclude(doctorScheduleConstant.dynamicIncludeConfig)
    .execute();
  return doctorSchedules;
};

const getAllDoctorSchedules = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    DoctorSchedule,
    DoctorScheduleWhereInput,
    DoctorScheduleInclude
  >(prisma.doctorSchedule, query, doctorScheduleConstant.queryConfig);

  const result = await queryBuilder
    .search()
    .filter()
    .pagination()
    .dynamicInclude(doctorScheduleConstant.dynamicIncludeConfig)
    .sort()
    .execute();

  return result;
};

const getDoctorScheduleById = async (doctorId: string, scheduleId: string) => {
  const doctorSchedule = await prisma.doctorSchedule.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorId,
        scheduleId: scheduleId,
      },
    },
    include: {
      schedule: true,
      doctor: true,
    },
  });
  return doctorSchedule;
};

const updateMyDoctorSchedule = async (
  user: IReqUser,
  payload: IUpdateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const deleteIds = payload.scheduleIds
    .filter((schedule) => schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const createIds = payload.scheduleIds
    .filter((schedule) => !schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.doctorSchedule.deleteMany({
      where: {
        isBooked: false,
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });

    const doctorScheduleData = createIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId,
    }));

    const result = await tx.doctorSchedule.createMany({
      data: doctorScheduleData,
    });

    return result;
  });

  return result;
};

const deleteMyDoctorSchedule = async (id: string, user: IReqUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  await prisma.doctorSchedule.deleteMany({
    where: {
      isBooked: false,
      doctorId: doctorData.id,
      scheduleId: id,
    },
  });
};

export const DoctorScheduleService = {
  createMyDoctorSchedule,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
  getMyDoctorSchedules,
};
