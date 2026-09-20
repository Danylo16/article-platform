import slugify from "slugify";

import { prisma } from "../../lib/prisma.js";

import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "./article.schema.js";
import { calculateReadingTime } from "./article.reading-time.js";

export async function getAllArticles() {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },

    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function getAllAdminArticles() {
  return prisma.article.findMany({
    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: {
      id,
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function createArticle(
  input: CreateArticleInput,
) {
  const baseSlug = slugify(input.title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.article.findUnique({
      where: { slug },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return prisma.article.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      readingTime: calculateReadingTime(input.content),

      slug,

      authorId: input.authorId,
      categoryId: input.categoryId,

      status: "DRAFT",

      tags: {
        create: input.tagIds.map((tagId) => ({
          tag: {
            connect: {
              id: tagId,
            },
          },
        })),
      },
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
) {
  const {
    tagIds,
    ...articleData
  } = input;

  return prisma.article.update({
    where: {
      id,
    },

    data: {
      ...articleData,

      ...(input.content !== undefined
        ? { readingTime: calculateReadingTime(input.content) }
        : {}),

      ...(tagIds !== undefined
        ? {
            tags: {
              deleteMany: {},

              create: tagIds.map((tagId) => ({
                tag: {
                  connect: {
                    id: tagId,
                  },
                },
              })),
            },
          }
        : {}),
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function publishArticle(id: string) {
  const article = await prisma.article.findUniqueOrThrow({
    where: { id },
    select: { content: true },
  });

  return prisma.article.update({
    where: {
      id,
    },

    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: calculateReadingTime(article.content),
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function unpublishArticle(id: string) {
  return prisma.article.update({
    where: {
      id,
    },

    data: {
      status: "DRAFT",
      publishedAt: null,
    },

    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({
    where: {
      id,
    },
  });
}
