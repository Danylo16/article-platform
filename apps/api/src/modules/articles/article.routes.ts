import { FastifyInstance } from "fastify";
import { getAllArticles } from "./article.service.js";

export default async function articleRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return getAllArticles();
  });
}