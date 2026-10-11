import type { Article, Place, Section } from "../types/article";

const API_URL = (
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPublicArticle(value: unknown): value is Article {
  if (!isRecord(value) || !isRecord(value.author) || !isRecord(value.section)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.author.name === "string" &&
    typeof value.section.name === "string" &&
    typeof value.section.slug === "string"
  );
}

function getArticleReference(value: unknown, index: number) {
  if (!isRecord(value)) {
    return `index ${index}`;
  }

  if (typeof value.slug === "string") {
    return value.slug;
  }

  if (typeof value.id === "string") {
    return value.id;
  }

  return `index ${index}`;
}

function parseArticleList(value: unknown, path: string): Article[] {
  if (!Array.isArray(value)) {
    throw new Error(`Public API returned a non-array response for ${path}`);
  }

  const invalidArticles = value
    .map((article, index) => ({ article, index }))
    .filter(({ article }) => !isPublicArticle(article));

  if (invalidArticles.length > 0) {
    const references = invalidArticles.map(({ article, index }) =>
      getArticleReference(article, index),
    );

    console.error(
      `Public API returned ${invalidArticles.length} article(s) without required author or section data for ${path}: ${references.join(", ")}`,
    );
  }

  return value.filter(isPublicArticle);
}

async function fetchPublicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Public API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getPublishedArticles(
  sectionSlug?: string,
): Promise<Article[]> {
  const query = sectionSlug
    ? `?section=${encodeURIComponent(sectionSlug)}`
    : "";

  const path = `/articles${query}`;
  const response = await fetchPublicApi<unknown>(path);

  return parseArticleList(response, path);
}

export function getVisibleSections(): Promise<Section[]> {
  return fetchPublicApi<Section[]>("/sections");
}

export function getPublicPlaces(): Promise<Place[]> {
  return fetchPublicApi<Place[]>("/places");
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

  const article: unknown = await response.json();

  if (!isPublicArticle(article)) {
    throw new Error(
      `Public API returned an article without required author or section data for /articles/${slug}`,
    );
  }

  return article;
}
