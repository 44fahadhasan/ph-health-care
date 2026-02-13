import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { cookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";

const generateAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.generateToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );

  return accessToken;
};

const generateRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.generateToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );

  return refreshToken;
};

const setAccessTokenToCookie = (res: Response, token: string) => {
  const key = "accessToken";
  const options = cookieUtils.cookieOptions(envVars.ACCESS_TOKEN_EXPIRES_IN);

  cookieUtils.setCookie(res, key, token, options);
};

const setRefreshTokenToCookie = (res: Response, token: string) => {
  const key = "refreshToken";
  const options = cookieUtils.cookieOptions(envVars.REFRESH_TOKEN_EXPIRES_IN);

  cookieUtils.setCookie(res, key, token, options);
};

const setBetterAuthSessionTokenToCookie = (res: Response, token: string) => {
  const key = "session_token";
  const options = cookieUtils.cookieOptions(
    envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
  );

  cookieUtils.setCookie(res, key, token, options);
};

export const tokenUtils = {
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenToCookie,
  setRefreshTokenToCookie,
  setBetterAuthSessionTokenToCookie,
};
