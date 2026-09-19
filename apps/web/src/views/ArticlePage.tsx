import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ArticleMarkdownImage } from "../components/ArticleMarkdownImage";
import type { Article } from "../types/article";

export function ArticlePage({ article }: { article: Article }) {
  return (
    <main>
      <Link href="/">DORIDA</Link>

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
          {new Intl.DateTimeFormat("de-AT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(article.publishedAt))}
        </time>
      )}

      <hr />

      <article>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ArticleMarkdownImage,
          }}
        >
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
