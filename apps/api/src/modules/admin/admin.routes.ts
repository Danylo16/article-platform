import type { FastifyInstance } from "fastify";

import articleAdminRoutes from "../articles/article.admin.routes.js";
import categoryRoutes from "../categories/category.routes.js";
import tagRoutes from "../tags/tag.routes.js";
import authorRoutes from "../authors/author.routes.js";
import mediaRoutes from "../media/media.routes.js";

import {
  requireAdmin,
  verifyTrustedOrigin,
} from "../auth/auth.guard.js";

export default async function adminRoutes(
  app: FastifyInstance,
) {
  app.addHook(
    "preHandler",
    verifyTrustedOrigin,
  );

  app.addHook(
    "preHandler",
    requireAdmin,
  );

  await app.register(articleAdminRoutes, {
    prefix: "/articles",
  });

  await app.register(categoryRoutes, {
    prefix: "/categories",
  });

  await app.register(tagRoutes, {
    prefix: "/tags",
  });

  await app.register(authorRoutes, {
    prefix: "/authors",
  });

  await app.register(mediaRoutes, {
    prefix: "/media",
  });
}