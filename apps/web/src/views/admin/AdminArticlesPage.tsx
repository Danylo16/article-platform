"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getAdminArticles } from "../../api/client";
import { getMediaUrl } from "../../api/media";
import type { Article, ArticleStatus } from "../../types/article";

type StatusFilter = "ALL" | ArticleStatus;

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "Чернетка",
  SCHEDULED: "Заплановано",
  PUBLISHED: "Опубліковано",
  ARCHIVED: "Архів",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
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
              : "Не вдалося завантажити статті",
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
        article.section.name,
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
          <p className="admin-articles__eyebrow">Редакційний простір</p>
          <h1>Статті</h1>
          <p className="admin-articles__intro">
            Створюй, перевіряй та публікуй матеріали.
          </p>
        </div>

        <Link className="admin-articles__create" href="/admin/articles/new">
          <span aria-hidden="true">＋</span>
          Нова стаття
        </Link>
      </header>

      <section className="admin-articles__stats" aria-label="Статистика статей">
        <div>
          <span>Усі статті</span>
          <strong>{counts.all}</strong>
        </div>
        <div>
          <span>Опубліковані</span>
          <strong>{counts.published}</strong>
        </div>
        <div>
          <span>Чернетки</span>
          <strong>{counts.drafts}</strong>
        </div>
      </section>

      <section className="admin-articles__panel">
        <div className="admin-articles__toolbar">
          <label className="admin-articles__search">
            <span className="sr-only">Пошук статей</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              placeholder="Пошук за назвою, автором, розділом або рубрикою"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="admin-articles__filter">
            <span>Статус</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="ALL">Усі статуси</option>
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
            Завантажуємо статті…
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
              Спробувати ще раз
            </button>
          </div>
        )}

        {!loading && !error && visibleArticles.length === 0 && (
          <div className="admin-articles__message">
            <h2>{articles.length === 0 ? "Статей ще немає" : "Нічого не знайдено"}</h2>
            <p>
              {articles.length === 0
                ? "Створіть першу чернетку, щоб розпочати роботу."
                : "Змініть пошуковий запит або фільтр статусу."}
            </p>
          </div>
        )}

        {!loading && !error && visibleArticles.length > 0 && (
          <div className="admin-articles__list">
            <div className="admin-articles__list-header" aria-hidden="true">
              <span>Матеріал</span>
              <span>Статус</span>
              <span>Автор</span>
              <span>Оновлено</span>
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
                    <small>
                      {article.section.name}
                      {article.category ? ` · ${article.category.name}` : ""}
                    </small>
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
                  aria-label={`Редагувати: ${article.title}`}
                >
                  Редагувати
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
