import { CookieOptions, Request, Response } from "express";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";

const isProd = envVars.NODE_ENV === "production";

const cookieOptions = (age: string) => {
  const ageInMs = ms(age as StringValue);

  const options: CookieOptions = {
    path: "/",
    signed: true,
    httpOnly: true,
    secure: isProd,
    maxAge: ageInMs,
    sameSite: "none",
  };

  return options;
};

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const getCookie = (req: Request, key: string) => {
  const cookie = req.signedCookies[key];
  return cookie;
};

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  setCookie,
  getCookie,
  clearCookie,
  cookieOptions,
};
