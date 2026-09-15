import { CreateAuthorSchema, UpdateAuthorSchema, } from "./author.schema.js";
import { createAuthor, deleteAuthor, getAuthors, updateAuthor, } from "./author.service.js";
export default async function authorRoutes(app) {
    app.get("/", async () => {
        return getAuthors();
    });
    app.post("/", async (request, reply) => {
        const parsed = CreateAuthorSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }
        const author = await createAuthor(parsed.data);
        return reply.status(201).send(author);
    });
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const parsed = UpdateAuthorSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }
        return updateAuthor(id, parsed.data);
    });
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        try {
            await deleteAuthor(id);
            return reply.status(204).send();
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "AUTHOR_IN_USE") {
                return reply.status(409).send({
                    error: "AUTHOR_IN_USE",
                    message: "Reassign this author's articles before deleting the author.",
                });
            }
            throw error;
        }
    });
}
//# sourceMappingURL=author.routes.js.map