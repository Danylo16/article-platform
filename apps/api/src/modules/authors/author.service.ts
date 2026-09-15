import { prisma } from "../../lib/prisma.js";

export async function getAuthors() {
  return prisma.author.findMany({
    orderBy: {
      name: "asc",
    },
  });
}