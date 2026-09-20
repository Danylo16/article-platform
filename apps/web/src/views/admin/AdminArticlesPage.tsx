"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getAdminArticles } from "../../api/client";
import { getMediaUrl } from "../../api/media";
import type { Article, ArticleStatus } from "../../types/article";

type StatusFilter = "ALL" | ArticleStatus;

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ArticleThumbnail({ article }: { article: Article }) {
  const coverUrl = getMediaUrl(article.coverImage);

  if (coverUrl) {
    return <img src={coverUrl} alt="" loading="lazy" />;
  }

  return (
    <span className="admin-article-row__fallback" aria-hidden="true">
      {article.category?.name?.slice(0, 1).toUpperCase() ?? "D"}
    </span>
  );
}

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getAdminArticles()
      .then((data) => {
        if (!cancelled) {
          setArticles(data);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load articles",
          );
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
  }, [reloadKey]);

  const counts = useMemo(
    () => ({
      all: articles.length,
      published: articles.filter((article) => article.status === "PUBLISHED").length,
      drafts: articles.filter((article) => article.status === "DRAFT").length,
    }),
    [articles],
  );

  const visibleArticles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return articles.filter((article) => {
      if (status !== "ALL" && article.status !== status) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        article.title,
        article.subtitle,
        article.excerpt,
        article.author.name,
        article.category?.name,
      ]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(query));
    });
  }, [articles, search, status]);

  return (
    <main className="admin-articles">
      <header className="admin-articles__header">
        <div>
          <p className="admin-articles__eyebrow">Editorial workspace</p>
          <h1>Articles</h1>
          <p className="admin-articles__intro">
            Draft, review and publish every story from one place.
          </p>
        </div>

        <Link className="admin-articles__create" href="/admin/articles/new">
          <span aria-hidden="true">＋</span>
          New article
        </Link>
      </header>

      <section className="admin-articles__stats" aria-label="Article summary">
        <div>
          <span>All articles</span>
          <strong>{counts.all}</strong>
        </div>
        <div>
          <span>Published</span>
          <strong>{counts.published}</strong>
        </div>
        <div>
          <span>Drafts</span>
          <strong>{counts.drafts}</strong>
        </div>
      </section>

      <section className="admin-articles__panel">
        <div className="admin-articles__toolbar">
          <label className="admin-articles__search">
            <span className="sr-only">Search articles</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              placeholder="Search title, author or category"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="admin-articles__filter">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="ALL">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="admin-articles__message" aria-live="polite">
            Loading articles…
          </div>
        )}

        {!loading && error && (
          <div className="admin-articles__message admin-articles__message--error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setReloadKey((value) => value + 1);
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && visibleArticles.length === 0 && (
          <div className="admin-articles__message">
            <h2>{articles.length === 0 ? "No articles yet" : "No matching articles"}</h2>
            <p>
              {articles.length === 0
                ? "Create the first draft to start the publication."
                : "Change the search or status filter."}
            </p>
          </div>
        )}

        {!loading && !error && visibleArticles.length > 0 && (
          <div className="admin-articles__list">
            <div className="admin-articles__list-header" aria-hidden="true">
              <span>Story</span>
              <span>Status</span>
              <span>Author</span>
              <span>Updated</span>
              <span />
            </div>

            {visibleArticles.map((article) => (
              <article className="admin-article-row" key={article.id}>
                <Link
                  className="admin-article-row__story"
                  href={`/admin/articles/${article.id}`}
                >
                  <span className="admin-article-row__thumbnail">
                    <ArticleThumbnail article={article} />
                  </span>
                  <span className="admin-article-row__title">
                    <strong>{article.title}</strong>
                    <small>{article.category?.name ?? "Uncategorised"}</small>
                  </span>
                </Link>

                <span
                  className={`admin-article-row__status admin-article-row__status--${article.status.toLowerCase()}`}
                >
                  {statusLabels[article.status]}
                </span>

                <span className="admin-article-row__author">{article.author.name}</span>

                <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>

                <Link
                  className="admin-article-row__edit"
                  href={`/admin/articles/${article.id}`}
                  aria-label={`Edit ${article.title}`}
                >
                  Edit
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
