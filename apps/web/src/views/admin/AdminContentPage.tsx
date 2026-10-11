"use client";

import { useEffect, useState } from "react";

import {
  createAuthor,
  createCategory,
  createTag,
  deleteAuthor,
  deleteCategory,
  deleteTag,
  getAuthors,
  getCategories,
  getTags,
  updateAuthor,
  updateCategory,
  updateTag,
} from "../../api/client";
import type {
  Author,
  Category,
  Tag,
} from "../../types/article";

type NamedEntity = Category | Tag;

type NamedEntitySectionProps = {
  title: string;
  description: string;
  singular: string;
  createPlaceholder: string;
  emptyMessage: string;
  items: NamedEntity[];
  busy: boolean;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function formatArticleCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} статей`;
  }

  if (last === 1) {
    return `${count} стаття`;
  }

  if (last >= 2 && last <= 4) {
    return `${count} статті`;
  }

  return `${count} статей`;
}

function EditableNamedRow({
  item,
  singular,
  busy,
  onUpdate,
  onDelete,
}: {
  item: NamedEntity;
  singular: string;
  busy: boolean;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(item.name);
  const usageCount = item._count?.articles ?? 0;
  const unchanged = name.trim() === item.name;

  return (
    <div className="content-admin-row">
      <label>
        <span className="sr-only">Назва: {singular.toLowerCase()}</span>
        <input
          type="text"
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <code>{item.slug}</code>
      <span className="content-admin-row__usage">
        {formatArticleCount(usageCount)}
      </span>

      <button
        className="content-admin-button"
        type="button"
        disabled={busy || unchanged || name.trim().length < 2}
        onClick={() => {
          void onUpdate(item.id, name.trim()).catch(() => undefined);
        }}
      >
        Зберегти
      </button>

      <button
        className="content-admin-button content-admin-button--danger"
        type="button"
        disabled={busy || usageCount > 0}
        title={
          usageCount > 0
            ? `Спочатку приберіть «${item.name}» зі статей`
            : undefined
        }
        onClick={() => {
          if (window.confirm(`Видалити «${item.name}»?`)) {
            void onDelete(item.id).catch(() => undefined);
          }
        }}
      >
        Видалити
      </button>
    </div>
  );
}

function NamedEntitySection({
  title,
  description,
  singular,
  createPlaceholder,
  emptyMessage,
  items,
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: NamedEntitySectionProps) {
  const [newName, setNewName] = useState("");

  return (
    <section className="content-admin-section">
      <div className="content-admin-section__heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            const name = newName.trim();

            if (name.length < 2) {
              return;
            }

            void onCreate(name)
              .then(() => setNewName(""))
              .catch(() => undefined);
          }}
        >
          <input
            type="text"
            value={newName}
            maxLength={100}
            placeholder={createPlaceholder}
            onChange={(event) => setNewName(event.target.value)}
          />
          <button
            className="content-admin-button content-admin-button--primary"
            type="submit"
            disabled={busy || newName.trim().length < 2}
          >
            Додати
          </button>
        </form>
      </div>

      <div className="content-admin-list">
        {items.length === 0 && (
          <p className="content-admin-empty">{emptyMessage}</p>
        )}

        {items.map((item) => (
          <EditableNamedRow
            key={item.id}
            item={item}
            singular={singular}
            busy={busy}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function EditableAuthorRow({
  author,
  busy,
  onUpdate,
  onDelete,
}: {
  author: Author;
  busy: boolean;
  onUpdate: (
    id: string,
    input: { name: string; bio: string | null; avatarUrl: string | null },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(author.name);
  const [bio, setBio] = useState(author.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(author.avatarUrl ?? "");
  const usageCount = author._count?.articles ?? 0;
  const unchanged =
    name.trim() === author.name &&
    bio.trim() === (author.bio ?? "") &&
    avatarUrl.trim() === (author.avatarUrl ?? "");

  return (
    <div className="content-admin-author">
      <div className="content-admin-author__fields">
        <label>
          <span>Ім’я</span>
          <input
            type="text"
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          <span>URL аватара</span>
          <input
            type="text"
            value={avatarUrl}
            maxLength={500}
            placeholder="/uploads/..."
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
        </label>

        <label className="content-admin-author__bio">
          <span>Біографія</span>
          <textarea
            rows={2}
            value={bio}
            maxLength={1000}
            onChange={(event) => setBio(event.target.value)}
          />
        </label>
      </div>

      <div className="content-admin-author__actions">
        <span>
          {formatArticleCount(usageCount)}
        </span>
        <button
          className="content-admin-button"
          type="button"
          disabled={busy || unchanged || name.trim().length < 2}
          onClick={() => {
            void onUpdate(author.id, {
              name: name.trim(),
              bio: bio.trim() || null,
              avatarUrl: avatarUrl.trim() || null,
            }).catch(() => undefined);
          }}
        >
          Зберегти
        </button>
        <button
          className="content-admin-button content-admin-button--danger"
          type="button"
          disabled={busy || usageCount > 0}
          title={
            usageCount > 0
              ? "Спочатку призначте статтям іншого автора"
              : undefined
          }
          onClick={() => {
            if (window.confirm(`Видалити автора «${author.name}»?`)) {
              void onDelete(author.id).catch(() => undefined);
            }
          }}
        >
          Видалити
        </button>
      </div>
    </div>
  );
}

export function AdminContentPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
  });

  async function refreshData() {
    const [authorsData, categoriesData, tagsData] = await Promise.all([
      getAuthors(),
      getCategories(),
      getTags(),
    ]);

    setAuthors(authorsData);
    setCategories(categoriesData);
    setTags(tagsData);
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAuthors(), getCategories(), getTags()])
      .then(([authorsData, categoriesData, tagsData]) => {
        if (!cancelled) {
          setAuthors(authorsData);
          setCategories(categoriesData);
          setTags(tagsData);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Не вдалося завантажити довідники CMS.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function runMutation(action: () => Promise<unknown>) {
    try {
      setBusy(true);
      setError(null);
      await action();
      await refreshData();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Не вдалося зберегти зміни.",
      );
      throw mutationError;
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="content-admin-shell">Завантажуємо довідники…</main>;
  }

  return (
    <main className="content-admin-shell">
      <header className="content-admin-header">
        <div>
          <span>Редакційний простір</span>
          <h1>Довідники</h1>
          <p>Керування</p>
        </div>
      </header>

      {error && (
        <div className="content-admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="content-admin-section">
        <div className="content-admin-section__heading">
          <div>
            <h2>Автори</h2>
            <p>Автора не можна видалити, доки до нього прив’язані статті.</p>
          </div>
        </div>

        <form
          className="content-admin-new-author"
          onSubmit={(event) => {
            event.preventDefault();

            if (newAuthor.name.trim().length < 2) {
              return;
            }

            void runMutation(() =>
              createAuthor({
                name: newAuthor.name.trim(),
                bio: newAuthor.bio.trim() || null,
                avatarUrl: newAuthor.avatarUrl.trim() || null,
              }),
            )
              .then(() =>
                setNewAuthor({
                  name: "",
                  bio: "",
                  avatarUrl: "",
                }),
              )
              .catch(() => undefined);
          }}
        >
          <input
            type="text"
            value={newAuthor.name}
            placeholder="Ім’я автора"
            maxLength={120}
            onChange={(event) =>
              setNewAuthor((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
          <input
            type="text"
            value={newAuthor.avatarUrl}
            placeholder="URL аватара (необов’язково)"
            maxLength={500}
            onChange={(event) =>
              setNewAuthor((current) => ({
                ...current,
                avatarUrl: event.target.value,
              }))
            }
          />
          <input
            type="text"
            value={newAuthor.bio}
            placeholder="Коротка біографія (необов’язково)"
            maxLength={1000}
            onChange={(event) =>
              setNewAuthor((current) => ({
                ...current,
                bio: event.target.value,
              }))
            }
          />
          <button
            className="content-admin-button content-admin-button--primary"
            type="submit"
            disabled={busy || newAuthor.name.trim().length < 2}
          >
            Додати автора
          </button>
        </form>

        <div className="content-admin-list">
          {authors.map((author) => (
            <EditableAuthorRow
              key={author.id}
              author={author}
              busy={busy}
              onUpdate={(id, input) =>
                runMutation(() => updateAuthor(id, input)).then(() => undefined)
              }
              onDelete={(id) =>
                runMutation(() => deleteAuthor(id)).then(() => undefined)
              }
            />
          ))}
        </div>
      </section>

      <NamedEntitySection
        title="Рубрики"
        description="Перейменування рубрики оновить її всюди, не змінюючи посилання на статті."
        singular="Рубрика"
        createPlaceholder="Нова рубрика"
        emptyMessage="Рубрик ще немає."
        items={categories}
        busy={busy}
        onCreate={(name) =>
          runMutation(() => createCategory(name)).then(() => undefined)
        }
        onUpdate={(id, name) =>
          runMutation(() => updateCategory(id, name)).then(() => undefined)
        }
        onDelete={(id) =>
          runMutation(() => deleteCategory(id)).then(() => undefined)
        }
      />

      <NamedEntitySection
        title="Теги"
        description="Тег не можна видалити, доки він використовується у статтях."
        singular="Тег"
        createPlaceholder="Новий тег"
        emptyMessage="Тегів ще немає."
        items={tags}
        busy={busy}
        onCreate={(name) =>
          runMutation(() => createTag(name)).then(() => undefined)
        }
        onUpdate={(id, name) =>
          runMutation(() => updateTag(id, name)).then(() => undefined)
        }
        onDelete={(id) =>
          runMutation(() => deleteTag(id)).then(() => undefined)
        }
      />
    </main>
  );
}
