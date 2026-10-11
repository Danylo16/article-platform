import type { FastifyInstance } from "fastify";

import {
  CreatePlaceSchema,
  UpdatePlaceSchema,
} from "./place.schema.js";
import {
  createPlace,
  deletePlace,
  getAdminPlaces,
  updatePlace,
} from "./place.service.js";

export default async function placeAdminRoutes(app: FastifyInstance) {
  app.get("/", async () => getAdminPlaces());

  app.post("/", async (request, reply) => {
    const parsed = CreatePlaceSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    try {
      const place = await createPlace(parsed.data);
      return reply.status(201).send(place);
    } catch (error) {
      if (error instanceof Error && error.message === "LOCATION_TYPE_NOT_FOUND") {
        return reply.status(400).send({ error: "LOCATION_TYPE_NOT_FOUND" });
      }

      if (error instanceof Error && error.message === "PLACE_ALREADY_EXISTS") {
        return reply.status(409).send({ error: "PLACE_ALREADY_EXISTS" });
      }

      throw error;
    }
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = UpdatePlaceSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    try {
      return await updatePlace(id, parsed.data);
    } catch (error) {
      if (error instanceof Error && error.message === "LOCATION_TYPE_NOT_FOUND") {
        return reply.status(400).send({ error: "LOCATION_TYPE_NOT_FOUND" });
      }

      if (error instanceof Error && error.message === "PLACE_ALREADY_EXISTS") {
        return reply.status(409).send({ error: "PLACE_ALREADY_EXISTS" });
      }

      throw error;
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await deletePlace(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "PLACE_IN_USE") {
        return reply.status(409).send({
          error: "PLACE_IN_USE",
          message: "Detach this place from its articles before deleting it.",
        });
      }

      throw error;
    }
  });
}
