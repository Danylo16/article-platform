"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  createArticle,
  getAdminArticleById,
  getAuthors,
  getCategories,
  getTags,
  publishArticle,
  unpublishArticle,
  updateArticle,
  uploadMedia,
} from "../../api/client";

import type {
  Article,
  Author,
  Category,
  Tag,
} from "../../types/article";
import { getMediaUrl } from "../../api/media";
import { ArticleMarkdownImage } from "../../components/ArticleMarkdownImage";
import { InlineMediaEditor } from "../../components/admin/InlineMediaEditor";

type FormState = {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  categoryId: string;
  tagIds: string[];
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  excerpt: "",
  content: "",
  coverImage: "",
  authorId: "",
  categoryId: "",
  tagIds: [],
};

export function AdminArticleEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const isNew = !id;
  const markdownEditorRef = useRef<HTMLTextAreaElement>(null);

  const [article, setArticle] =
    useState<Article | null>(null);

  const [authors, setAuthors] =
    useState<Author[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    uploadingCover,
    setUploadingCover,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    savedMessage,
    setSavedMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          authorsData,
          categoriesData,
          tagsData,
        ] = await Promise.all([
          getAuthors(),
          getCategories(),
          getTags(),
        ]);

        setAuthors(authorsData);
        setCategories(categoriesData);
        setTags(tagsData);

        if (id) {
          const existingArticle =
            await getAdminArticleById(id);

          setArticle(existingArticle);

          setForm({
            title: existingArticle.title,
            subtitle:
              existingArticle.subtitle ?? "",
            excerpt:
              existingArticle.excerpt ?? "",
            content: existingArticle.content,
            coverImage:
              existingArticle.coverImage ?? "",
            authorId:
              existingArticle.authorId,
            categoryId:
              existingArticle.categoryId ?? "",
            tagIds:
              existingArticle.tags.map(
                (item) => item.tagId,
              ),
          });

          return;
        }

        setForm((current) => ({
          ...current,
          authorId:
            authorsData.length === 1
              ? authorsData[0].id
              : "",
        }));
      } catch {
        setError(
          "Failed to load editor data",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const selectedTags = useMemo(
    () =>
      tags.filter((tag) =>
        form.tagIds.includes(tag.id),
      ),
    [tags, form.tagIds],
  );

  function updateField(
    field: keyof FormState,
    value: string | string[],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSavedMessage(null);
  }

  function toggleTag(tagId: string) {
    setForm((current) => {
      const alreadySelected =
        current.tagIds.includes(tagId);

      return {
        ...current,
        tagIds: alreadySelected
          ? current.tagIds.filter(
              (existingId) =>
                existingId !== tagId,
            )
          : [
              ...current.tagIds,
              tagId,
            ],
      };
    });

    setSavedMessage(null);
  }

  async function handleCoverUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);
      setError(null);

      const uploaded =
        await uploadMedia(file);

      updateField(
        "coverImage",
        uploaded.url,
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload cover image",
      );
    } finally {
      setUploadingCover(false);

      event.target.value = "";
    }
  }

  async function handleSave() {
    setError(null);
    setSavedMessage(null);

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!form.content.trim()) {
      setError("Content is required");
      return;
    }

    if (!form.authorId) {
      setError("Author is required");
      return;
    }

    try {
      setSaving(true);

      if (isNew) {
        const created =
          await createArticle({
            title:
              form.title.trim(),

            subtitle:
              form.subtitle.trim() ||
              undefined,

            excerpt:
              form.excerpt.trim() ||
              undefined,

            content:
              form.content,

            coverImage:
              form.coverImage ||
              undefined,

            authorId:
              form.authorId,

            categoryId:
              form.categoryId ||
              undefined,

            tagIds:
              form.tagIds,
          });

        router.replace(`/admin/articles/${created.id}`);

        return;
      }

      if (!id) {
        return;
      }

      const updated =
        await updateArticle(id, {
          title:
            form.title.trim(),

          subtitle:
            form.subtitle.trim() ||
            null,

          excerpt:
            form.excerpt.trim() ||
            null,

          content:
            form.content,

          coverImage:
              form.coverImage ||
              null,

          authorId:
            form.authorId,

          categoryId:
            form.categoryId ||
            null,

          tagIds:
            form.tagIds,
        });

      setArticle(updated);
      setSavedMessage("Saved");
    } catch {
      setError(
        "Failed to save article",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!id) {
      setError(
        "Save the article before publishing it",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSavedMessage(null);

      const updated =
        await publishArticle(id);

      setArticle(updated);
      setSavedMessage("Published");
    } catch {
      setError(
        "Failed to publish article",
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

      const updated =
        await unpublishArticle(id);

      setArticle(updated);

      setSavedMessage(
        "Moved to draft",
      );
    } catch {
      setError(
        "Failed to unpublish article",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="editor-shell">
        <p>Loading editor...</p>
      </main>
    );
  }

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <div>
          <div className="editor-status-row">
            <span
              className={`status-badge status-${
                article?.status?.toLowerCase() ??
                "draft"
              }`}
            >
              {isNew
                ? "NEW"
                : article?.status ??
                  "DRAFT"}
            </span>

            {savedMessage && (
              <span className="save-message">
                {savedMessage}
              </span>
            )}
          </div>

          <h1>
            {isNew
              ? "Create article"
              : "Edit article"}
          </h1>
        </div>

        <div className="editor-actions">
          <Link
            className="button button-secondary"
            href="/admin/content"
            target="_blank"
            rel="noreferrer"
          >
            Manage content data
          </Link>

          <button
            className="button button-secondary"
            type="button"
            onClick={() =>
              router.push("/admin/articles")
            }
          >
            Back
          </button>

          <button
            className="button button-primary"
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              uploadingCover
            }
          >
            {saving
              ? "Saving..."
              : "Save draft"}
          </button>

          {!isNew &&
            article?.status !==
              "PUBLISHED" && (
              <button
                className="button button-publish"
                type="button"
                onClick={
                  handlePublish
                }
                disabled={saving}
              >
                Publish
              </button>
            )}

          {!isNew &&
            article?.status ===
              "PUBLISHED" && (
              <button
                className="button button-danger"
                type="button"
                onClick={
                  handleUnpublish
                }
                disabled={saving}
              >
                Unpublish
              </button>
            )}
        </div>
      </header>

      {error && (
        <div
          className="editor-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="editor-meta-card">
        <div className="cover-section">
          <div className="cover-header">
            <div>
              <strong>
                Cover image
              </strong>

              <p>
                JPG, PNG or WebP.
                Maximum 10 MB.
              </p>
            </div>

            <label className="button button-secondary cover-upload-button">
              {uploadingCover
                ? "Uploading..."
                : form.coverImage
                  ? "Replace cover"
                  : "Upload cover"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={
                  uploadingCover
                }
                onChange={
                  handleCoverUpload
                }
              />
            </label>
          </div>

          {form.coverImage && (
            <div className="cover-preview">
              <img
                src={getMediaUrl(form.coverImage) ?? ""}
                alt="Article cover preview"
              />

              <button
                type="button"
                className="cover-remove"
                onClick={() =>
                  updateField(
                    "coverImage",
                    "",
                  )
                }
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-grid">
          <label className="form-field form-field-wide">
            <span>Title</span>

            <input
              type="text"
              value={form.title}
              placeholder="Article title"
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Subtitle</span>

            <input
              type="text"
              value={
                form.subtitle
              }
              placeholder="Optional subtitle"
              onChange={(event) =>
                updateField(
                  "subtitle",
                  event.target.value,
                )
              }
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Excerpt</span>

            <textarea
              rows={3}
              value={
                form.excerpt
              }
              placeholder="Short description shown in article lists"
              onChange={(event) =>
                updateField(
                  "excerpt",
                  event.target.value,
                )
              }
            />
          </label>

          <label className="form-field">
            <span>Author</span>

            <select
              value={
                form.authorId
              }
              onChange={(event) =>
                updateField(
                  "authorId",
                  event.target.value,
                )
              }
            >
              <option value="">
                Select author
              </option>

              {authors.map(
                (author) => (
                  <option
                    key={
                      author.id
                    }
                    value={
                      author.id
                    }
                  >
                    {
                      author.name
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="form-field">
            <span>Category</span>

            <select
              value={
                form.categoryId
              }
              onChange={(event) =>
                updateField(
                  "categoryId",
                  event.target.value,
                )
              }
            >
              <option value="">
                No category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="tags-block">
          <span className="tags-label">
            Tags
          </span>

          <div className="tag-list">
            {tags.length === 0 && (
              <span className="tag-empty">
                No tags available
              </span>
            )}

            {tags.map((tag) => {
              const selected =
                form.tagIds.includes(
                  tag.id,
                );

              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${
                    selected
                      ? "tag-chip-selected"
                      : ""
                  }`}
                  onClick={() =>
                    toggleTag(
                      tag.id,
                    )
                  }
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          {selectedTags.length >
            0 && (
            <p className="selected-tags">
              Selected:{" "}
              {selectedTags
                .map(
                  (tag) =>
                    tag.name,
                )
                .join(", ")}
            </p>
          )}
        </div>
      </section>

      <section className="editor-workspace">
        <div className="editor-column">
          <div className="column-header">
            <h2>Markdown</h2>

            <span>
              {
                form.content
                  .length
              }{" "}
              chars
            </span>
          </div>

          <InlineMediaEditor
            content={form.content}
            onChange={(content) => updateField("content", content)}
            textareaRef={markdownEditorRef}
          />

          <textarea
            ref={markdownEditorRef}
            className="markdown-editor"
            value={
              form.content
            }
            placeholder="# Start writing..."
            onChange={(event) =>
              updateField(
                "content",
                event.target.value,
              )
            }
          />
        </div>

        <div className="preview-column">
          <div className="column-header">
            <h2>Preview</h2>

            <span>Live</span>
          </div>

          <article className="markdown-preview">
            {form.content.trim() ? (
              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                ]}
                components={{
                  img: ArticleMarkdownImage,
                }}
              >
                {form.content}
              </ReactMarkdown>
            ) : (
              <p className="preview-empty">
                Nothing to
                preview yet.
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
