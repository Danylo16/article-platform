import { getPublishedArticles } from "../api/server";
import { HomePage } from "../views/HomePage";

type HomeRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomeRoute({ searchParams }: HomeRouteProps) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams.category;
  const selectedCategory = Array.isArray(categoryParam)
    ? categoryParam[0] ?? null
    : categoryParam ?? null;

  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let loadError = false;

  try {
    articles = await getPublishedArticles();
  } catch {
    loadError = true;
  }

  return (
    <HomePage
      articles={articles}
      selectedCategory={selectedCategory}
      loadError={loadError}
    />
  );
}
