import { prisma } from "../../lib/prisma.js";
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
export async function createAuthor(input) {
    return prisma.author.create({
        data: {
            name: input.name,
            bio: input.bio,
            avatarUrl: input.avatarUrl,
        },
    });
}
export async function updateAuthor(id, input) {
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
export async function deleteAuthor(id) {
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
//# sourceMappingURL=author.service.js.map