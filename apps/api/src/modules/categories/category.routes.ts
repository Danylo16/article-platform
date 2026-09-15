import type { FastifyInstance } from "fastify";
import { CreateCategorySchema } from "./category.schema.js";
import {
  createCategory,
  getCategories,
} from "./category.service.js";

export default async function categoryRoutes(
  app: FastifyInstance,
) {
  app.get("/", async () => {
    return getCategories();
  });

  app.post("/", async (request, reply) => {
    const parsed = CreateCategorySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const category = await createCategory(parsed.data);

    return reply.status(201).send(category);
  });
}