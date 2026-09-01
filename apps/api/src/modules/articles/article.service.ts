import { ArticleDto } from "./article.schema.js";

const articles: ArticleDto[] = [
  {
    id: "1",
    title: "Vienna is Changing",
    slug: "vienna-is-changing",
    excerpt: "Why modern Vienna is becoming Europe's media capital."
  }
];

export async function getAllArticles(): Promise<ArticleDto[]> {
  return articles;
}