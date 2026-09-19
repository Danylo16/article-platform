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

  const description = article.excerpt ?? article.subtitle ?? undefined;
  const coverImage = getMediaUrl(article.coverImage);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.publishedAt ?? undefined,
      authors: [article.author.name],
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  };
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticlePage article={article} />;
}
