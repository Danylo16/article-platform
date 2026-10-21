import { absoluteUrl, articleJsonLd, seoDescription, serializeJsonLd } from "../../../lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMediaUrl } from "../../../api/media";
import { getPublishedArticleBySlug } from "../../../api/server";
import { ArticlePage } from "../../../views/ArticlePage";

type ArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "Artikel nicht gefunden" };
  }

  const description = seoDescription(article.excerpt, article.subtitle, article.content);
  const coverImage = getMediaUrl(article.coverImage);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    twitter: { card: "summary_large_image", title: article.title, description, images: [coverImage ?? absoluteUrl("/opengraph-image")] },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/articles/${encodeURIComponent(article.slug)}`),
      siteName: "DORIDA",
      locale: "de_AT",
      title: article.title,
      description,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags.map(({ tag }) => tag.name),
      images: [{ url: coverImage ?? absoluteUrl("/opengraph-image"), alt: article.coverAlt || article.title }],
    },
  };
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd(article, getMediaUrl(article.coverImage))) }} /><ArticlePage article={article} /></>;
}
