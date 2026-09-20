import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getMediaUrl } from "../api/media";
import { ArticleMarkdownImage } from "../components/ArticleMarkdownImage";
import type { Article } from "../types/article";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ArticlePage({ article }: { article: Article }) {
  const coverUrl = getMediaUrl(article.coverImage);
  const avatarUrl = getMediaUrl(article.author.avatarUrl);
  const publishedAt = article.publishedAt
    ? formatDate(article.publishedAt)
    : null;

  return (
    <div className="article-page">
      <header className="article-page__site-header">
        <div className="article-page__site-header-inner">
          <Link
            className="article-page__brand"
            href="/"
            aria-label="DORIDA Startseite"
          >
            <strong>DORIDA</strong>
            <span>Journal aus Wien</span>
          </Link>

          <nav className="article-page__nav" aria-label="Hauptnavigation">
            <Link href="/">Neueste</Link>
            {article.category && (
              <Link href={`/?category=${article.category.slug}`}>
                {article.category.name}
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="article-page__main">
        <article>
          <header className="article-page__hero">
            <div className="article-page__heading">
              <p className="article-page__eyebrow">
                Wien
                <span aria-hidden="true">·</span>
                {article.category?.name ?? "Reportage"}
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
                    <span>{article.readingTime} Min. Lesezeit</span>
                  </>
                ) : null}
              </div>
            </div>

            {coverUrl ? (
              <figure className="article-page__cover">
                <img src={coverUrl} alt="" fetchPriority="high" />
              </figure>
            ) : (
              <div className="article-page__cover-fallback" aria-hidden="true">
                <span>{article.category?.name ?? "DORIDA"}</span>
                <strong>DORIDA</strong>
              </div>
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
              <p>{article.category?.name ?? "Journal aus Wien"}</p>
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
              {avatarUrl ? (
                <img src={avatarUrl} alt="" loading="lazy" />
              ) : (
                <span className="article-page__author-initials" aria-hidden="true">
                  {getInitials(article.author.name)}
                </span>
              )}

              <div>
                <p>Autorin · Autor</p>
                <h2>{article.author.name}</h2>
                {article.author.bio && <div>{article.author.bio}</div>}
              </div>
            </section>

            <Link className="article-page__back-link" href="/">
              <span aria-hidden="true">←</span>
              Alle Geschichten
            </Link>
          </footer>
        </article>
      </main>

      <footer className="article-page__site-footer">
        <div>
          <strong>DORIDA</strong>
          <span>Journal aus Wien</span>
        </div>
        <p>
          Geschichten über Menschen, Kultur und Politik – nah an Wien und mit
          Blick in die Tiefe.
        </p>
        <small>© {new Date().getFullYear()} DORIDA</small>
      </footer>
    </div>
  );
}
