import { getPublishedArticles } from "../api/server";
import { HomePage } from "../views/HomePage";

export default async function HomeRoute() {
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
      loadError={loadError}
    />
  );
}
