import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import articlePublicRoutes from "./modules/articles/article.public.routes.js";
import articleAdminRoutes from "./modules/articles/article.admin.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import tagRoutes from "./modules/tags/tag.routes.js";
import authorRoutes from "./modules/authors/author.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function buildApp() {
    const app = Fastify({
        logger: true,
    });
    await app.register(cors, {
        origin: "http://localhost:5173",
        methods: [
            "GET",
            "POST",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
    });
    await app.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 1,
        },
    });
    await app.register(fastifyStatic, {
        root: resolve(__dirname, "../uploads"),
        prefix: "/uploads/",
    });
    app.get("/health", async () => ({
        status: "ok",
    }));
    await app.register(articlePublicRoutes, {
        prefix: "/articles",
    });
    await app.register(articleAdminRoutes, {
        prefix: "/admin/articles",
    });
    await app.register(categoryRoutes, {
        prefix: "/admin/categories",
    });
    await app.register(tagRoutes, {
        prefix: "/admin/tags",
    });
    await app.register(authorRoutes, {
        prefix: "/admin/authors",
    });
    await app.register(mediaRoutes, {
        prefix: "/admin/media",
    });
    return app;
}
//# sourceMappingURL=app.js.map