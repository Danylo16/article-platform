import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({
    path: resolve(__dirname, "../../.env"),
});
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}
const adapter = new PrismaPg({
    connectionString,
});
export const prisma = new PrismaClient({
    adapter,
});
//# sourceMappingURL=prisma.js.map