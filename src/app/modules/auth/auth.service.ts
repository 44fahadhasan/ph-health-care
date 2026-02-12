import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../error-helpers/app-error";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatient {
  name: string;
  email: string;
  password: string;
}

interface IUserLogin {
  email: string;
  password: string;
}

const userLogin = async (payload: IUserLogin) => {
  const data = await auth.api.signInEmail({
    body: payload,
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "Your account is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "Your account is deleted");
  }

  return data;
};

const registerPatient = async (payload: IRegisterPatient) => {
  const data = await auth.api.signUpEmail({
    body: payload,
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }

  try {
    const patient = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });

      return patientTx;
    });

    return {
      ...data,
      patient,
    };
  } catch (error) {
    await prisma.user.delete({
      where: { id: data.user.id },
    });

    throw error;
  }
};

export const authServices = {
  userLogin,
  registerPatient,
};
