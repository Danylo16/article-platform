import type {
  Article,
  Author,
  Category,
  Tag,
} from "../types/article";

const API_URL = "http://localhost:3000";

export async function getArticles(): Promise<Article[]> {
  const response = await fetch(`${API_URL}/articles`);

  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }

  return response.json();
}

export async function getArticleBySlug(
  slug: string,
): Promise<Article> {
  const response = await fetch(
    `${API_URL}/articles/${slug}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }

  return response.json();
}

export async function getAdminArticles(): Promise<Article[]> {
  const response = await fetch(
    `${API_URL}/admin/articles`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch admin articles");
  }

  return response.json();
}

export async function getAdminArticleById(
  id: string,
): Promise<Article> {
  const response = await fetch(
    `${API_URL}/admin/articles/${id}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }

  return response.json();
}

export async function createArticle(input: {
  title: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  authorId: string;
  categoryId?: string;
  tagIds: string[];
}): Promise<Article> {
  const response = await fetch(
    `${API_URL}/admin/articles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create article");
  }

  return response.json();
}

export async function updateArticle(
  id: string,
  input: Partial<{
    title: string;
    subtitle: string | null;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    categoryId: string | null;
    tagIds: string[];
  }>,
): Promise<Article> {
  const response = await fetch(
    `${API_URL}/admin/articles/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update article");
  }

  return response.json();
}

export async function publishArticle(
  id: string,
): Promise<Article> {
  const response = await fetch(
    `${API_URL}/admin/articles/${id}/publish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to publish article");
  }

  return response.json();
}

export async function unpublishArticle(
  id: string,
): Promise<Article> {
  const response = await fetch(
    `${API_URL}/admin/articles/${id}/unpublish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to unpublish article");
  }

  return response.json();
}

export async function deleteArticle(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/admin/articles/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete article");
  }
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    `${API_URL}/admin/categories`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export async function getAuthors(): Promise<Author[]> {
  const response = await fetch(
    `${API_URL}/admin/authors`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch authors");
  }

  return response.json();
}

export async function getTags(): Promise<Tag[]> {
  const response = await fetch(
    `${API_URL}/admin/tags`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  return response.json();
}

export async function uploadMedia(
  file: File,
): Promise<{
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
}> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/admin/media`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to upload media");
  }

  return response.json();
}