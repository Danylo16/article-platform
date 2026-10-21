import { buildApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be between 1 and 65535");
const app = await buildApp();
await app.listen({ port, host: process.env.API_HOST ?? "0.0.0.0" });
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => { await app.close(); await prisma.$disconnect(); });
}
