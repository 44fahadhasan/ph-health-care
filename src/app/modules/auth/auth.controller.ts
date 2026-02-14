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

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const currentSessionToken = cookieUtils.getCookie(req, "session_token");

  if (!currentSessionToken) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! No session token provided.",
    );
  }

  const result = await authServices.changePassword(
    payload,
    currentSessionToken,
  );

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenToCookie(res, accessToken);
  tokenUtils.setRefreshTokenToCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionTokenToCookie(res, token!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed success!",
    data: result,
  });
});

const userLogout = catchAsync(async (req: Request, res: Response) => {
  const currentSessionToken = cookieUtils.getCookie(req, "session_token");

  if (!currentSessionToken) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! No session token provided.",
    );
  }

  const result = await authServices.userLogout(currentSessionToken);

  tokenUtils.clearAccessTokenFromCookie(res);
  tokenUtils.clearRefreshTokenFromCookie(res);
  tokenUtils.clearBetterAuthSessionTokenFromCookie(res);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logout success!",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  await authServices.verifyEmail(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verify success!",
  });
});

const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authServices.requestPasswordReset(email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset otp send success!",
  });
});

const passwordReset = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  await authServices.passwordReset(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset success!",
  });
});

export const authController = {
  userLogin,
  registerPatient,
  getMe,
  refreshTokens,
  changePassword,
  userLogout,
  verifyEmail,
  requestPasswordReset,
  passwordReset,
};
