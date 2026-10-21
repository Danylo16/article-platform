"use client";

import { useRef, useState } from "react";
import { reorderAdminItems } from "@/api/client";
import { moveItem } from "@/lib/admin-list";

type Item = { id: string; name: string; isVisible: boolean };
export function AdminOrderEditor({ items, resource, onSaved, label, externalBusy = false }: {
  items: Item[]; resource: "sections" | "location-types"; onSaved: () => Promise<void>; label: string; externalBusy?: boolean;
}) {
  const [draft, setDraft] = useState<Item[] | null>(null);
  const [expected, setExpected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dragId = useRef<string | null>(null);
  const pending = useRef(false);
  const root = useRef<HTMLElement>(null);
  const dirty = draft !== null && draft.some((item, index) => item.id !== expected[index]);
  function otherDrafts() {
    return Array.from(document.querySelectorAll('[data-admin-dirty="true"]')).some(el => el !== root.current);
  }
  function move(from: number, to: number) {
    if (!draft || busy || externalBusy || to < 0 || to >= draft.length) return;
    const next = moveItem(draft, from, to);
    setDraft(next);
    setMessage(`${next[to].name}: позиція ${to + 1} із ${next.length}`);
  }
  async function save() {
    if (!draft || pending.current || externalBusy || !dirty) return;
    if (otherDrafts()) { setError("Спочатку збережіть правки відкритих записів."); return; }
    pending.current = true; setBusy(true); setError("");
    try {
      await reorderAdminItems(resource, draft.map(item => item.id), expected);
      setDraft(null);
      setMessage("Порядок збережено.");
      try { await onSaved(); } catch { setError("Порядок збережено, але список не оновився. Оновіть дані."); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не вдалося зберегти порядок."); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className="admin-order" ref={root} aria-label={label}
    data-admin-dirty={dirty ? "true" : undefined} data-editor-dirty={dirty ? "true" : undefined}>
    {!draft && <button className="admin-button" type="button" disabled={items.length < 2 || busy || externalBusy}
      onClick={() => {
        if (otherDrafts()) { setError("Спочатку збережіть правки відкритих записів."); return; }
        setExpected(items.map(item => item.id)); setDraft([...items]); setError(""); setMessage("");
      }}>Змінити порядок</button>}
    {draft && <>
      <h2>{label}</h2>
      <p>Перетягніть запис за ручку або використайте «Вище» / «Нижче». Показано всі записи, включно з прихованими.</p>
      <ol className="admin-order__list">
        {draft.map((item, index) => <li key={item.id} onDragOver={event => { if (!busy) event.preventDefault(); }}
          onDrop={event => { event.preventDefault(); if (!busy && dragId.current) move(draft.findIndex(value => value.id === dragId.current), index); dragId.current = null; }}>
          <span className="admin-order__handle" draggable={!busy} aria-hidden="true"
            onDragStart={event => { dragId.current = item.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.id); }}
            onDragEnd={() => { dragId.current = null; }}>⠿</span>
          <span className="admin-order__name">{index + 1}. {item.name}{!item.isVisible && <small>Прихований</small>}</span>
          <div>
            <button className="admin-button" type="button" disabled={busy || externalBusy || index === 0} aria-label={`Вище: ${item.name}`} onClick={() => move(index, index - 1)}>Вище</button>
            <button className="admin-button" type="button" disabled={busy || externalBusy || index === draft.length - 1} aria-label={`Нижче: ${item.name}`} onClick={() => move(index, index + 1)}>Нижче</button>
          </div>
        </li>)}
      </ol>
      <div className="admin-order__actions">
        <button className="admin-button admin-button--primary" disabled={busy || externalBusy || !dirty} type="button" onClick={() => void save()}>{busy ? "Зберігаємо…" : "Зберегти порядок"}</button>
        <button className="admin-button" disabled={busy || externalBusy} type="button" onClick={() => { if (!dirty || window.confirm("Скасувати зміни порядку?")) { setDraft(null); setMessage(""); } }}>Скасувати</button>
      </div>
    </>}
    {message && <p className="save-message" role="status">{message}</p>}
    {error && <div className="content-admin-error" role="alert"><p>{error}</p>
      <button className="admin-button" disabled={busy || externalBusy} type="button" onClick={() => {
        if (dirty && !window.confirm("Скасувати зміни порядку й оновити дані?")) return;
        if (otherDrafts()) { setError("Спочатку збережіть правки відкритих записів."); return; }
        setDraft(null); setBusy(true);
        void onSaved().then(() => setError("")).catch(() => setError("Не вдалося оновити дані.")).finally(() => setBusy(false));
      }}>Оновити дані</button>
    </div>}
  </section>;
}
