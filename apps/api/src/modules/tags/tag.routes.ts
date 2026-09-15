import type { FastifyInstance } from "fastify";
import {
  CreateTagSchema,
  UpdateTagSchema,
} from "./tag.schema.js";
import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "./tag.service.js";

export default async function tagRoutes(
  app: FastifyInstance,
) {
  app.get("/", async () => {
    return getTags();
  });

  app.post("/", async (request, reply) => {
    const parsed = CreateTagSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    try {
      const tag = await createTag(parsed.data);

      return reply.status(201).send(tag);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TAG_ALREADY_EXISTS"
      ) {
        return reply.status(409).send({
          error: "TAG_ALREADY_EXISTS",
        });
      }

      throw error;
    }
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = UpdateTagSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    try {
      return await updateTag(id, parsed.data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TAG_ALREADY_EXISTS"
      ) {
        return reply.status(409).send({
          error: "TAG_ALREADY_EXISTS",
        });
      }

      throw error;
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await deleteTag(id);

      return reply.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TAG_IN_USE"
      ) {
        return reply.status(409).send({
          error: "TAG_IN_USE",
          message: "Remove this tag from its articles before deleting it.",
        });
      }

      throw error;
    }
  });
}
