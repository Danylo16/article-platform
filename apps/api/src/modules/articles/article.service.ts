import slugify from "slugify";

import { prisma } from "../../lib/prisma.js";

import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "./article.schema.js";
import { calculateReadingTime } from "./article.reading-time.js";

export async function getAllArticles(sectionSlug?: string) {
  const result = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(sectionSlug
        ? {
            section: {
              slug: sectionSlug,
              isVisible: true,
            },
          }
        : {}),
    },

    include: {
      author: true,
      section: true,
      category: true,
      place: { include: { type: true } },
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
  return result.map((article) => ({ ...article, readingTime: calculateReadingTime(article.content) }));
}

export async function getAllAdminArticles() {
  const result = await prisma.article.findMany({
    include: {
      author: true,
      section: true,
      category: true,
      place: { include: { type: true } },
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
  return result.map((article) => ({ ...article, readingTime: calculateReadingTime(article.content) }));
}

export async function getArticleById(id: string) {
  const result = await prisma.article.findUnique({
    where: {
      id,
    },

    include: {
      author: true,
      section: true,
      category: true,
      place: { include: { type: true } },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
  return result ? { ...result, readingTime: calculateReadingTime(result.content) } : null;
}

export async function getPublishedArticleBySlug(slug: string) {
  const result = await prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },

    include: {
      author: true,
      section: true,
      category: true,
      place: { include: { type: true } },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
  return result ? { ...result, readingTime: calculateReadingTime(result.content) } : null;
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
      coverAlt: input.coverAlt,
      coverCaption: input.coverCaption,
      coverCredit: input.coverCredit,
      coverFocusX: input.coverFocusX,
      coverFocusY: input.coverFocusY,

      readingTime: calculateReadingTime(input.content),

      slug,

      authorId: input.authorId,
      sectionId: input.sectionId,
      categoryId: input.categoryId,
      placeId: input.placeId,

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
      section: true,
      category: true,
      place: { include: { type: true } },
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
      section: true,
      category: true,
      place: { include: { type: true } },
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
      section: true,
      category: true,
      place: { include: { type: true } },
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
      section: true,
      category: true,
      place: { include: { type: true } },
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
