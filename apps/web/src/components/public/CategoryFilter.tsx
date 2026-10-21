import Link from "next/link";
import { CategoryPicker } from "./CategoryPicker";
import { categoryOptions } from "../../lib/public-categories";
import type { Article } from "../../types/article";

export function CategoryFilter({ articles, active, basePath = "/" }: {
  articles: Article[]; active?: string; basePath?: string;
}) {
  const options = categoryOptions(articles);
  if (!options.length && !active) return null;
  return (
    <div className="category-filter">
      <span className="category-filter__label">Rubriken</span>
      <Link href={basePath} aria-current={!active ? "page" : undefined}>Alle ({articles.length})</Link>
      <CategoryPicker key={active ?? "all"} options={options} active={active} basePath={basePath} />
    </div>
  );
}
