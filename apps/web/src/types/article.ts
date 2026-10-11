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

export interface Section {
  id: string;
  name: string;
  slug: string;
  navigationOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

export type PlaceIconName =
  | "coffee"
  | "restaurant"
  | "music"
  | "museum"
  | "shopping"
  | "park"
  | "hotel"
  | "landmark";

export interface LocationType {
  id: string;
  name: string;
  slug: string;
  icon: PlaceIconName;
  navigationOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    places: number;
  };
}

export interface PlaceArticle {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  typeId: string;
  type: LocationType;
  address: string;
  latitude: number;
  longitude: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  articles?: PlaceArticle[];
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
  sectionId: string;
  categoryId: string | null;
  placeId: string | null;
  createdAt: string;
  updatedAt: string;

  author: Author;
  section: Section;
  category: Category | null;
  place: Place | null;
  tags: ArticleTag[];
}
