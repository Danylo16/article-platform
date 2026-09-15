import slugify from "slugify";
import { prisma } from "../../lib/prisma.js";
import type { CreateCategoryInput } from "./category.schema.js";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function createCategory(
  input: CreateCategoryInput,
) {
  const slug = slugify(input.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
    },
  });
}