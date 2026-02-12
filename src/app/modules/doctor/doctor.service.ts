import { prisma } from "../../lib/prisma";
import { DoctorUpdatePayload } from "./doctor.interface";

const getDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      specialties: {
        select: {
          specialty: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          emailVerified: true,
        },
      },
    },
  });

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
