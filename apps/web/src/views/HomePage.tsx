import Link from "next/link";

import {
  ArticleCover,
  ArticleMeta,
  StoryCard,
} from "../components/public/ArticleCard";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "../components/public/PublicSiteChrome";
import type { Article } from "../types/article";

type HomePageProps = {
  articles: Article[];
  loadError?: boolean;
};

export function HomePage({
  articles,
  loadError = false,
}: HomePageProps) {
  const orderedArticles = [...articles].sort((first, second) => {
    const firstDate = first.publishedAt
      ? new Date(first.publishedAt).getTime()
      : 0;
    const secondDate = second.publishedAt
      ? new Date(second.publishedAt).getTime()
      : 0;

    return secondDate - firstDate;
  });

  const leadArticle = orderedArticles[0];
  const secondaryArticles = orderedArticles.slice(1);

  return (
    <div className="home-page">
      <PublicSiteHeader />

      <main className="home-page__main">
        {loadError && (
          <section className="homepage-message" aria-live="polite">
            <p className="eyebrow">Verbindung unterbrochen</p>
            <h1>Die Artikel konnten nicht geladen werden.</h1>
            <p>Bitte versuchen Sie es noch einmal.</p>
            <Link className="homepage-message__link" href="/">
              Erneut versuchen
            </Link>
          </section>
        )}

        {!loadError && !leadArticle && (
          <section className="homepage-message">
            <p className="eyebrow">DORIDA Redaktion</p>
            <h1>Die erste Geschichte ist unterwegs.</h1>
            <p>Veröffentlichte Artikel erscheinen hier.</p>
          </section>
        )}

        {!loadError && leadArticle && (
          <>
            <section className="lead-story">
              <Link
                className="lead-story__cover article-cover"
                href={`/articles/${leadArticle.slug}`}
                aria-label={`${leadArticle.title} lesen`}
              >
                <ArticleCover article={leadArticle} eager />
              </Link>

              <div className="lead-story__content">
                <p className="eyebrow">
                  Wien
                  <span aria-hidden="true">·</span>
                  {leadArticle.section.name}
                  {leadArticle.category && (
                    <>
                      <span aria-hidden="true">·</span>
                      {leadArticle.category.name}
                    </>
                  )}
                </p>

                <h1>
                  <Link href={`/articles/${leadArticle.slug}`}>
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

      <PublicSiteFooter />
    </div>
  );
}
