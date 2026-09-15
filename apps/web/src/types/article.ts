export type ArticleStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  _count?: {
    articles: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    articles: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    articles: number;
  };
}

export interface ArticleTag {
  articleId: string;
  tagId: string;
  tag: Tag;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  readingTime: number | null;
  status: ArticleStatus;
  publishedAt: string | null;
  authorId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;

  author: Author;
  category: Category | null;
  tags: ArticleTag[];
}
