import Link from "next/link";
import { categoryHref, sameLabel } from "../../lib/public-categories";

import { getMediaUrl } from "../../api/media";
import type { Article } from "../../types/article";

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("de-AT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getFallbackTone(article: Article) {
  const hash = [...article.slug].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return (hash % 3) + 1;
}

export function ArticleMeta({ article }: { article: Article }) {
  const publishedAt = formatDate(article.publishedAt);

  return (
    <div className="article-meta">
      <span>Von {article.author.name}</span>

      {publishedAt && (
        <>
          <span className="article-meta__dot" aria-hidden="true" />
          <time dateTime={article.publishedAt ?? undefined}>{publishedAt}</time>
        </>
      )}

      {article.readingTime && article.readingTime > 0 ? (
        <>
          <span className="article-meta__dot" aria-hidden="true" />
          <span>ca. {article.readingTime} Min.</span>
        </>
      ) : null}
    </div>
  );
}

export function ArticleCover({
  article,
  eager = false,
}: {
  article: Article;
  eager?: boolean;
}) {
  const coverUrl = getMediaUrl(article.coverImage);

  if (coverUrl) {
    return (
      <img
        className="article-cover__image"
        src={coverUrl}
        alt=""
        style={{ objectPosition: `${article.coverFocusX ?? 50}% ${article.coverFocusY ?? 50}%` }}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
    );
  }

  return (
    <div
      className={`article-cover__fallback article-cover__fallback--${getFallbackTone(article)}`}
      aria-hidden="true"
    >
      <span>{article.section.name}</span>
      <strong>DORIDA</strong>
    </div>
  );
}

export function StoryCard({ article }: { article: Article }) {
  const summary = article.excerpt ?? article.subtitle;

  return (
    <article className="story-card">
      <Link
        className="story-card__cover article-cover"
        href={`/articles/${article.slug}`}
        aria-label={`${article.title} lesen`}
      >
        <ArticleCover article={article} />
      </Link>

      <div className="story-card__content">
        <p className="eyebrow">
          {article.section.name}
          {article.category && !sameLabel(article.category.name, article.section.name) && <> · <Link href={categoryHref(article.category.slug)}>{article.category.name}</Link></>}
        </p>

        <h3>
          <Link href={`/articles/${article.slug}`} title={article.title}>{article.title}</Link>
        </h3>

        <p className="story-card__summary">{summary || ""}</p>

        <ArticleMeta article={article} />
      </div>
    </article>
  );
}
