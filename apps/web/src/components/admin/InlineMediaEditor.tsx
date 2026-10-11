"use client";

import {
  useMemo,
  useState,
  type RefObject,
} from "react";

import { uploadMedia } from "../../api/client";
import { getMediaUrl } from "../../api/media";
import {
  createMediaMarkdown,
  getArticleMedia,
  type ArticleMedia,
} from "../../lib/articleMedia";

type MediaForm = {
  url: string;
  alt: string;
  caption: string;
  credit: string;
};

type InlineMediaEditorProps = {
  content: string;
  onChange: (content: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const emptyForm: MediaForm = {
  url: "",
  alt: "",
  caption: "",
  credit: "",
};

export function InlineMediaEditor({
  content,
  onChange,
  textareaRef,
}: InlineMediaEditorProps) {
  const media = useMemo(() => getArticleMedia(content), [content]);
  const [form, setForm] = useState<MediaForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingRaw, setEditingRaw] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState(0);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openNewMedia() {
    setForm(emptyForm);
    setFile(null);
    setEditingRaw(null);
    setInsertAt(textareaRef.current?.selectionStart ?? content.length);
    setError(null);
    setOpen(true);
  }

  function openExistingMedia(item: ArticleMedia) {
    setForm({
      url: item.url,
      alt: item.alt,
      caption: item.caption,
      credit: item.credit,
    });
    setFile(null);
    setEditingRaw(item.raw);
    setError(null);
    setOpen(true);
  }

  function closeEditor() {
    if (saving) {
      return;
    }

    setOpen(false);
    setFile(null);
    setEditingRaw(null);
    setError(null);
  }

  function updateField(field: keyof MediaForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function insertBlock(markdown: string) {
    const before = content.slice(0, insertAt).trimEnd();
    const after = content.slice(insertAt).trimStart();
    const nextContent = [before, markdown, after]
      .filter(Boolean)
      .join("\n\n");

    onChange(nextContent);

    requestAnimationFrame(() => {
      const nextPosition = before
        ? before.length + markdown.length + 2
        : markdown.length;

      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextPosition, nextPosition);
    });
  }

  async function saveMedia() {
    if (!form.alt.trim()) {
      setError("Альтернативний текст обов’язковий.");
      return;
    }

    if (!file && !form.url) {
      setError("Виберіть зображення.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = file ? (await uploadMedia(file)).url : form.url;
      const markdown = createMediaMarkdown({
        url,
        alt: form.alt,
        caption: form.caption,
        credit: form.credit,
      });

      if (editingRaw) {
        const currentStart = content.indexOf(editingRaw);

        if (currentStart === -1) {
          setError("Блок зображення змінився. Закрийте редактор і спробуйте ще раз.");
          return;
        }

        onChange(
          content.slice(0, currentStart) +
            markdown +
            content.slice(currentStart + editingRaw.length),
        );
      } else {
        insertBlock(markdown);
      }

      setOpen(false);
      setFile(null);
      setEditingRaw(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Не вдалося завантажити зображення.",
      );
    } finally {
      setSaving(false);
    }
  }

  function removeMedia(item: ArticleMedia) {
    if (!window.confirm(`Прибрати зображення «${item.alt || item.url}» зі статті?`)) {
      return;
    }

    const before = content.slice(0, item.start).trimEnd();
    const after = content.slice(item.end).trimStart();

    onChange([before, after].filter(Boolean).join("\n\n"));

    if (editingRaw === item.raw) {
      closeEditor();
    }
  }

  return (
    <div className="inline-media-editor">
      <div className="inline-media-editor__toolbar">
        <div>
          <strong>Зображення у статті</strong>
          <span>У тексті: {media.length}</span>
        </div>

        <button
          className="button button-secondary"
          type="button"
          onClick={openNewMedia}
        >
          Додати в позицію курсора
        </button>
      </div>

      {media.length > 0 && (
        <div className="inline-media-editor__list">
          {media.map((item, index) => (
            <div
              className="inline-media-editor__item"
              key={`${item.start}-${item.url}`}
            >
              <img src={getMediaUrl(item.url) ?? ""} alt="" />

              <div>
                <strong>{item.alt || `Зображення ${index + 1}`}</strong>
                <span>
                  {[item.caption, item.credit].filter(Boolean).join(" · ") ||
                    "Без підпису й авторства"}
                </span>
              </div>

              <button type="button" onClick={() => openExistingMedia(item)}>
                Редагувати
              </button>
              <button
                className="inline-media-editor__remove"
                type="button"
                onClick={() => removeMedia(item)}
              >
                Прибрати
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="inline-media-editor__form">
          <div className="inline-media-editor__form-heading">
            <strong>{editingRaw ? "Редагувати зображення" : "Вставити зображення"}</strong>
            <button type="button" onClick={closeEditor} aria-label="Закрити редактор зображення">
              ×
            </button>
          </div>

          {form.url && !file && (
            <img
              className="inline-media-editor__preview"
              src={getMediaUrl(form.url) ?? ""}
              alt=""
            />
          )}

          <label>
            <span>{editingRaw ? "Замінити файл (необов’язково)" : "Зображення"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {file && <p className="inline-media-editor__file">{file.name}</p>}

          <label>
            <span>Альтернативний текст *</span>
            <input
              type="text"
              value={form.alt}
              maxLength={240}
              placeholder="Опишіть, що зображено на фото"
              onChange={(event) => updateField("alt", event.target.value)}
            />
          </label>

          <label>
            <span>Підпис</span>
            <input
              type="text"
              value={form.caption}
              maxLength={500}
              placeholder="Контекст, який буде показано під зображенням"
              onChange={(event) => updateField("caption", event.target.value)}
            />
          </label>

          <label>
            <span>Авторство</span>
            <input
              type="text"
              value={form.credit}
              maxLength={240}
              placeholder="Фотограф або джерело"
              onChange={(event) => updateField("credit", event.target.value)}
            />
          </label>

          {error && <p className="inline-media-editor__error">{error}</p>}

          <div className="inline-media-editor__actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={closeEditor}
              disabled={saving}
            >
              Скасувати
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={saveMedia}
              disabled={saving}
            >
              {saving
                ? "Завантажуємо…"
                : editingRaw
                  ? "Оновити зображення"
                  : "Завантажити й вставити"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
