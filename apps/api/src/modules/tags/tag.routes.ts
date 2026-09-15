import type { FastifyInstance } from "fastify";
import { CreateTagSchema } from "./tag.schema.js";
import {
  createTag,
  getTags,
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

    const tag = await createTag(parsed.data);

    return reply.status(201).send(tag);
  });
}