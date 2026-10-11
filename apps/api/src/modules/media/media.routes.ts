import type { FastifyInstance } from "fastify";

import {
  MediaStorageConfigurationError,
  saveImage,
} from "./media.service.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default async function mediaRoutes(
  app: FastifyInstance,
) {
  app.post("/", async (request, reply) => {
    const file = await request.file({
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
      },
    });

    if (!file) {
      return reply.status(400).send({
        error: "FILE_REQUIRED",
      });
    }

    try {
      const buffer = await file.toBuffer();

      const result = await saveImage(
        file.filename,
        file.mimetype,
        buffer,
      );

      return reply.status(201).send({
        ...result,
        mimeType: file.mimetype,
        size: buffer.length,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "UNSUPPORTED_MEDIA_TYPE"
      ) {
        return reply.status(415).send({
          error: "UNSUPPORTED_MEDIA_TYPE",
        });
      }

      if (
        error instanceof Error &&
        error.message ===
          "INVALID_FILE_EXTENSION"
      ) {
        return reply.status(400).send({
          error: "INVALID_FILE_EXTENSION",
        });
      }

      if (error instanceof MediaStorageConfigurationError) {
        request.log.error(
          { err: error },
          "Media storage configuration is invalid",
        );

        return reply.status(503).send({
          error: "MEDIA_STORAGE_UNAVAILABLE",
        });
      }

      throw error;
    }
  });
}
