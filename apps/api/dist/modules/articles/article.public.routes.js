import { getAllArticles, getPublishedArticleBySlug, } from "./article.service.js";
export default async function articlePublicRoutes(app) {
    app.get("/", async () => {
        return getAllArticles();
    });
    app.get("/:slug", async (request, reply) => {
        const { slug } = request.params;
        const article = await getPublishedArticleBySlug(slug);
        if (!article) {
            return reply.status(404).send({
                error: "ARTICLE_NOT_FOUND",
            });
        }
        return article;
    });
}
//# sourceMappingURL=article.public.routes.js.map