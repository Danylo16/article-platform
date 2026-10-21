import type { Article } from "../types/article";

export function categoryHref(slug: string, basePath = "/") {
  return `${basePath}?rubrik=${encodeURIComponent(slug)}`;
}

export function categoryOptions(articles: Article[]) {
  const options = new Map<string, { name: string; slug: string; count: number }>();
  for (const { category } of articles) {
    if (!category) continue;
    const existing = options.get(category.slug);
    if (existing) existing.count += 1;
    else options.set(category.slug, { name: category.name, slug: category.slug, count: 1 });
  }
  return [...options.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function filterByCategory(articles: Article[], slug?: string) {
  return slug ? articles.filter((article) => article.category?.slug === slug) : articles;
}

export function sameLabel(first: string, second: string) {
  return first.trim().toLocaleLowerCase("de") === second.trim().toLocaleLowerCase("de");
}
