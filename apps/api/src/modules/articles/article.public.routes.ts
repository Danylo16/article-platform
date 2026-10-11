import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  getAllArticles,
  getPublishedArticleBySlug,
} from "./article.service.js";

const ArticleListQuerySchema = z.object({
  section: z.string().trim().min(1).max(80).optional(),
});

export default async function articlePublicRoutes(
  app: FastifyInstance,
) {
  app.get("/", async (request, reply) => {
    const parsed = ArticleListQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    return getAllArticles(parsed.data.section);
  });

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const article = await getPublishedArticleBySlug(slug);

    if (!article) {
      return reply.status(404).send({
        error: "ARTICLE_NOT_FOUND",
      });
    }

    return article;
  });
}
