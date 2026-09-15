import { prisma } from "../../lib/prisma.js";
import type {
  CreateAuthorInput,
  UpdateAuthorInput,
} from "./author.schema.js";

export async function getAuthors() {
  return prisma.author.findMany({
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

export async function createAuthor(input: CreateAuthorInput) {
  return prisma.author.create({
    data: {
      name: input.name,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    },
  });
}

export async function updateAuthor(
  id: string,
  input: UpdateAuthorInput,
) {
  return prisma.author.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    },
  });
}

export async function deleteAuthor(id: string) {
  const articleCount = await prisma.article.count({
    where: {
      authorId: id,
    },
  });

  if (articleCount > 0) {
    throw new Error("AUTHOR_IN_USE");
  }

  return prisma.author.delete({
    where: {
      id,
    },
  });
}
