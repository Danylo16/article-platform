"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { paginate } from "@/lib/admin-list";

export function confirmAdminDiscard() {
  return !document.querySelector('[data-admin-dirty="true"]') ||
    window.confirm("Є незбережені зміни. Продовжити без збереження?");
}

export function AdminDraftGuard() {
  useEffect(() => {
    function unload(event: BeforeUnloadEvent) {
      if (document.querySelector('[data-admin-dirty="true"]')) event.preventDefault();
    }
    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (!confirmAdminDiscard()) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", click, true); };
  }, []);
  return null;
}

export function AdminRecord({ title, meta, icon, dirty, children }: {
  title: string; meta?: string; icon?: ReactNode; dirty: boolean; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <article className="admin-record" data-admin-dirty={dirty ? "true" : undefined}
    data-editor-dirty={dirty ? "true" : undefined}>
    <button type="button" className="admin-record__summary" aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(!open)}>
      {icon && <span className="admin-record__icon">{icon}</span>}
      <span className="admin-record__label"><strong>{title}</strong>{meta && <small>{meta}</small>}</span>
      {dirty && <span className="unsaved-badge">Не збережено</span>}
      <span className="admin-record__action">{open ? "Згорнути" : "Редагувати"}</span>
    </button>
    <div id={id} className="admin-record__body" hidden={!open}>{children}</div>
  </article>;
}

export function AdminPagination({ total, page, pageSize = 10, onChange, label }: {
  total: number; page: number; pageSize?: number; onChange: (page: number) => void; label: string;
}) {
  const { currentPage, pageCount, start, end } = paginate(total, page, pageSize);
  return <nav className="admin-pagination" aria-label={label}>
    <span role="status">{total ? `${start + 1}–${end} із ${total}` : "0 записів"}</span>
    {pageCount > 1 && <div>
      <button className="admin-button" type="button" disabled={currentPage === 1} onClick={() => onChange(1)} aria-label="Перша сторінка">«</button>
      <button className="admin-button" type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>Назад</button>
      <span>Сторінка {currentPage} із {pageCount}</span>
      <button className="admin-button" type="button" disabled={currentPage === pageCount} onClick={() => onChange(currentPage + 1)}>Далі</button>
      <button className="admin-button" type="button" disabled={currentPage === pageCount} onClick={() => onChange(pageCount)} aria-label="Остання сторінка">»</button>
    </div>}
  </nav>;
}

export function AdminCollection<T extends { id: string; name: string; slug: string }>({
  items, label, renderItem, searchText, pageSize = 10, expandable = false, busy = false,
}: {
  items: T[]; label: string; renderItem: (item: T) => ReactNode;
  searchText?: (item: T) => string; pageSize?: number; expandable?: boolean; busy?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [all, setAll] = useState(false);
  const [generation, setGeneration] = useState(0);
  const collection = useRef<HTMLDivElement>(null);
  const filtered = items.filter(item => (searchText?.(item) ?? `${item.name} ${item.slug}`).toLocaleLowerCase("uk").includes(query.trim().toLocaleLowerCase("uk")));
  const { currentPage, start, end } = paginate(filtered.length, page, all ? Math.max(1, filtered.length) : pageSize);
  function change(action: () => void) {
    if (busy) return;
    // Searching this collection does not discard drafts in creation/order panels.
    if (collection.current?.querySelector('[data-admin-dirty="true"]') &&
      !window.confirm("Є незбережені зміни у списку. Продовжити без збереження?")) return;
    setGeneration(value => value + 1);
    action();
  }
  return <div className="admin-collection" ref={collection} aria-busy={busy}>
    <label className="admin-collection__search"><span>Пошук: {label.toLocaleLowerCase("uk")}</span>
      <input type="search" disabled={busy} value={query} placeholder="Назва або ідентифікатор"
        onChange={event => change(() => { setQuery(event.target.value); setPage(1); })} />
    </label>
    <div key={generation} className="admin-collection__items">
      {filtered.slice(start, end).map(item => <div key={item.id}>{renderItem(item)}</div>)}
    </div>
    {filtered.length === 0 && <p className="content-admin-empty">{items.length ? "Нічого не знайдено. Змініть запит." : "Записів ще немає."}</p>}
    <AdminPagination total={filtered.length} page={currentPage} pageSize={all ? Math.max(1, filtered.length) : pageSize}
      label={`Сторінки: ${label}`} onChange={next => change(() => setPage(next))} />
    {expandable && filtered.length > pageSize && <button className="admin-button" type="button"
      onClick={() => change(() => { setAll(!all); setPage(1); })}>
      {all ? "Згорнути список" : `Показати всі · ${filtered.length}`}
    </button>}
  </div>;
}
