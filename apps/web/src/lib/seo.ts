import type { Article } from "../types/article";
export const siteDescription = "Geschichten über Menschen, Kultur und Politik – nah an Wien und mit Blick in die Tiefe.";
export function siteUrl() { return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173").origin; }
export function indexingEnabled() { return process.env.SITE_INDEXING_ENABLED === "true"; }
export function absoluteUrl(path: string) { return new URL(path, siteUrl()).href; }
export function seoDescription(...values: (string | null | undefined)[]) {
  const text = (values.find(value => value?.trim()) ?? siteDescription)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ").replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim();
  return text.length > 165 ? `${text.slice(0, 162).replace(/\s+\S*$/, "")}…` : text;
}
export function serializeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
export function articleJsonLd(article: Article, image: string | null) {
  const url = absoluteUrl(`/articles/${encodeURIComponent(article.slug)}`);
  return { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`,
    mainEntityOfPage: url, url, headline: article.title,
    description: seoDescription(article.excerpt, article.subtitle, article.content),
    datePublished: article.publishedAt ?? undefined, dateModified: article.updatedAt,
    author: { "@type": "Person", name: article.author.name, ...(article.author.instagramUrl ? { sameAs: [article.author.instagramUrl] } : {}) },
    publisher: { "@type": "Organization", name: "DORIDA", url: siteUrl() },
    articleSection: article.section.name, ...(image ? { image: [absoluteUrl(image)] } : {}),
  };
}
