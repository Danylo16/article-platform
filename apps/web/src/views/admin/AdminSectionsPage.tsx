"use client";

import { useEffect, useState } from "react";

import { getSections, updateSection } from "../../api/client";
import type { Section } from "../../types/article";

type SectionForm = {
  name: string;
  navigationOrder: string;
  isVisible: boolean;
};

function sectionToForm(section: Section): SectionForm {
  return {
    name: section.name,
    navigationOrder: String(section.navigationOrder),
    isVisible: section.isVisible,
  };
}

function EditableSection({
  section,
  busy,
  onSave,
}: {
  section: Section;
  busy: boolean;
  onSave: (id: string, form: SectionForm) => Promise<void>;
}) {
  const [form, setForm] = useState(() => sectionToForm(section));
  const unchanged =
    JSON.stringify(form) === JSON.stringify(sectionToForm(section));
  const order = Number(form.navigationOrder);
  const invalid =
    form.name.trim().length < 2 ||
    !Number.isInteger(order) ||
    order < 0 ||
    order > 999;

  return (
    <article className="sections-admin-card">
      <div className="sections-admin-card__position" aria-hidden="true">
        {section.navigationOrder.toString().padStart(2, "0")}
      </div>

      <div className="sections-admin-card__fields">
        <label>
          <span>Назва в меню</span>
          <input
            value={form.name}
            maxLength={40}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>

        <label>
          <span>Порядок</span>
          <input
            type="number"
            min="0"
            max="999"
            value={form.navigationOrder}
            onChange={(event) =>
              setForm({ ...form, navigationOrder: event.target.value })
            }
          />
        </label>

        <div className="sections-admin-card__route">
          <span>Адреса розділу</span>
          <code>/{section.slug}</code>
        </div>

        <label className="sections-admin-card__visible">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) =>
              setForm({ ...form, isVisible: event.target.checked })
            }
          />
          <span>Показувати в меню</span>
        </label>
      </div>

      <div className="sections-admin-card__footer">
        <span>{section._count?.articles ?? 0} статей</span>
        <button
          className="content-admin-button content-admin-button--primary"
          type="button"
          disabled={busy || unchanged || invalid}
          onClick={() => void onSave(section.id, form).catch(() => undefined)}
        >
          Зберегти
        </button>
      </div>
    </article>
  );
}

export function AdminSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshSections() {
    setSections(await getSections());
  }

  useEffect(() => {
    let cancelled = false;

    getSections()
      .then((data) => {
        if (!cancelled) {
          setSections(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Не вдалося завантажити розділи.");
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

  async function saveSection(id: string, form: SectionForm) {
    try {
      setBusy(true);
      setError(null);
      setMessage(null);
      await updateSection(id, {
        name: form.name.trim(),
        navigationOrder: Number(form.navigationOrder),
        isVisible: form.isVisible,
      });
      await refreshSections();
      setMessage("Зміни збережено. Публічне меню вже оновлено.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Не вдалося зберегти розділ.",
      );
      throw mutationError;
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="sections-admin-shell">Завантажуємо розділи…</main>;
  }

  return (
    <main className="sections-admin-shell">
      <header className="content-admin-header">
        <div>
          <span>НАВІГАЦІЯ</span>
          <h1>Розділи</h1>
          <p>Назви й порядок головного меню публічного сайту.</p>
        </div>
      </header>

      {error && (
        <div className="content-admin-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="sections-admin-message" role="status">
          {message}
        </div>
      )}

      <div className="sections-admin-note">
        <strong>Slug залишається незмінним.</strong>
        <span>
          Це зберігає чинні адреси сторінок і зовнішні посилання. Прихований
          розділ зникає з меню, але його статті не видаляються.
        </span>
      </div>

      <section className="sections-admin-grid" aria-label="Розділи сайту">
        {sections.map((section) => (
          <EditableSection
            key={section.id}
            section={section}
            busy={busy}
            onSave={saveSection}
          />
        ))}
      </section>
    </main>
  );
}
