import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSession,
  revokeAdminSession,
  verifyAdminCredentials,
} from "./auth.service.js";

import {
  requireAdmin,
  verifyTrustedOrigin,
} from "./auth.guard.js";

const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254),

  password: z
    .string()
    .min(1)
    .max(512),
});

function cookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
}

export default async function authRoutes(
  app: FastifyInstance,
) {
  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },

      preHandler: verifyTrustedOrigin,
    },
    async (request, reply) => {
      reply.header(
        "Cache-Control",
        "no-store",
      );

      const parsed =
        LoginSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "INVALID_REQUEST",
        });
      }

      const admin =
        await verifyAdminCredentials(
          parsed.data.email,
          parsed.data.password,
        );

      if (!admin) {
        return reply.status(401).send({
          error: "INVALID_CREDENTIALS",
        });
      }

      const oldToken =
        request.cookies[
          ADMIN_SESSION_COOKIE
        ];

      if (oldToken) {
        await revokeAdminSession(oldToken);
      }

      const session =
        await createAdminSession(admin.id);

      reply.setCookie(
        ADMIN_SESSION_COOKIE,
        session.token,
        {
          ...cookieOptions(),

          maxAge:
            ADMIN_SESSION_MAX_AGE_SECONDS,

          expires:
            session.expiresAt,
        },
      );

      return {
        user: admin,
      };
    },
  );

  app.get(
    "/me",
    {
      preHandler: requireAdmin,
    },
    async (request, reply) => {
      reply.header(
        "Cache-Control",
        "no-store",
      );

      return {
        user: request.admin,
      };
    },
  );

  app.post(
  "/logout",
  {
    preHandler: verifyTrustedOrigin,
  },
  async (request, reply) => {
    const token =
      request.cookies[
        ADMIN_SESSION_COOKIE
      ];

    if (token) {
      await revokeAdminSession(token);
    }

    reply.clearCookie(
      ADMIN_SESSION_COOKIE,
      cookieOptions(),
    );

    return reply.status(204).send();
  },
);
}