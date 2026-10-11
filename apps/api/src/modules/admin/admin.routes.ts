import type { FastifyInstance } from "fastify";

import articleAdminRoutes from "../articles/article.admin.routes.js";
import categoryRoutes from "../categories/category.routes.js";
import tagRoutes from "../tags/tag.routes.js";
import authorRoutes from "../authors/author.routes.js";
import mediaRoutes from "../media/media.routes.js";
import placeAdminRoutes from "../places/place.admin.routes.js";
import locationTypeRoutes from "../location-types/location-type.routes.js";
import geocodingRoutes from "../geocoding/geocoding.routes.js";
import sectionAdminRoutes from "../sections/section.admin.routes.js";

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

  await app.register(placeAdminRoutes, {
    prefix: "/places",
  });

  await app.register(locationTypeRoutes, {
    prefix: "/location-types",
  });

  await app.register(geocodingRoutes, {
    prefix: "/geocoding",
  });

  await app.register(sectionAdminRoutes, {
    prefix: "/sections",
  });
}
