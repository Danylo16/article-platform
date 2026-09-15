import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getArticleBySlug } from "../api/client";
import type { Article } from "../types/article";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Article not found");
      setLoading(false);
      return;
    }

    getArticleBySlug(slug)
      .then(setArticle)
      .catch(() => {
        setError("Article not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <main>Loading...</main>;
  }

  if (error || !article) {
    return <main>Article not found</main>;
  }

  return (
    <main>
      {article.category && (
        <p>{article.category.name}</p>
      )}

      <h1>{article.title}</h1>

      {article.subtitle && (
        <p>{article.subtitle}</p>
      )}

      <p>By {article.author.name}</p>

      {article.publishedAt && (
        <time dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString()}
        </time>
      )}

      <hr />

      <article>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </article>

      {article.tags.length > 0 && (
        <div>
          {article.tags.map(({ tag }) => (
            <span key={tag.id}>
              #{tag.name}{" "}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}