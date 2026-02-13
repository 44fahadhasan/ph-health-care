import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../error-helpers/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { cookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { authServices } from "./auth.service";

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await authServices.userLogin(payload);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Login success!",
    data: result,
  });
});

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await authServices.registerPatient(payload);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token!);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Patient register success!",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await authServices.getMe(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User get success!",
    data: result,
  });
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const currentSessionToken = cookieUtils.getCookie(req, "session_token");
  const currentRefreshToken = cookieUtils.getCookie(req, "refreshToken");

  if (!currentSessionToken) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! No session token provided.",
    );
  }

  if (!currentRefreshToken) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! No refresh token provided.",
    );
  }

  const result = await authServices.refreshTokens(
    currentSessionToken,
    currentRefreshToken,
  );

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Refresh tokens success!",
    data: result,
  });
});

export const authController = {
  userLogin,
  registerPatient,
  getMe,
  refreshTokens,
};
