import type { FastifyInstance } from "fastify";
import { ReorderSchema } from "./order.schema.js";
import { reorder } from "./order.service.js";

export function registerReorder(app: FastifyInstance, resource: "sections" | "location-types") {
  app.post("/reorder", async (request, reply) => {
    const parsed = ReorderSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "VALIDATION_ERROR" });
    try {
      await reorder(resource, parsed.data.ids, parsed.data.expectedIds);
      return reply.status(204).send();
    } catch (error) {
      if ((error instanceof Error && error.message === "ORDER_CONFLICT") ||
          (typeof error === "object" && error !== null && "code" in error && error.code === "P2034")) {
        return reply.status(409).send({ error: "ORDER_CONFLICT" });
      }
      throw error;
    }
  });
}
