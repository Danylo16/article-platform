import type { FastifyInstance } from "fastify";

import { UpdateSectionSchema } from "./section.schema.js";
import {
  getAdminSections,
  updateSection,
} from "./section.service.js";

export default async function sectionAdminRoutes(app: FastifyInstance) {
  app.get("/", async () => getAdminSections());

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = UpdateSectionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    return updateSection(id, parsed.data);
  });
}
