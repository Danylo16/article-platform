import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(__dirname, "../.env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const existingAuthor = await prisma.author.findFirst();

  if (existingAuthor) {
    console.log("Author already exists:", existingAuthor.id);
    return;
  }

  const author = await prisma.author.create({
    data: {
      name: "Eva",
    },
  });

  console.log("Created author:", author);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });