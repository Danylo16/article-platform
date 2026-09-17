import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";

import {
  dirname,
  resolve,
} from "node:path";

import {
  fileURLToPath,
} from "node:url";

import articlePublicRoutes from "./modules/articles/article.public.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  dirname(__filename);

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  const webOrigin =
    process.env.WEB_ORIGIN ??
    "http://localhost:5173";

  await app.register(cookie);

  await app.register(rateLimit, {
    global: false,
  });

  await app.register(cors, {
    origin: webOrigin,
    credentials: true,

    methods: [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(fastifyStatic, {
    root: resolve(
      __dirname,
      "../uploads",
    ),
    prefix: "/uploads/",
  });

  app.decorateRequest(
    "admin",
    null,
  );

  app.get(
    "/health",
    async () => ({
      status: "ok",
    }),
  );

  await app.register(
    articlePublicRoutes,
    {
      prefix: "/articles",
    },
  );

  await app.register(
    authRoutes,
    {
      prefix: "/auth",
    },
  );

  await app.register(
    adminRoutes,
    {
      prefix: "/admin",
    },
  );

  return app;
}