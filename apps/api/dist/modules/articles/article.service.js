import slugify from "slugify";
import { prisma } from "../../lib/prisma.js";
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
export async function getArticleById(id) {
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
export async function getPublishedArticleBySlug(slug) {
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
export async function createArticle(input) {
    const baseSlug = slugify(input.title, {
        lower: true,
        strict: true,
        trim: true,
    });
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.article.findUnique({
        where: { slug },
    })) {
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
export async function updateArticle(id, input) {
    const { tagIds, ...articleData } = input;
    return prisma.article.update({
        where: {
            id,
        },
        data: {
            ...articleData,
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
export async function publishArticle(id) {
    return prisma.article.update({
        where: {
            id,
        },
        data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
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
export async function unpublishArticle(id) {
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
export async function deleteArticle(id) {
    return prisma.article.delete({
        where: {
            id,
        },
    });
}
//# sourceMappingURL=article.service.js.map