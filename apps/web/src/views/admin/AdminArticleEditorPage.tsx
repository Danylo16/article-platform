"use client";
import { CoverPhotoEditor } from "../../components/admin/CoverPhotoEditor";
import { validateImageUpload } from "../../lib/image-upload";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  createArticle,
  deleteArticle,
  getAdminArticleById,
  getAuthors,
  getCategories,
  getPlaces,
  getSections,
  getTags,
  publishArticle,
  unpublishArticle,
  updateArticle,
  uploadMedia,
} from "../../api/client";
import { ArticleMarkdownImage } from "../../components/ArticleMarkdownImage";
import { InlineMediaEditor } from "../../components/admin/InlineMediaEditor";
import type {
  Article,
  ArticleStatus,
  Author,
  Category,
  Place,
  Section,
  Tag,
} from "../../types/article";

type FormState = {
  coverAlt: string;
  coverCaption: string;
  coverCredit: string;
  coverFocusX: number;
  coverFocusY: number;

  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  sectionId: string;
  categoryId: string;
  placeId: string;
  tagIds: string[];
};

type EditorMode = "write" | "preview";

const emptyForm: FormState = {
  coverAlt: "",
  coverCaption: "",
  coverCredit: "",
  coverFocusX: 50,
  coverFocusY: 50,

  title: "",
  subtitle: "",
  excerpt: "",
  content: "",
  coverImage: "",
  authorId: "",
  sectionId: "",
  categoryId: "",
  placeId: "",
  tagIds: [],
};

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "Чернетка",
  SCHEDULED: "Заплановано",
  PUBLISHED: "Опубліковано",
  ARCHIVED: "Архів",
};

function articleToForm(article: Article): FormState {
  return {
    title: article.title,
    subtitle: article.subtitle ?? "",
    excerpt: article.excerpt ?? "",
    content: article.content,
    coverImage: article.coverImage ?? "",
    coverAlt: article.coverAlt ?? "",
    coverCaption: article.coverCaption ?? "",
    coverCredit: article.coverCredit ?? "",
    coverFocusX: article.coverFocusX ?? 50,
    coverFocusY: article.coverFocusY ?? 50,

    authorId: article.authorId,
    sectionId: article.sectionId,
    categoryId: article.categoryId ?? "",
    placeId: article.placeId ?? "",
    tagIds: article.tags.map((item) => item.tagId),
  };
}

function normalizeForm(form: FormState): FormState {
  return {
    ...form,
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    excerpt: form.excerpt.trim(),
  };
}

function validateForm(form: FormState) {
  if (form.title.trim().length < 3) {
    return "Заголовок має містити щонайменше 3 символи.";
  }

  if (!form.content.trim()) {
    return "Текст статті обов’язковий.";
  }

  if (!form.authorId) {
    return "Оберіть автора.";
  }

  if (!form.sectionId) {
    return "Оберіть розділ.";
  }

  return null;
}

export function AdminArticleEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const isNew = !id;
  const markdownEditorRef = useRef<HTMLTextAreaElement>(null);
  const allowNavigationRef = useRef(false);

  const [article, setArticle] = useState<Article | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savedForm, setSavedForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("write");

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const selectedTags = useMemo(
    () => tags.filter((tag) => form.tagIds.includes(tag.id)),
    [tags, form.tagIds],
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [authorsData, sectionsData, categoriesData, tagsData, placesData] =
          await Promise.all([
            getAuthors(),
            getSections(),
            getCategories(),
            getTags(),
            getPlaces(),
          ]);

        setAuthors(authorsData);
        setSections(sectionsData);
        setCategories(categoriesData);
        setTags(tagsData);
        setPlaces(placesData);

        if (id) {
          const existingArticle = await getAdminArticleById(id);
          const existingForm = articleToForm(existingArticle);

          setArticle(existingArticle);
          setForm(existingForm);
          setSavedForm(existingForm);
          return;
        }

        const initialForm = {
          ...emptyForm,
          authorId: authorsData.length === 1 ? authorsData[0].id : "",
        };

        setForm(initialForm);
        setSavedForm(initialForm);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не вдалося завантажити редактор.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        allowNavigationRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const anchor = target instanceof Element ? target.closest("a") : null;

      if (!anchor || anchor.target === "_blank" || !anchor.href) {
        return;
      }

      if (!window.confirm("Є незбережені зміни. Залишити сторінку без збереження?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isDirty]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>("[data-editor-save]")?.click();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function updateField(field: keyof FormState, value: string | string[]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSavedMessage(null);
  }

  function toggleTag(tagId: string) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((existingId) => existingId !== tagId)
        : [...current.tagIds, tagId],
    }));
    setSavedMessage(null);
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);
      setError(null);
      await validateImageUpload(file);
      const uploaded = await uploadMedia(file);
      setForm(current => ({ ...current, coverImage: uploaded.url, coverFocusX: 50, coverFocusY: 50, coverAlt: "", coverCaption: "", coverCredit: "" }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Не вдалося завантажити обкладинку.",
      );
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  }

  async function persistArticle() {
    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return null;
    }

    const normalized = normalizeForm(form);

    if (isNew) {
      const created = await createArticle({
        title: normalized.title,
        subtitle: normalized.subtitle || undefined,
        excerpt: normalized.excerpt || undefined,
        content: normalized.content,
        coverImage: normalized.coverImage || undefined,
        coverAlt: normalized.coverAlt,
        coverCaption: normalized.coverCaption,
        coverCredit: normalized.coverCredit,
        coverFocusX: normalized.coverFocusX,
        coverFocusY: normalized.coverFocusY,

        authorId: normalized.authorId,
        sectionId: normalized.sectionId,
        categoryId: normalized.categoryId || undefined,
        placeId: normalized.placeId || undefined,
        tagIds: normalized.tagIds,
      });

      allowNavigationRef.current = true;
      router.replace(`/admin/articles/${created.id}`);
      return created;
    }

    if (!id) {
      return null;
    }

    const updated = await updateArticle(id, {
      title: normalized.title,
      subtitle: normalized.subtitle || null,
      excerpt: normalized.excerpt || null,
      content: normalized.content,
      coverImage: normalized.coverImage || null,
      coverAlt: normalized.coverAlt,
      coverCaption: normalized.coverCaption,
      coverCredit: normalized.coverCredit,
      coverFocusX: normalized.coverFocusX,
      coverFocusY: normalized.coverFocusY,

      authorId: normalized.authorId,
      sectionId: normalized.sectionId,
      categoryId: normalized.categoryId || null,
      placeId: normalized.placeId || null,
      tagIds: normalized.tagIds,
    });

    setArticle(updated);
    setForm(normalized);
    setSavedForm(normalized);
    return updated;
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSavedMessage(null);

      const saved = await persistArticle();
      if (saved && !isNew) {
        setSavedMessage("Збережено");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Не вдалося зберегти статтю.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!id) {
      setError("Спочатку збережіть нову статтю.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSavedMessage(null);

      const saved = await persistArticle();
      if (!saved) {
        return;
      }

      const published = await publishArticle(id);
      setArticle(published);
      setSavedMessage("Збережено й опубліковано");
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Не вдалося опублікувати статтю.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSavedMessage(null);

      if (isDirty) {
        const saved = await persistArticle();
        if (!saved) {
          return;
        }
      }

      const updated = await unpublishArticle(id);
      setArticle(updated);
      setSavedMessage("Перенесено в чернетки");
    } catch (unpublishError) {
      setError(
        unpublishError instanceof Error
          ? unpublishError.message
          : "Не вдалося зняти статтю з публікації.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !article) {
      return;
    }

    if (!window.confirm(`Безповоротно видалити статтю «${article.title}»?`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await deleteArticle(id);
      allowNavigationRef.current = true;
      router.replace("/admin/articles");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Не вдалося видалити статтю.",
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="editor-shell">
        <p>Завантажуємо редактор…</p>
      </main>
    );
  }

  const status = article?.status ?? "DRAFT";

  return (
    <main
      className="editor-shell"
      data-editor-dirty={isDirty ? "true" : "false"}
    >
      <header className="editor-topbar">
        <div>
          <div className="editor-status-row">
            <span className={`status-badge status-${status.toLowerCase()}`}>
              {isNew ? "Нова" : statusLabels[status]}
            </span>

            {isDirty && <span className="unsaved-badge">Є незбережені зміни</span>}
            {savedMessage && <span className="save-message">{savedMessage}</span>}
            {article?.readingTime ? (
              <span className="reading-time-badge">≈ {article.readingTime} хв читання</span>
            ) : null}
          </div>

          <h1>{isNew ? "Нова стаття" : "Редагування статті"}</h1>
        </div>

        <div className="editor-actions">
          <Link className="button button-secondary" href="/admin/articles">
            До списку
          </Link>

          {!isNew && article?.status === "PUBLISHED" && (
            <Link
              className="button button-secondary"
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Переглянути ↗
            </Link>
          )}

          <button
            className="button button-primary"
            type="button"
            data-editor-save
            onClick={() => void handleSave()}
            disabled={saving || uploadingCover || (!isDirty && !isNew)}
          >
            {saving ? "Зберігаємо…" : "Зберегти"}
          </button>

          {!isNew && article?.status !== "PUBLISHED" && (
            <button
              className="button button-publish"
              type="button"
              onClick={() => void handlePublish()}
              disabled={saving || uploadingCover}
            >
              Опублікувати
            </button>
          )}

          {!isNew && article?.status === "PUBLISHED" && (
            <button
              className="button button-danger"
              type="button"
              onClick={() => void handleUnpublish()}
              disabled={saving || uploadingCover}
            >
              Зняти з публікації
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="editor-error" role="alert">
          {error}
        </div>
      )}

      <section className="editor-meta-card">
        <div className="cover-section">
          <div className="cover-header">
            <div>
              <strong>Обкладинка</strong>
              <p>JPEG, PNG або WebP. Максимум 10 МБ.</p>
            </div>

            <label className="button button-secondary cover-upload-button">
              {uploadingCover
                ? "Завантажуємо…"
                : form.coverImage
                  ? "Замінити обкладинку"
                  : "Додати обкладинку"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={uploadingCover || saving}
                onChange={(event) => void handleCoverUpload(event)}
              />
            </label>
          </div>

          {form.coverImage && (
            <CoverPhotoEditor value={form} disabled={saving || uploadingCover}
              onChange={patch => setForm(current => ({ ...current, ...patch }))} />
          )}
        </div>

        <div className="form-grid">
          <label className="form-field form-field-wide">
            <span className="form-field__heading">
              <span>Заголовок *</span>
              <small>{form.title.length}/200</small>
            </span>
            <input
              type="text"
              value={form.title}
              maxLength={200}
              placeholder="Заголовок статті"
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>

          <label className="form-field form-field-wide">
            <span className="form-field__heading">
              <span>Підзаголовок</span>
              <small>{form.subtitle.length}/300</small>
            </span>
            <input
              type="text"
              value={form.subtitle}
              maxLength={300}
              placeholder="Необов’язковий підзаголовок"
              onChange={(event) => updateField("subtitle", event.target.value)}
            />
          </label>

          <label className="form-field form-field-wide">
            <span className="form-field__heading">
              <span>Анонс</span>
              <small>{form.excerpt.length}/500</small>
            </span>
            <textarea
              rows={3}
              value={form.excerpt}
              maxLength={500}
              placeholder="Короткий опис для головної сторінки"
              onChange={(event) => updateField("excerpt", event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Розділ *</span>
            <select
              value={form.sectionId}
              onChange={(event) => updateField("sectionId", event.target.value)}
            >
              <option value="">Оберіть розділ</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Автор *</span>
            <select
              value={form.authorId}
              onChange={(event) => updateField("authorId", event.target.value)}
            >
              <option value="">Оберіть автора</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Рубрика</span>
            <select
              value={form.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
            >
              <option value="">Без рубрики</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Місце на карті</span>
            <select
              value={form.placeId}
              onChange={(event) => updateField("placeId", event.target.value)}
            >
              <option value="">Без місця</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name} — {place.address}
                </option>
              ))}
            </select>
            <small className="form-field__hint">
              Місцями можна керувати в окремому розділі CMS.
            </small>
          </label>
        </div>

        <div className="tags-block">
          <span className="tags-label">Теги</span>
          <div className="tag-list">
            {tags.length === 0 && <span className="tag-empty">Тегів ще немає</span>}
            {tags.map((tag) => {
              const selected = form.tagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${selected ? "tag-chip-selected" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                  disabled={saving}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          {selectedTags.length > 0 && (
            <p className="selected-tags">
              Обрано: {selectedTags.map((tag) => tag.name).join(", ")}
            </p>
          )}
        </div>
      </section>

      <div className="editor-mobile-tabs" aria-label="Режим редактора">
        <button
          type="button"
          className={editorMode === "write" ? "is-active" : ""}
          onClick={() => setEditorMode("write")}
        >
          Текст
        </button>
        <button
          type="button"
          className={editorMode === "preview" ? "is-active" : ""}
          onClick={() => setEditorMode("preview")}
        >
          Перегляд
        </button>
      </div>

      <section className="editor-workspace">
        <div
          className={`editor-column ${editorMode !== "write" ? "editor-pane--mobile-hidden" : ""}`}
        >
          <div className="column-header">
            <h2>Markdown</h2>
            <span>{form.content.length} символів</span>
          </div>

          <InlineMediaEditor
            content={form.content}
            onChange={(content) => updateField("content", content)}
            textareaRef={markdownEditorRef}
          />

          <textarea
            ref={markdownEditorRef}
            className="markdown-editor"
            value={form.content}
            placeholder="# Почніть писати…"
            onChange={(event) => updateField("content", event.target.value)}
          />
        </div>

        <div
          className={`preview-column ${editorMode !== "preview" ? "editor-pane--mobile-hidden" : ""}`}
        >
          <div className="column-header">
            <h2>Попередній перегляд</h2>
            <span>Наживо</span>
          </div>

          <article className="markdown-preview">
            {form.content.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ img: ArticleMarkdownImage }}
              >
                {form.content}
              </ReactMarkdown>
            ) : (
              <p className="preview-empty">Тут з’явиться попередній перегляд тексту.</p>
            )}
          </article>
        </div>
      </section>

      {!isNew && (
        <section className="editor-danger-zone">
          <div>
            <strong>Видалення статті</strong>
            <p>Цю дію неможливо скасувати.</p>
          </div>
          <button
            className="button button-ghost-danger"
            type="button"
            onClick={() => void handleDelete()}
            disabled={saving || uploadingCover}
          >
            Видалити статтю
          </button>
        </section>
      )}
    </main>
  );
}
