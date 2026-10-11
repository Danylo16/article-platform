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

type SectionPageProps = {
  section: {
    name: string;
    slug: string;
    description: string;
  };
  articles: Article[];
  loadError?: boolean;
};

export function SectionPage({
  section,
  articles,
  loadError = false,
}: SectionPageProps) {
  const leadArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="home-page section-page">
      <PublicSiteHeader activeSectionSlug={section.slug} />

      <main className="home-page__main">
        <header className="section-page__heading">
          <p className="eyebrow">DORIDA · Journal aus Wien</p>
          <h1>{section.name}</h1>
          <p>{section.description}</p>
        </header>

        <div className="dorida-rule" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {loadError && (
          <section className="homepage-message homepage-message--compact">
            <p className="eyebrow">Verbindung unterbrochen</p>
            <h2>Die Artikel konnten nicht geladen werden.</h2>
            <Link className="homepage-message__link" href={`/${section.slug}`}>
              Erneut versuchen
            </Link>
          </section>
        )}

        {!loadError && !leadArticle && (
          <section className="homepage-message homepage-message--compact">
            <p className="eyebrow">{section.name}</p>
            <h2>Die erste Geschichte ist unterwegs.</h2>
            <p>Veröffentlichte Artikel erscheinen hier.</p>
            <Link className="homepage-message__link" href="/">
              Alle Geschichten
            </Link>
          </section>
        )}

        {!loadError && leadArticle && (
          <>
            <section className="section-lead-story">
              <Link
                className="section-lead-story__cover article-cover"
                href={`/articles/${leadArticle.slug}`}
                aria-label={`${leadArticle.title} lesen`}
              >
                <ArticleCover article={leadArticle} eager />
              </Link>

              <div className="section-lead-story__content">
                <p className="eyebrow">
                  {leadArticle.category?.name ?? section.name}
                </p>
                <h2>
                  <Link href={`/articles/${leadArticle.slug}`}>
                    {leadArticle.title}
                  </Link>
                </h2>
                {(leadArticle.excerpt ?? leadArticle.subtitle) && (
                  <p className="section-lead-story__summary">
                    {leadArticle.excerpt ?? leadArticle.subtitle}
                  </p>
                )}
                <ArticleMeta article={leadArticle} />
              </div>
            </section>

            {remainingArticles.length > 0 && (
              <section className="latest-stories section-page__stories">
                <div className="stories-grid">
                  {remainingArticles.map((article) => (
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
