import type { FastifyInstance } from "fastify";

import { GeocodeAddressSchema } from "./geocoding.schema.js";
import { geocodeAddress } from "./geocoding.service.js";

export default async function geocodingRoutes(app: FastifyInstance) {
  app.post(
    "/address",
    {
      config: {
        rateLimit: {
          max: 1,
          timeWindow: "1 second",
        },
      },
    },
    async (request, reply) => {
      const parsed = GeocodeAddressSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({ error: "VALIDATION_ERROR" });
      }

      try {
        return await geocodeAddress(parsed.data.address);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        if (error.message === "GEOCODING_NOT_FOUND") {
          return reply.status(404).send({ error: error.message });
        }

        if (error.message === "GEOCODING_PROVIDER_ERROR") {
          return reply.status(502).send({ error: error.message });
        }

        throw error;
      }
    },
  );
}
