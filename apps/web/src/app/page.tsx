import { absoluteUrl, serializeJsonLd } from "../lib/seo";
export const metadata = { alternates: { canonical: "/" } };
import { getPublicCategoriesEnabled, getPublishedArticles } from "../api/server";
import { HomePage } from "../views/HomePage";

export default async function HomeRoute({ searchParams }: { searchParams: Promise<{ rubrik?: string | string[] }> }) {
  const query = await searchParams;
  const categorySlug = await getPublicCategoriesEnabled() && typeof query.rubrik === "string" ? query.rubrik : undefined;
  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let loadError = false;

  try {
    articles = await getPublishedArticles();
  } catch {
    loadError = true;
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@type": "WebSite", name: "DORIDA", url: absoluteUrl("/") }) }} />
    <HomePage
      articles={articles}
      categorySlug={categorySlug}
      loadError={loadError}
    />
    </>
  );
}
