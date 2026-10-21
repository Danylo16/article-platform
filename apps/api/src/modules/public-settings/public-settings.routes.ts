import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const SettingsSchema = z.object({ categoriesEnabled: z.boolean() }).strict();

async function readSettings() {
  const settings = await prisma.publicSettings.findUnique({ where: { id: "site" } });
  return { categoriesEnabled: settings?.categoriesEnabled ?? true };
}

export async function publicSettingsRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return readSettings();
  });
}

// Registered beneath the existing /admin authentication and origin guards.
export async function adminPublicSettingsRoutes(app: FastifyInstance) {
  app.get("/", async () => readSettings());
  app.patch("/", async (request, reply) => {
    const parsed = SettingsSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "VALIDATION_ERROR" });
    const result = await prisma.publicSettings.upsert({
      where: { id: "site" },
      create: { id: "site", ...parsed.data },
      update: parsed.data,
    });
    return { categoriesEnabled: result.categoriesEnabled };
  });
}
