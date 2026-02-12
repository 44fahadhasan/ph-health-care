import status from "http-status";
import { Role } from "../../../generated/prisma/client";
import AppError from "../../error-helpers/app-error";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterDoctorPayload } from "./user.interface";

const registerDoctor = async (payload: IRegisterDoctorPayload) => {
  const specialties: { id: string }[] = [];

  for (const specialtyId of payload.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId },
      select: { id: true },
    });

    if (!specialty) {
      throw new AppError(
        status.NOT_FOUND,
        `Specialty not found with id: ${specialtyId}`,
      );
    }

    specialties.push(specialty);
  }

  const newUser = await auth.api.signUpEmail({
    body: {
      name: payload.doctor.name,
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      needPasswordChange: true,
    },
  });

  if (!newUser.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register doctor");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newDoctor = await tx.doctor.create({
        data: {
          userId: newUser.user.id,
          ...payload.doctor,
        },
      });

      const doctorSpecialtyData = specialties.map(
        (specialty: { id: string }) => ({
          doctorId: newDoctor.id,
          specialtyId: specialty.id,
        }),
      );

      await tx.doctorSpecialty.createMany({
        data: doctorSpecialtyData,
      });

      const doctor = tx.doctor.findUnique({
        where: {
          id: newDoctor.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
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
              image: true,
              role: true,
              status: true,
              isDeleted: true,
              deletedAt: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return doctor;
    });

    return result;
  } catch (error) {
    await prisma.user.delete({
      where: { id: newUser.user.id },
    });

    throw error;
  }
};

export const userServices = {
  registerDoctor,
};
