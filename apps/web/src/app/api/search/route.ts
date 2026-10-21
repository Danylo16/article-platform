import { getPublishedArticles } from "../../../api/server";
import { searchArticles, suggestCorrection } from "../../../lib/site-search";

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 120);
  if (query.length < 2) return Response.json({ items: [], correction: null });
  try {
    const articles = await getPublishedArticles();
    const correction = suggestCorrection(articles, query);
    const items = searchArticles(articles, query).slice(0, 5).map(article => ({
      title: article.title, href: `/articles/${encodeURIComponent(article.slug)}`,
      detail: [article.author.name, article.category?.name, article.section.name].filter(Boolean).join(" · "),
    }));
    return Response.json({ items, correction }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
