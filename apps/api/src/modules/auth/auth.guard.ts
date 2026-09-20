import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  ADMIN_SESSION_COOKIE,
  getAdminFromSessionToken,
  type AuthenticatedAdmin,
} from "./auth.service.js";

declare module "fastify" {
  interface FastifyRequest {
    admin: AuthenticatedAdmin | null;
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token =
    request.cookies[ADMIN_SESSION_COOKIE];

  if (!token) {
    return reply.status(401).send({
      error: "UNAUTHORIZED",
    });
  }

  const admin =
    await getAdminFromSessionToken(token);

  if (!admin) {
    reply.clearCookie(
      ADMIN_SESSION_COOKIE,
      {
        path: "/",
      },
    );

    return reply.status(401).send({
      error: "UNAUTHORIZED",
    });
  }

  request.admin = admin;
}

export async function verifyTrustedOrigin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (
    request.method === "GET" ||
    request.method === "HEAD" ||
    request.method === "OPTIONS"
  ) {
    return;
  }

  const origin = request.headers.origin;

  // Server-to-server calls may legitimately omit Origin.
  if (!origin) {
    return;
  }

  const trustedOrigin =
    process.env.WEB_ORIGIN ??
    "http://localhost:5173";

  if (origin !== trustedOrigin) {
    return reply.status(403).send({
      error: "INVALID_ORIGIN",
    });
  }
}