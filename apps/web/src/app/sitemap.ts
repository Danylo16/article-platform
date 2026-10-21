import { indexingEnabled } from "../lib/seo";
import type { MetadataRoute } from "next";

import { getPublishedArticles, getVisibleSections } from "../api/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled()) return [];
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173"
  ).replace(/\/+$/, "");
  const [articles, sections] = await Promise.all([
    getPublishedArticles(),
    getVisibleSections(),
  ]);

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    ...sections.map((section) => ({
      url: `${siteUrl}/${section.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
