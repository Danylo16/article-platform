import { CreateCategorySchema, UpdateCategorySchema, } from "./category.schema.js";
import { createCategory, deleteCategory, getCategories, updateCategory, } from "./category.service.js";
export default async function categoryRoutes(app) {
    app.get("/", async () => {
        return getCategories();
    });
    app.post("/", async (request, reply) => {
        const parsed = CreateCategorySchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }
        try {
            const category = await createCategory(parsed.data);
            return reply.status(201).send(category);
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "CATEGORY_ALREADY_EXISTS") {
                return reply.status(409).send({
                    error: "CATEGORY_ALREADY_EXISTS",
                });
            }
            throw error;
        }
    });
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const parsed = UpdateCategorySchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }
        try {
            return await updateCategory(id, parsed.data);
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "CATEGORY_ALREADY_EXISTS") {
                return reply.status(409).send({
                    error: "CATEGORY_ALREADY_EXISTS",
                });
            }
            throw error;
        }
    });
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        try {
            await deleteCategory(id);
            return reply.status(204).send();
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "CATEGORY_IN_USE") {
                return reply.status(409).send({
                    error: "CATEGORY_IN_USE",
                    message: "Remove this category from its articles before deleting it.",
                });
            }
            throw error;
        }
    });
}
//# sourceMappingURL=category.routes.js.map