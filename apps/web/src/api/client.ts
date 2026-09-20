import type {
  Article,
  Author,
  Category,
  Tag,
} from "../types/article";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export type AdminUser = {
  id: string;
  email: string;
};

async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/admin/login"
  ) {
    window.location.assign("/admin/login");
  }

  return response;
}

export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<AdminUser> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid email or password");
    }

    if (response.status === 429) {
      throw new Error("Too many login attempts. Try again later.");
    }

    throw new Error("Login failed");
  }

  const body = (await response.json()) as {
    user: AdminUser;
  };

  return body.user;
}

export async function logoutAdmin(): Promise<void> {
  const response = await apiFetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export async function getAdminArticles(): Promise<Article[]> {
  const response = await apiFetch(
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
  const response = await apiFetch(
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
  const response = await apiFetch(
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
    authorId: string;
    categoryId: string | null;
    tagIds: string[];
  }>,
): Promise<Article> {
  const response = await apiFetch(
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
  const response = await apiFetch(
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
  const response = await apiFetch(
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
  const response = await apiFetch(
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
  const response = await apiFetch(
    `${API_URL}/admin/categories`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export async function createCategory(name: string): Promise<Category> {
  const response = await apiFetch(`${API_URL}/admin/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return response.json();
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<Category> {
  const response = await apiFetch(`${API_URL}/admin/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to update category");
  }

  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Category is still used by articles");
  }
}

export async function getAuthors(): Promise<Author[]> {
  const response = await apiFetch(
    `${API_URL}/admin/authors`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch authors");
  }

  return response.json();
}

export async function createAuthor(input: {
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
}): Promise<Author> {
  const response = await apiFetch(`${API_URL}/admin/authors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create author");
  }

  return response.json();
}

export async function updateAuthor(
  id: string,
  input: {
    name: string;
    bio?: string | null;
    avatarUrl?: string | null;
  },
): Promise<Author> {
  const response = await apiFetch(`${API_URL}/admin/authors/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update author");
  }

  return response.json();
}

export async function deleteAuthor(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/authors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Author is still assigned to articles");
  }
}

export async function getTags(): Promise<Tag[]> {
  const response = await apiFetch(
    `${API_URL}/admin/tags`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  return response.json();
}

export async function createTag(name: string): Promise<Tag> {
  const response = await apiFetch(`${API_URL}/admin/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create tag");
  }

  return response.json();
}

export async function updateTag(
  id: string,
  name: string,
): Promise<Tag> {
  const response = await apiFetch(`${API_URL}/admin/tags/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to update tag");
  }

  return response.json();
}

export async function deleteTag(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/tags/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Tag is still used by articles");
  }
}

export async function uploadMedia(
  file: File,
): Promise<{
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
}> {
  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Only JPEG, PNG and WebP images are supported");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("The image must be smaller than 10 MB");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await apiFetch(
    `${API_URL}/admin/media`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session expired. Sign in again");
    }

    if (response.status === 413) {
      throw new Error("The image must be smaller than 10 MB");
    }

    if (response.status === 415) {
      throw new Error("Only JPEG, PNG and WebP images are supported");
    }

    throw new Error(`Image upload failed (${response.status})`);
  }

  return response.json();
}
