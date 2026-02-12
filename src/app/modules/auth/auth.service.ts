import { UserStatus } from "../../../generated/prisma/enums";
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
    throw new Error("Your account is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new Error("Your account is deleted");
  }

  return data;
};

const registerPatient = async (payload: IRegisterPatient) => {
  const data = await auth.api.signUpEmail({
    body: payload,
  });

  if (!data.user) {
    throw new Error("Failed to register patient");
  }

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

  return { ...data, patient };
};

export const authServices = {
  userLogin,
  registerPatient,
};
