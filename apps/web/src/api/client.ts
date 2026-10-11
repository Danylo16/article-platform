import type {
  Article,
  Author,
  Category,
  LocationType,
  Place,
  PlaceIconName,
  Section,
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
      throw new Error("Неправильна електронна пошта або пароль");
    }

    if (response.status === 429) {
      throw new Error("Забагато спроб входу. Спробуйте пізніше.");
    }

    throw new Error("Не вдалося увійти");
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
    throw new Error("Не вдалося вийти із системи");
  }
}

export async function getAdminArticles(): Promise<Article[]> {
  const response = await apiFetch(
    `${API_URL}/admin/articles`,
  );

  if (!response.ok) {
    throw new Error("Не вдалося завантажити статті");
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
    throw new Error("Не вдалося завантажити статтю");
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
  sectionId: string;
  categoryId?: string;
  placeId?: string;
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
    throw new Error("Не вдалося створити статтю");
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
    sectionId: string;
    categoryId: string | null;
    placeId: string | null;
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
    throw new Error("Не вдалося зберегти статтю");
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
    throw new Error("Не вдалося опублікувати статтю");
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
    throw new Error("Не вдалося зняти статтю з публікації");
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
    throw new Error("Не вдалося видалити статтю");
  }
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiFetch(
    `${API_URL}/admin/categories`,
  );

  if (!response.ok) {
    throw new Error("Не вдалося завантажити рубрики");
  }

  return response.json();
}

export async function getSections(): Promise<Section[]> {
  const response = await apiFetch(`${API_URL}/admin/sections`);

  if (!response.ok) {
    throw new Error("Не вдалося завантажити розділи");
  }

  return response.json();
}

export async function updateSection(
  id: string,
  input: Partial<{
    name: string;
    navigationOrder: number;
    isVisible: boolean;
  }>,
): Promise<Section> {
  const response = await apiFetch(`${API_URL}/admin/sections/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Не вдалося оновити розділ");
  }

  return response.json();
}

export async function getLocationTypes(): Promise<LocationType[]> {
  const response = await apiFetch(`${API_URL}/admin/location-types`);

  if (!response.ok) {
    throw new Error("Не вдалося завантажити типи місць");
  }

  return response.json();
}

export async function createLocationType(input: {
  name: string;
  icon: PlaceIconName;
  navigationOrder: number;
  isVisible: boolean;
}): Promise<LocationType> {
  const response = await apiFetch(`${API_URL}/admin/location-types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Тип місця з такою назвою вже існує");
    }

    throw new Error("Не вдалося створити тип місця");
  }

  return response.json();
}

export async function updateLocationType(
  id: string,
  input: Partial<{
    name: string;
    icon: PlaceIconName;
    navigationOrder: number;
    isVisible: boolean;
  }>,
): Promise<LocationType> {
  const response = await apiFetch(`${API_URL}/admin/location-types/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Тип місця з такою назвою вже існує");
    }

    throw new Error("Не вдалося оновити тип місця");
  }

  return response.json();
}

export async function deleteLocationType(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/location-types/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Спочатку призначте місцям інший тип");
    }

    throw new Error("Не вдалося видалити тип місця");
  }
}

export async function geocodeAddress(address: string): Promise<{
  address: string;
  latitude: number;
  longitude: number;
}> {
  const response = await apiFetch(`${API_URL}/admin/geocoding/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Адресу не знайдено. Уточніть вулицю, номер і місто");
    }

    if (response.status === 429) {
      throw new Error("Зачекайте секунду перед наступним пошуком");
    }

    throw new Error("Сервіс пошуку адрес тимчасово недоступний");
  }

  return response.json();
}

export async function getPlaces(): Promise<Place[]> {
  const response = await apiFetch(`${API_URL}/admin/places`);

  if (!response.ok) {
    throw new Error("Не вдалося завантажити місця");
  }

  return response.json();
}

export async function createPlace(input: {
  name: string;
  typeId: string;
  address: string;
  latitude: number;
  longitude: number;
  isVisible: boolean;
}): Promise<Place> {
  const response = await apiFetch(`${API_URL}/admin/places`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Місце з такою назвою вже існує");
    }

    throw new Error("Не вдалося створити місце");
  }

  return response.json();
}

export async function updatePlace(
  id: string,
  input: Partial<{
    name: string;
    typeId: string;
    address: string;
    latitude: number;
    longitude: number;
    isVisible: boolean;
  }>,
): Promise<Place> {
  const response = await apiFetch(`${API_URL}/admin/places/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Місце з такою назвою вже існує");
    }

    throw new Error("Не вдалося оновити місце");
  }

  return response.json();
}

export async function deletePlace(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/places/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Спочатку відв’яжіть місце від усіх статей");
    }

    throw new Error("Не вдалося видалити місце");
  }
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
    throw new Error("Не вдалося створити рубрику");
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
    throw new Error("Не вдалося оновити рубрику");
  }

  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Рубрика все ще використовується у статтях");
  }
}

export async function getAuthors(): Promise<Author[]> {
  const response = await apiFetch(
    `${API_URL}/admin/authors`,
  );

  if (!response.ok) {
    throw new Error("Не вдалося завантажити авторів");
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
    throw new Error("Не вдалося створити автора");
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
    throw new Error("Не вдалося оновити автора");
  }

  return response.json();
}

export async function deleteAuthor(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/authors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Автор усе ще прив’язаний до статей");
  }
}

export async function getTags(): Promise<Tag[]> {
  const response = await apiFetch(
    `${API_URL}/admin/tags`,
  );

  if (!response.ok) {
    throw new Error("Не вдалося завантажити теги");
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
    throw new Error("Не вдалося створити тег");
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
    throw new Error("Не вдалося оновити тег");
  }

  return response.json();
}

export async function deleteTag(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/tags/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Тег усе ще використовується у статтях");
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
    throw new Error("Підтримуються лише зображення JPEG, PNG і WebP");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Зображення має бути меншим за 10 МБ");
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
      throw new Error("Сесія завершилася. Увійдіть знову");
    }

    if (response.status === 413) {
      throw new Error("Зображення має бути меншим за 10 МБ");
    }

    if (response.status === 415) {
      throw new Error("Підтримуються лише зображення JPEG, PNG і WebP");
    }

    throw new Error(`Не вдалося завантажити зображення (${response.status})`);
  }

  return response.json();
}
