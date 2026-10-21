"use client";

import { useEffect, useRef, useState } from "react";
import { getPublicDisplaySettings, setPublicCategoriesEnabled } from "../../api/client";

export function PublicCategorySettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const locked = useRef(false);
  useEffect(() => {
    let active = true;
    getPublicDisplaySettings().then((value) => { if (active) setEnabled(value.categoriesEnabled); })
      .catch(() => { if (active) setError("Не вдалося завантажити налаштування. Оновіть сторінку."); });
    return () => { active = false; };
  }, []);
  async function change() {
    if (enabled === null || locked.current) return;
    locked.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await setPublicCategoriesEnabled(!enabled);
      setEnabled(result.categoriesEnabled);
      setMessage(result.categoriesEnabled ? "Рубрики показуються на сайті." : "Рубрики приховані на сайті.");
    } catch {
      setError("Зберегти не вдалося. Перевірте з’єднання та повторіть спробу.");
    } finally { locked.current = false; setBusy(false); }
  }
  return (
    <section className="content-admin-section" aria-labelledby="public-categories-title">
      <h2 id="public-categories-title">Рубрики на публічному сайті</h2>
      <p id="public-categories-help">Приховує фільтр і назви рубрик у картках та статтях. Рубрики й прив’язки до статей залишаються в CMS.</p>
      <button type="button" role="switch" aria-label="Показувати рубрики на публічному сайті" aria-checked={enabled ?? false}
        aria-describedby="public-categories-help" disabled={enabled === null || busy} onClick={change}>
        {busy ? "Збереження…" : enabled === null ? "Завантаження…" : enabled ? "Показувати рубрики: увімкнено" : "Показувати рубрики: вимкнено"}
      </button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
