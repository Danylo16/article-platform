import type { FastifyInstance } from "fastify";

import {
  CreateLocationTypeSchema,
  UpdateLocationTypeSchema,
} from "./location-type.schema.js";
import {
  createLocationType,
  deleteLocationType,
  getAdminLocationTypes,
  updateLocationType,
} from "./location-type.service.js";

function handleMutationError(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  if (error.message === "LOCATION_TYPE_ALREADY_EXISTS") {
    return { status: 409, error: error.message };
  }

  if (error.message === "LOCATION_TYPE_IN_USE") {
    return { status: 409, error: error.message };
  }

  return null;
}

export default async function locationTypeRoutes(app: FastifyInstance) {
  app.get("/", async () => getAdminLocationTypes());

  app.post("/", async (request, reply) => {
    const parsed = CreateLocationTypeSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    try {
      return reply.status(201).send(await createLocationType(parsed.data));
    } catch (error) {
      const knownError = handleMutationError(error);

      if (knownError) {
        return reply.status(knownError.status).send({ error: knownError.error });
      }

      throw error;
    }
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = UpdateLocationTypeSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    try {
      return await updateLocationType(id, parsed.data);
    } catch (error) {
      const knownError = handleMutationError(error);

      if (knownError) {
        return reply.status(knownError.status).send({ error: knownError.error });
      }

      throw error;
    }
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await deleteLocationType(id);
      return reply.status(204).send();
    } catch (error) {
      const knownError = handleMutationError(error);

      if (knownError) {
        return reply.status(knownError.status).send({ error: knownError.error });
      }

      throw error;
    }
  });
}
