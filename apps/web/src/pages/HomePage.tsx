import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getArticles } from "../api/client";
import { getMediaUrl } from "../api/media";
import type { Article } from "../types/article";

import "./HomePage.css";

const PUBLICATION = {
  name: "DORIDA",
  strapline: "Journal aus Wien",
  description:
    "Geschichten über Menschen, Kultur und Politik – nah an Wien und mit Blick in die Tiefe.",
} as const;

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

function ArticleMeta({ article }: { article: Article }) {
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
          <span>{article.readingTime} Min.</span>
        </>
      ) : null}
    </div>
  );
}

function ArticleCover({
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
      <span>{article.category?.name ?? "Wien"}</span>
      <strong>DORIDA</strong>
    </div>
  );
}

function StoryCard({ article }: { article: Article }) {
  const summary = article.excerpt ?? article.subtitle;

  return (
    <article className="story-card">
      <Link
        className="story-card__cover article-cover"
        to={`/articles/${article.slug}`}
        aria-label={`${article.title} lesen`}
      >
        <ArticleCover article={article} />
      </Link>

      <div className="story-card__content">
        <p className="eyebrow">
          {article.category?.name ?? "Reportage"}
        </p>

        <h3>
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {summary && <p className="story-card__summary">{summary}</p>}

        <ArticleMeta article={article} />
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div
      className="homepage-loading"
      aria-label="Artikel werden geladen"
      aria-live="polite"
    >
      <div className="homepage-loading__image" />
      <div className="homepage-loading__copy">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function HomePage() {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getArticles()
      .then((result) => {
        if (!cancelled) {
          setArticles(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const orderedArticles = useMemo(
    () =>
      [...articles].sort((first, second) => {
        const firstDate = first.publishedAt
          ? new Date(first.publishedAt).getTime()
          : 0;
        const secondDate = second.publishedAt
          ? new Date(second.publishedAt).getTime()
          : 0;

        return secondDate - firstDate;
      }),
    [articles],
  );

  const categories = useMemo(() => {
    const uniqueCategories = new Map(
      orderedArticles
        .filter((article) => article.category)
        .map((article) => [
          article.category!.slug,
          article.category!,
        ]),
    );

    return [...uniqueCategories.values()].slice(0, 6);
  }, [orderedArticles]);

  const selectedCategory = searchParams.get("category");
  const visibleArticles = selectedCategory
    ? orderedArticles.filter(
        (article) => article.category?.slug === selectedCategory,
      )
    : orderedArticles;
  const leadArticle = visibleArticles[0];
  const secondaryArticles = visibleArticles.slice(1);

  return (
    <div className="home-page">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-header__brand" to="/" aria-label="DORIDA Startseite">
            <strong>{PUBLICATION.name}</strong>
            <span>{PUBLICATION.strapline}</span>
          </Link>

          <nav className="site-header__nav" aria-label="Hauptnavigation">
            <Link to="/" aria-current={!selectedCategory ? "page" : undefined}>
              Neueste
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/?category=${category.slug}`}
                aria-current={
                  selectedCategory === category.slug ? "page" : undefined
                }
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="home-page__main">
        {loading && <LoadingState />}

        {!loading && error && (
          <section className="homepage-message" aria-live="polite">
            <p className="eyebrow">Verbindung unterbrochen</p>
            <h1>Die Artikel konnten nicht geladen werden.</h1>
            <p>Bitte versuchen Sie es noch einmal.</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(false);
                setRequestKey((key) => key + 1);
              }}
            >
              Erneut versuchen
            </button>
          </section>
        )}

        {!loading && !error && !leadArticle && (
          <section className="homepage-message">
            <p className="eyebrow">DORIDA Redaktion</p>
            <h1>
              {selectedCategory
                ? "In dieser Rubrik gibt es noch keine Artikel."
                : "Die erste Geschichte ist unterwegs."}
            </h1>
            <p>
              {selectedCategory
                ? "Entdecken Sie stattdessen unsere neuesten Geschichten."
                : "Veröffentlichte Artikel erscheinen hier."}
            </p>

            {selectedCategory && (
              <Link className="homepage-message__link" to="/">
                Alle Geschichten
              </Link>
            )}
          </section>
        )}

        {!loading && !error && leadArticle && (
          <>
            <section className="lead-story">
              <Link
                className="lead-story__cover article-cover"
                to={`/articles/${leadArticle.slug}`}
                aria-label={`${leadArticle.title} lesen`}
              >
                <ArticleCover article={leadArticle} eager />
              </Link>

              <div className="lead-story__content">
                <p className="eyebrow">
                  Wien
                  <span aria-hidden="true">·</span>
                  {leadArticle.category?.name ?? "Reportage"}
                </p>

                <h1>
                  <Link to={`/articles/${leadArticle.slug}`}>
                    {leadArticle.title}
                  </Link>
                </h1>

                {(leadArticle.excerpt ?? leadArticle.subtitle) && (
                  <p className="lead-story__summary">
                    {leadArticle.excerpt ?? leadArticle.subtitle}
                  </p>
                )}

                <ArticleMeta article={leadArticle} />
              </div>
            </section>

            <div className="dorida-rule" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            {secondaryArticles.length > 0 && (
              <section className="latest-stories" aria-labelledby="latest-heading">
                <div className="section-heading">
                  <p className="eyebrow">Neu bei DORIDA</p>
                  <h2 id="latest-heading">Aktuelle Geschichten</h2>
                </div>

                <div className="stories-grid">
                  {secondaryArticles.map((article) => (
                    <StoryCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="site-footer">
        <div>
          <strong>{PUBLICATION.name}</strong>
          <span>{PUBLICATION.strapline}</span>
        </div>

        <p>{PUBLICATION.description}</p>
        <small>© {new Date().getFullYear()} DORIDA</small>
      </footer>
    </div>
  );
}
