import { betterAuth, CookieOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { Role } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { sendMail } from "../utils/email";
import { UserStatus } from "./../../generated/prisma/enums";
import { prisma } from "./prisma";

const sesExpInSec =
  ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue) / 1000;

const sesUpdateInSec =
  ms(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as StringValue) / 1000;

const cookieCacheInSec =
  ms(envVars.BETTER_AUTH_SESSION_TOKEN_COOKIE_CACHE_AGE as StringValue) / 1000;

const cookieOption = cookieUtils.cookieOptions(
  envVars.ACCESS_TOKEN_EXPIRES_IN,
) as CookieOptions;

export const auth = betterAuth({
  appName: "My App",
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: () => ({
        role: Role.PATIENT,
        needPasswordChange: false,
      }),
    },
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && !user.emailVerified) {
            sendMail({
              to: email,
              subject: "Verify your mail",
              templateName: "verify-email",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }

        if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            sendMail({
              to: email,
              subject: "Forget your password",
              templateName: "forget-password",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }
      },
      expiresIn: 5 * 60,
      otpLength: 5,
    }),
  ],
  session: {
    expiresIn: sesExpInSec,
    updateAge: sesUpdateInSec,
    cookieCache: {
      enabled: true,
      maxAge: cookieCacheInSec,
    },
  },
  trustedOrigins: [envVars.BETTER_AUTH_URL, envVars.FRONT_END_URL],
  advanced: {
    cookiePrefix: "my-app",
    useSecureCookies: true,
    defaultCookieAttributes: cookieOption,
  },
});
