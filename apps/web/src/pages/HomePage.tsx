import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getArticles } from "../api/client";
import type { Article } from "../types/article";

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .catch(() => {
        setError("Failed to load articles");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <main>Loading...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  return (
    <main>
      <h1>Latest stories</h1>

      {articles.length === 0 ? (
        <p>No published articles yet.</p>
      ) : (
        articles.map((article) => (
          <article key={article.id}>
            {article.category && (
              <p>{article.category.name}</p>
            )}

            <h2>
              <Link to={`/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h2>

            {article.subtitle && <p>{article.subtitle}</p>}

            <p>By {article.author.name}</p>
          </article>
        ))
      )}
    </main>
  );
}