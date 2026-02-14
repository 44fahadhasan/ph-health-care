import status from "http-status";
import ms, { StringValue } from "ms";
import { envVars } from "../../../config/env";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../error-helpers/app-error";
import { IReqUser } from "../../interfaces/req-user.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import {
  IChangePasswordPayload,
  IPasswordRest,
  IRegisterPatient,
  IUserLogin,
  IVerifyEmail,
} from "./auth.interface";

const getMe = (user: IReqUser) => {
  const userExists = prisma.user.findUnique({
    where: {
      id: user.id,
      isDeleted: false,
    },
    include: {
      patient: true,
      doctor: true,
      accounts: true,
      sessions: true,
    },
  });

  if (!userExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return userExists;
};

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

  const tokenPayload: IReqUser = {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  return {
    ...data,
    accessToken,
    refreshToken,
  };
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

    const tokenPayload: IReqUser = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    };

    const accessToken = tokenUtils.generateAccessToken(tokenPayload);
    const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

    return {
      ...data,
      ...patient,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    await prisma.user.delete({
      where: { id: data.user.id },
    });

    throw error;
  }
};

const refreshTokens = async (
  currentSessionToken: string,
  currentRefreshToken: string,
) => {
  const sessionTokenExists = await prisma.session.findUnique({
    where: {
      token: currentSessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!sessionTokenExists) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! Invalid session token provided.",
    );
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    currentRefreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! Invalid refresh token provided.",
    );
  }

  const user = sessionTokenExists.user;

  const tokenPayload: IReqUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  const sesExpInMs = ms(
    envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue,
  );
  const newExpDate = new Date(Date.now() + sesExpInMs);

  const session = await prisma.session.update({
    where: {
      token: currentSessionToken,
    },
    data: {
      expiresAt: newExpDate,
      updatedAt: new Date(),
    },
    select: {
      token: true,
    },
  });

  return {
    ...session,
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! Invalid session token provided.",
    );
  }

  const result = await auth.api.changePassword({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
    body: {
      revokeOtherSessions: true,
      newPassword: payload.newPassword,
      currentPassword: payload.currentPassword,
    },
  });

  const user = session.user;

  if (user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const tokenPayload: IReqUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const userLogout = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const verifyEmail = async (payload: IVerifyEmail) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email: payload.email,
      otp: payload.otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

const requestPasswordReset = async (email: string) => {
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!userExists) {
    throw new AppError(
      status.NOT_FOUND,
      "Your account not found with this email",
    );
  }

  if (!userExists.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (userExists.isDeleted || userExists.status == "DELETED") {
    throw new AppError(status.BAD_REQUEST, "Your account was deleted");
  }

  if (userExists.status == "BLOCKED") {
    throw new AppError(status.BAD_REQUEST, "Your account was blocked");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: { email },
  });
};

const passwordReset = async (payload: IPasswordRest) => {
  const userExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userExists) {
    throw new AppError(
      status.NOT_FOUND,
      "Your account not found with this email",
    );
  }

  if (!userExists.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (userExists.isDeleted || userExists.status == "DELETED") {
    throw new AppError(status.BAD_REQUEST, "Your account was deleted");
  }

  if (userExists.status == "BLOCKED") {
    throw new AppError(status.BAD_REQUEST, "Your account was blocked");
  }

  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email: payload.email,
      otp: payload.otp,
      password: payload.newPassword,
    },
  });

  if (!result) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to your password reset!",
    );
  }

  if (userExists.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: userExists.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: userExists.id,
    },
  });
};

export const authServices = {
  getMe,
  userLogin,
  registerPatient,
  refreshTokens,
  changePassword,
  userLogout,
  verifyEmail,
  requestPasswordReset,
  passwordReset,
};
