import slugify from "slugify";
import { prisma } from "../../lib/prisma.js";
function createSlug(name) {
    return slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });
}
async function assertSlugAvailable(slug, ignoredId) {
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
export async function createTag(input) {
    const slug = createSlug(input.name);
    await assertSlugAvailable(slug);
    return prisma.tag.create({
        data: {
            name: input.name,
            slug,
        },
    });
}
export async function updateTag(id, input) {
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
export async function deleteTag(id) {
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
//# sourceMappingURL=tag.service.js.map