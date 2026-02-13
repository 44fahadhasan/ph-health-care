import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
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
  },
  plugins: [bearer()],
  session: {
    expiresIn: sesExpInSec,
    updateAge: sesUpdateInSec,
    cookieCache: {
      enabled: true,
      maxAge: cookieCacheInSec,
    },
  },
});
