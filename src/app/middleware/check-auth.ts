import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { UserStatus } from "../../generated/prisma/enums";
import AppError from "../error-helpers/app-error";
import { prisma } from "../lib/prisma";
import { cookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth = (...authRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(req, "session_token");

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No session token provided.",
        );
      }

      if (sessionToken) {
        const sessionExists = await prisma.session.findUnique({
          where: {
            token: sessionToken,
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
        });

        if (!sessionExists) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! Invalid session token provided.",
          );
        }

        const user = sessionExists.user;

        const currentDate = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - currentDate.getTime();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining <= 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expire-At", expiresAt.toString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());

          console.log("Session Expiring Soon!");
        }

        if (
          user.status === UserStatus.BLOCKED ||
          user.status === UserStatus.DELETED
        ) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! user is not active.",
          );
        }

        if (user.isDeleted) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! user is not active.",
          );
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden access! You do not have permission to access this resource.",
          );
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          isDeleted: user.isDeleted,
          emailVerified: user.emailVerified,
        };
        //
      }

      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided.",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token provided.",
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
