"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { categoryHref } from "../../lib/public-categories";
export function CategoryPicker({ options, active, basePath }: { options: { name: string; slug: string; count: number }[]; active?: string; basePath: string }) {
  const [query, setQuery] = useState("");
  const details = useRef<HTMLDetailsElement>(null);
  const selected = options.find(option => option.slug === active);
  const filtered = options.filter(option => option.name.toLocaleLowerCase("de").includes(query.trim().toLocaleLowerCase("de")));
  return <details className="category-filter__picker" ref={details} onKeyDown={event => { if (event.key === "Escape") { if (details.current) details.current.open = false; details.current?.querySelector("summary")?.focus(); } }}>
    <summary>{selected?.name ?? "Alle Rubriken"}<span aria-hidden="true">⌄</span></summary>
    <div className="category-picker-panel">
      <label>Rubrik finden<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name der Rubrik" /></label>
      <nav aria-label="Rubriken">
        <Link href={basePath} aria-current={!active ? "page" : undefined}>Alle Rubriken</Link>
        {filtered.map(option => <Link key={option.slug} href={categoryHref(option.slug, basePath)} aria-current={active === option.slug ? "page" : undefined} onClick={() => { if (details.current) details.current.open = false; }}>{option.name}<span>{option.count}</span></Link>)}
        {!filtered.length && <p>Keine passende Rubrik.</p>}
      </nav>
    </div>
  </details>;
}
