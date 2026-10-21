"use client";

import { isInstagramUrl } from "../../lib/social-links";
import { AuthorPhotoUpload } from "../../components/admin/AuthorPhotoUpload";
import { PublicCategorySettings } from "../../components/admin/PublicCategorySettings";
import { useEffect, useState } from "react";
import { AdminCollection, AdminDraftGuard, AdminRecord, confirmAdminDiscard } from "@/components/admin/AdminCollection";


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
    <AdminRecord title={item.name} meta={`${item.slug} · ${formatArticleCount(usageCount)}`} dirty={!unchanged}>
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
    </AdminRecord>
  );
}

function NamedEntitySection({
  title,
  description,
  singular,
  createPlaceholder,
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

        <form data-admin-dirty={newName ? "true" : undefined} data-editor-dirty={newName ? "true" : undefined}
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
            aria-label={createPlaceholder}
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

      <AdminCollection busy={busy} items={items} label={title} renderItem={(item) => (
        <EditableNamedRow key={JSON.stringify(item)} item={item} singular={singular} busy={busy}
          onUpdate={onUpdate} onDelete={onDelete} />
      )} />
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
    input: { name: string; bio: string | null; avatarUrl: string | null; instagramUrl: string | null },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(author.name);
  const [bio, setBio] = useState(author.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(author.avatarUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(author.instagramUrl ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const usageCount = author._count?.articles ?? 0;
  const unchanged =
    name.trim() === author.name &&
    bio.trim() === (author.bio ?? "") &&
    avatarUrl.trim() === (author.avatarUrl ?? "") && instagramUrl.trim() === (author.instagramUrl ?? "");

  return (
    <AdminRecord title={author.name} meta={formatArticleCount(usageCount)} dirty={!unchanged || uploadingAvatar}>
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

        <AuthorPhotoUpload value={avatarUrl} onChange={setAvatarUrl} onBusy={setUploadingAvatar} disabled={busy} />
        <label><span>Instagram автора</span><input type="url" value={instagramUrl} maxLength={500}
          placeholder="https://www.instagram.com/…" aria-invalid={!isInstagramUrl(instagramUrl)} onChange={event => setInstagramUrl(event.target.value)} />{!isInstagramUrl(instagramUrl) && <small role="alert">Вкажіть повне HTTPS-посилання на Instagram.</small>}</label>

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
          disabled={busy || uploadingAvatar || unchanged || name.trim().length < 2 || !isInstagramUrl(instagramUrl)}
          onClick={() => {
            void onUpdate(author.id, {
              name: name.trim(),
              bio: bio.trim() || null,
              avatarUrl: avatarUrl.trim() || null,
              instagramUrl: instagramUrl.trim() || null,
            }).catch(() => undefined);
          }}
        >
          Зберегти
        </button>
        <button
          className="content-admin-button content-admin-button--danger"
          type="button"
          disabled={busy || uploadingAvatar || usageCount > 0}
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
    </AdminRecord>
  );
}

export function AdminContentPage() {
  const [uploadingNewAvatar, setUploadingNewAvatar] = useState(false);
  const [tab, setTab] = useState("authors");
  const [message, setMessage] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    bio: "",
    avatarUrl: "", instagramUrl: "",
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
      setMessage(null);
      await action();
      await refreshData();
      setMessage("Зміни збережено.");
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
      <AdminDraftGuard />
      <header className="content-admin-header">
        <div>
          <span>Редакційний простір</span>
          <h1>Довідники</h1>
          <p>Автори, рубрики й теги. Відкрийте запис для редагування.</p>
        </div>
      </header>

      {error && (
        <div className="content-admin-error" role="alert">
          {error}
        </div>
      )}

      {message && <p className="save-message" role="status">{message}</p>}
      <nav className="admin-collection-tabs" aria-label="Довідники">
        {[["authors", "Автори", authors.length], ["categories", "Рубрики", categories.length], ["tags", "Теги", tags.length]].map(([value, label, count]) => (
          <button type="button" className="admin-button" disabled={busy || uploadingNewAvatar} key={value} aria-pressed={tab === value}
            onClick={() => { if (value !== tab && confirmAdminDiscard()) { setTab(String(value)); setNewAuthor({ name: "", bio: "", avatarUrl: "", instagramUrl: "" }); } }}>
            {label} · {count}
          </button>
        ))}
      </nav>
      {tab === "authors" && <section className="content-admin-section">
        <div className="content-admin-section__heading">
          <div>
            <h2>Автори</h2>
            <p>Автора не можна видалити, доки до нього прив’язані статті.</p>
          </div>
        </div>

        <form
          className="content-admin-new-author"
          data-admin-dirty={(uploadingNewAvatar || Object.values(newAuthor).some(Boolean)) ? "true" : undefined}
          data-editor-dirty={(uploadingNewAvatar || Object.values(newAuthor).some(Boolean)) ? "true" : undefined}
          onSubmit={(event) => {
            event.preventDefault();

            if (uploadingNewAvatar || !isInstagramUrl(newAuthor.instagramUrl) || newAuthor.name.trim().length < 2) {
              return;
            }

            void runMutation(() =>
              createAuthor({
                name: newAuthor.name.trim(),
                bio: newAuthor.bio.trim() || null,
                avatarUrl: newAuthor.avatarUrl.trim() || null,
                instagramUrl: newAuthor.instagramUrl.trim() || null,
              }),
            )
              .then(() =>
                setNewAuthor({
                  name: "",
                  bio: "",
                  avatarUrl: "", instagramUrl: "",
                }),
              )
              .catch(() => undefined);
          }}
        >
          <input
            type="text"
            value={newAuthor.name}
            aria-label="Ім’я автора"
            placeholder="Ім’я автора"
            maxLength={120}
            onChange={(event) =>
              setNewAuthor((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
          <AuthorPhotoUpload value={newAuthor.avatarUrl} onBusy={setUploadingNewAvatar} disabled={busy}
            onChange={avatarUrl => setNewAuthor(current => ({ ...current, avatarUrl }))} />
          <label>Instagram автора<input type="url" value={newAuthor.instagramUrl} maxLength={500}
            placeholder="https://www.instagram.com/…" aria-invalid={!isInstagramUrl(newAuthor.instagramUrl)} onChange={event => setNewAuthor(current => ({ ...current, instagramUrl: event.target.value }))} />{!isInstagramUrl(newAuthor.instagramUrl) && <small role="alert">Вкажіть повне HTTPS-посилання на Instagram.</small>}</label>
          <input
            type="text"
            value={newAuthor.bio}
            aria-label="Коротка біографія (необов’язково)"
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
            disabled={busy || uploadingNewAvatar || !isInstagramUrl(newAuthor.instagramUrl) || newAuthor.name.trim().length < 2}
          >
            Додати автора
          </button>
        </form>

        <AdminCollection busy={busy} items={authors.map(author => ({ ...author, slug: author.id }))} label="Автори" renderItem={author => (
          <EditableAuthorRow key={JSON.stringify(author)} author={author} busy={busy}
            onUpdate={(id, input) => runMutation(() => updateAuthor(id, input)).then(() => undefined)}
            onDelete={id => runMutation(() => deleteAuthor(id)).then(() => undefined)} />
        )} />
      </section>}

      {tab === "categories" && <PublicCategorySettings />}

      {tab === "categories" && <NamedEntitySection
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
      />}

      {tab === "tags" && <NamedEntitySection
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
      />}
    </main>
  );
}
