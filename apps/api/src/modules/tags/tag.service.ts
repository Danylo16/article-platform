import slugify from "slugify";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateTagInput,
  UpdateTagInput,
} from "./tag.schema.js";

function createSlug(name: string) {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}

async function assertSlugAvailable(slug: string, ignoredId?: string) {
  const existing = await prisma.tag.findUnique({
    where: {
      slug,
    },
  });

  if (existing && existing.id !== ignoredId) {
    throw new Error("TAG_ALREADY_EXISTS");
  }
}

export async function getTags() {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function createTag(input: CreateTagInput) {
  const slug = createSlug(input.name);

  await assertSlugAvailable(slug);

  return prisma.tag.create({
    data: {
      name: input.name,
      slug,
    },
  });
}

export async function updateTag(
  id: string,
  input: UpdateTagInput,
) {
  const slug = createSlug(input.name);

  await assertSlugAvailable(slug, id);

  return prisma.tag.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      slug,
    },
  });
}

export async function deleteTag(id: string) {
  const articleCount = await prisma.articleTag.count({
    where: {
      tagId: id,
    },
  });

  if (articleCount > 0) {
    throw new Error("TAG_IN_USE");
  }

  return prisma.tag.delete({
    where: {
      id,
    },
  });
}
