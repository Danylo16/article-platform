"use client";

import Link from "next/link";
import { useRef } from "react";

type Props = {
  sections: ReadonlyArray<{ name: string; slug: string }>;
  activeSectionSlug?: string;
};

export function PublicMobileNavigation({ sections, activeSectionSlug }: Props) {
  const menu = useRef<HTMLDetailsElement>(null);
  function close(restoreFocus = false) {
    if (!menu.current) return;
    menu.current.open = false;
    if (restoreFocus) menu.current.querySelector("summary")?.focus();
  }
  return (
    <details className="site-mobile-menu" ref={menu} onKeyDown={(event) => {
      if (event.key === "Escape" && menu.current?.open) {
        event.preventDefault();
        close(true);
      }
    }}>
      <summary>Menü <span aria-hidden="true" className="site-mobile-menu__symbol" /></summary>
      <nav aria-label="Mobile Hauptnavigation">
        <Link href="/" onClick={() => close()} aria-current={!activeSectionSlug ? "page" : undefined}>Startseite</Link>
        {sections.map((section) => (
          <Link key={section.slug} href={`/${section.slug}`} onClick={() => close()}
            aria-current={activeSectionSlug === section.slug ? "page" : undefined}>
            {section.name}
          </Link>
        ))}
        <Link href="/search" onClick={() => close()}>Suche</Link>
      </nav>
    </details>
  );
}
