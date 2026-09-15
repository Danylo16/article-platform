import type { FastifyInstance } from "fastify";
import { getAuthors } from "./author.service.js";

export default async function authorRoutes(
  app: FastifyInstance,
) {
  app.get("/", async () => {
    return getAuthors();
  });
}