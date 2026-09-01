import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js"; 
import articleRoutes from "./modules/articles/article.routes.js"; 

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(corsPlugin);
  await app.register(articleRoutes, {
    prefix: "/articles",
  });

  app.get("/health", async () => ({
    status: "ok",
  }));

  return app;
}