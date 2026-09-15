import slugify from "slugify";
import { prisma } from "../../lib/prisma.js";
import type { CreateTagInput } from "./tag.schema.js";

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function createTag(input: CreateTagInput) {
  const slug = slugify(input.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  return prisma.tag.create({
    data: {
      name: input.name,
      slug,
    },
  });
}