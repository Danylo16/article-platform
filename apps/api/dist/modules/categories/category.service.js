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
    const existing = await prisma.category.findUnique({
        where: {
            slug,
        },
    });
    if (existing && existing.id !== ignoredId) {
        throw new Error("CATEGORY_ALREADY_EXISTS");
    }
}
export async function getCategories() {
    return prisma.category.findMany({
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
export async function createCategory(input) {
    const slug = createSlug(input.name);
    await assertSlugAvailable(slug);
    return prisma.category.create({
        data: {
            name: input.name,
            slug,
        },
    });
}
export async function updateCategory(id, input) {
    const slug = createSlug(input.name);
    await assertSlugAvailable(slug, id);
    return prisma.category.update({
        where: {
            id,
        },
        data: {
            name: input.name,
            slug,
        },
    });
}
export async function deleteCategory(id) {
    const articleCount = await prisma.article.count({
        where: {
            categoryId: id,
        },
    });
    if (articleCount > 0) {
        throw new Error("CATEGORY_IN_USE");
    }
    return prisma.category.delete({
        where: {
            id,
        },
    });
}
//# sourceMappingURL=category.service.js.map