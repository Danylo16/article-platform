import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminArticles } from "../../api/client";
import type { Article } from "../../types/article";

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminArticles()
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
      <header>
        <h1>Articles</h1>

        <Link to="/admin/articles/new">
          New article
        </Link>
      </header>

      {articles.length === 0 ? (
        <p>No articles yet.</p>
      ) : (
        <section>
          {articles.map((article) => (
            <article key={article.id}>
              <h2>
                <Link
                  to={`/admin/articles/${article.id}`}
                >
                  {article.title}
                </Link>
              </h2>

              <p>
                {article.status}

                {article.category
                  ? ` · ${article.category.name}`
                  : ""}
              </p>

              {article.excerpt && (
                <p>{article.excerpt}</p>
              )}

              <p>
                By {article.author.name}
              </p>

              <p>
                Updated{" "}
                {new Date(
                  article.updatedAt,
                ).toLocaleDateString()}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}