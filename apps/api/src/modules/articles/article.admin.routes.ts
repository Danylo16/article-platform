import type { FastifyInstance } from "fastify";

import {
  CreateArticleSchema,
  UpdateArticleSchema,
} from "./article.schema.js";

import {
  createArticle,
  deleteArticle,
  getAllAdminArticles,
  getArticleById,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from "./article.service.js";

export default async function articleAdminRoutes(
  app: FastifyInstance,
) {
  app.get("/", async () => {
    return getAllAdminArticles();
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const article = await getArticleById(id);

    if (!article) {
      return reply.status(404).send({
        error: "ARTICLE_NOT_FOUND",
      });
    }

    return article;
  });

  app.post("/", async (request, reply) => {
    const parsed = CreateArticleSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const article = await createArticle(parsed.data);

    return reply.status(201).send(article);
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const parsed = UpdateArticleSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const existingArticle = await getArticleById(id);

    if (!existingArticle) {
      return reply.status(404).send({
        error: "ARTICLE_NOT_FOUND",
      });
    }

    const article = await updateArticle(id, parsed.data);

    return reply.send(article);
  });

  app.post("/:id/publish", async (request, reply) => {
    const { id } = request.params as { id: string };

    const existingArticle = await getArticleById(id);

    if (!existingArticle) {
      return reply.status(404).send({
        error: "ARTICLE_NOT_FOUND",
      });
    }

    const article = await publishArticle(id);

    return reply.send(article);
  });

  app.post("/:id/unpublish", async (request, reply) => {
    const { id } = request.params as { id: string };

    const existingArticle = await getArticleById(id);

    if (!existingArticle) {
      return reply.status(404).send({
        error: "ARTICLE_NOT_FOUND",
      });
    }

    const article = await unpublishArticle(id);

    return reply.send(article);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const existingArticle = await getArticleById(id);

    if (!existingArticle) {
      return reply.status(404).send({
        error: "ARTICLE_NOT_FOUND",
      });
    }

    await deleteArticle(id);

    return reply.status(204).send();
  });
}