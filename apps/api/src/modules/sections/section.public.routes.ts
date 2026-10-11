import type { FastifyInstance } from "fastify";

import { getVisibleSections } from "./section.service.js";

export default async function sectionPublicRoutes(app: FastifyInstance) {
  app.get("/", async () => getVisibleSections());
}
