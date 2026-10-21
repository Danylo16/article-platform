import Link from "next/link";
import { CategoryFilter } from "../components/public/CategoryFilter";
import { categoryHref, sameLabel, filterByCategory } from "../lib/public-categories";

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
  categorySlug?: string;
};

export function HomePage({
  articles,
  loadError = false,
  categorySlug,
}: HomePageProps) {
  const orderedArticles = [...filterByCategory(articles, categorySlug)].sort((first, second) => {
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

      <main id="public-content" tabIndex={-1} className="home-page__main">
        {!loadError && <CategoryFilter articles={articles} active={categorySlug} />}
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
            <h1>{categorySlug ? "Keine Artikel in dieser Rubrik." : "Die erste Geschichte ist unterwegs."}</h1>
            {categorySlug ? <Link className="homepage-message__link" href="/">Alle Geschichten</Link> : <p>Veröffentlichte Artikel erscheinen hier.</p>}
          </section>
        )}

        {!loadError && leadArticle && (
          <>
            <div className="journal-intro"><p>Nah an Wien. Mit Blick in die Tiefe.</p></div>
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
                  Neueste Geschichte
                  <span aria-hidden="true">·</span>
                  {leadArticle.section.name}
                  {leadArticle.category && !sameLabel(leadArticle.category.name, leadArticle.section.name) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <Link href={categoryHref(leadArticle.category.slug)}>{leadArticle.category.name}</Link>
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
