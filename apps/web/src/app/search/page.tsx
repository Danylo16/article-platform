import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticles } from "../../api/server";
import { PublicSiteHeader, PublicSiteFooter } from "../../components/public/PublicSiteChrome";
import { StoryCard } from "../../components/public/ArticleCard";
import { searchArticles, suggestCorrection } from "../../lib/site-search";

export const metadata: Metadata = { title: "Suche", robots: { index: false, follow: true } };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; page?: string | string[] }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  let results: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let error = false;
  let correction: string | null = null;
  if (query) {
    try { const articles = await getPublishedArticles(); results = searchArticles(articles, query); correction = suggestCorrection(articles, query); }
    catch { error = true; }
  }
  const pages = Math.max(1, Math.ceil(results.length / 10));
  const requestedPage = typeof params.page === "string" && /^\d{1,6}$/.test(params.page) ? Number(params.page) : 1;
  const page = Math.max(1, Math.min(pages, requestedPage));
  const href = (next: number) => `/search?q=${encodeURIComponent(query)}&page=${next}`;
  return <div className="home-page search-page">
    <PublicSiteHeader />
    <main id="public-content" tabIndex={-1} className="home-page__main">
      <header className="section-page__heading"><p className="eyebrow">DORIDA entdecken</p><h1>Suche</h1></header>
      <form action="/search" method="get" role="search" className="site-search-form">
        <label htmlFor="site-query">Titel, Autorin oder Autor, Rubrik oder Ressort</label>
        <div><input id="site-query" name="q" type="search" defaultValue={query} maxLength={120} placeholder="Wonach suchen Sie?" /><button type="submit">Suchen</button></div>
      </form>
      {error ? <div role="alert"><p>Die Suche ist gerade nicht verfügbar. Bitte versuchen Sie es erneut.</p><Link href={href(1)}>Erneut versuchen</Link></div> : query ? <>
        {correction && <p>Meinten Sie <Link href={`/search?q=${encodeURIComponent(correction)}`}>„{correction}“</Link>?</p>}
        <p className="search-result-count">{results.length} {results.length === 1 ? "Ergebnis" : "Ergebnisse"} für „{query}“ · Nach Relevanz</p>
        {results.length ? <div className="stories-grid">{results.slice((page - 1) * 10, page * 10).map(article => <StoryCard key={article.id} article={article} />)}</div> : <p>Keine passenden Artikel. Versuchen Sie einen anderen Begriff oder weniger Wörter.</p>}
        {pages > 1 && <nav className="search-pagination" aria-label="Suchergebnisse"><span>Seite {page} von {pages}</span>{page > 1 && <Link href={href(page - 1)}>← Zurück</Link>}{page < pages && <Link href={href(page + 1)}>Weiter →</Link>}</nav>}
        <Link className="homepage-message__link" href="/">Alle Geschichten</Link>
      </> : <p className="search-result-count">Suchen Sie nach Titel, Autorin oder Autor, Rubrik oder Ressort.</p>}
    </main>
    <PublicSiteFooter />
  </div>;
}
