import type { FastifyInstance } from "fastify";

import { getPublicPlaces } from "./place.service.js";

export default async function placePublicRoutes(app: FastifyInstance) {
  app.get("/", async () => getPublicPlaces());
}
