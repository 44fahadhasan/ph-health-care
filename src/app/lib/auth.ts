import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { sendMail } from "../utils/email";
import { prisma } from "./prisma";

const sesExpInSec =
  ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue) / 1000;

const sesUpdateInSec =
  ms(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as StringValue) / 1000;

const cookieCacheInSec =
  ms(envVars.BETTER_AUTH_SESSION_TOKEN_COOKIE_CACHE_AGE as StringValue) / 1000;

export const auth = betterAuth({
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
        defaultValue: false,
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
});
