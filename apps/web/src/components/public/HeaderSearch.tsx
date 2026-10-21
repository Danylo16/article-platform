"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { title: string; href: string; detail: string };
export function HeaderSearch() {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState<{ query: string; items: Item[]; correction: string | null; error: boolean } | null>(null);
  const composing = useRef(false);
  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ query: trimmed, items: data.items, correction: data.correction, error: false });
      }).catch(() => { if (!controller.signal.aborted) setResult({ query: trimmed, items: [], correction: null, error: true }); });
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed]);
  const current = result?.query === trimmed ? result : null;
  const options: Item[] = [...(current?.correction ? [{ title: `Meinten Sie „${current.correction}“?`, href: `/search?q=${encodeURIComponent(current.correction)}`, detail: "Vorschlag zur Schreibweise" }] : []), ...(current?.items ?? [])];
  const expanded = open && trimmed.length >= 2;
  const selected = active >= 0 && active < options.length ? active : -1;
  return <form className="header-search" role="search" aria-label="Website durchsuchen" action="/search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); } }} onSubmit={event => {
    if (composing.current) { event.preventDefault(); return; }
    if (expanded && selected >= 0) { event.preventDefault(); setOpen(false); router.push(options[selected].href); }
  }}>
    <label className="header-search__label" htmlFor={id}>DORIDA durchsuchen</label>
    <div className="header-search__field">
      <input id={id} name="q" type="search" role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-results`} aria-activedescendant={expanded && selected >= 0 ? `${id}-option-${selected}` : undefined} autoComplete="off" maxLength={120} value={query} placeholder="Suchen …" onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setActive(-1); setOpen(true); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive(index => options.length ? (index < 0 ? (event.key === "ArrowDown" ? 0 : options.length - 1) : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length) : -1); }
      }}/>
      <button type="submit" aria-label="Suchen" title="Suchen" onClick={() => setActive(-1)}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>
    </div>
    <div className="header-search__panel" hidden={!expanded}>
      <p className="header-search__hint" role="status">{!current ? "Suche läuft …" : current.error ? "Suche vorübergehend nicht verfügbar." : options.length ? "Passende Geschichten" : "Keine Treffer. Versuchen Sie einen anderen Begriff."}</p>
      <ul id={`${id}-results`} role="listbox" aria-label="Suchvorschläge">{options.map((item, index) => <li key={item.href} id={`${id}-option-${index}`} role="option" aria-selected={selected === index} onPointerDown={event => event.preventDefault()} onClick={() => { setOpen(false); router.push(item.href); }}><strong>{item.title}</strong><span>{item.detail}</span></li>)}</ul>
      <a className="header-search__all" href={`/search?q=${encodeURIComponent(trimmed)}`}>Alle Ergebnisse ansehen →</a>
    </div>
  </form>;
}
