import Link from "next/link";
import { AuthorAvatar } from "../components/public/AuthorAvatar";
import { categoryHref, sameLabel } from "../lib/public-categories";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getMediaUrl } from "../api/media";
import { ArticleMarkdownImage } from "../components/ArticleMarkdownImage";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "../components/public/PublicSiteChrome";
import type { Article } from "../types/article";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ArticlePage({ article }: { article: Article }) {
  const coverUrl = getMediaUrl(article.coverImage);
  const avatarUrl = getMediaUrl(article.author.avatarUrl);
  const publishedAt = article.publishedAt
    ? formatDate(article.publishedAt)
    : null;

  return (
    <div className="article-page">
      <PublicSiteHeader activeSectionSlug={article.section.slug} />

      <main id="public-content" tabIndex={-1} className="article-page__main">
        <article>
          <header className="article-page__hero">
            <div className="article-page__heading">
              <p className="article-page__eyebrow">
                Wien
                <span aria-hidden="true">·</span>
                <Link href={`/${article.section.slug}`}>{article.section.name}</Link>
                {article.category && !sameLabel(article.category.name, article.section.name) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <Link href={categoryHref(article.category.slug)}>{article.category.name}</Link>
                  </>
                )}
              </p>

              <h1>{article.title}</h1>

              {article.subtitle && (
                <p className="article-page__subtitle">{article.subtitle}</p>
              )}

              <div className="article-page__meta">
                <span>Von {article.author.name}</span>

                {publishedAt && (
                  <>
                    <span className="article-page__meta-dot" aria-hidden="true" />
                    <time dateTime={article.publishedAt ?? undefined}>
                      {publishedAt}
                    </time>
                  </>
                )}

                {article.readingTime && article.readingTime > 0 ? (
                  <>
                    <span className="article-page__meta-dot" aria-hidden="true" />
                    <span>ca. {article.readingTime} Min. Lesezeit</span>
                  </>
                ) : null}
              </div>
            </div>

            {coverUrl && (
              <figure className="article-page__cover">
                <img src={coverUrl} alt={article.coverAlt ?? ""} fetchPriority="high" />
                {(article.coverCaption || article.coverCredit) && <figcaption>{article.coverCaption}{article.coverCredit && <span> · Foto: {article.coverCredit}</span>}</figcaption>}
              </figure>
            )}
          </header>

          <div className="article-page__rule" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="article-page__content-grid">
            <aside className="article-page__aside" aria-label="Artikelinformationen">
              <span>DORIDA</span>
              <p>
                {article.section.name}
                {article.category && !sameLabel(article.category.name, article.section.name) ? ` · ${article.category.name}` : ""}
              </p>
            </aside>

            <div className="article-page__prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ArticleMarkdownImage,
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>

          <footer className="article-page__article-footer">
            {article.tags.length > 0 && (
              <div className="article-page__tags" aria-label="Themen">
                <span className="article-page__tags-label">Themen</span>
                <div>
                  {article.tags.map(({ tag }) => (
                    <span key={tag.id}>#{tag.name}</span>
                  ))}
                </div>
              </div>
            )}

            <section className="article-page__author" aria-label="Autor">
              <AuthorAvatar key={avatarUrl} src={avatarUrl} name={article.author.name} />

              <div>
                <p>Autorin · Autor</p>
                <h2>{article.author.name}</h2>
                {article.author.bio && <div>{article.author.bio}</div>}
                {article.author.instagramUrl && <a className="author-social-link" href={article.author.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}
              </div>
            </section>

            <Link className="article-page__back-link" href={`/${article.section.slug}`}>
              <span aria-hidden="true">←</span>
              Mehr aus {article.section.name}
            </Link>
          </footer>
        </article>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
