import type { Article } from "../types/article";

const API_URL = (
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

async function fetchPublicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Public API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getPublishedArticles(): Promise<Article[]> {
  return fetchPublicApi<Article[]>("/articles");
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const response = await fetch(
    `${API_URL}/articles/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Public API request failed with ${response.status}`);
  }

  return response.json() as Promise<Article>;
}
