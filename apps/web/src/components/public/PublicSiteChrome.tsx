import Link from "next/link";

import { getVisibleSections } from "../../api/server";
import { EDITORIAL_SECTIONS } from "../../lib/editorial-sections";

const PUBLICATION = {
  name: "DORIDA",
  strapline: "Journal aus Wien",
  description:
    "Geschichten über Menschen, Kultur und Politik – nah an Wien und mit Blick in die Tiefe.",
} as const;

export async function PublicSiteHeader({
  activeSectionSlug,
}: {
  activeSectionSlug?: string;
}) {
  let sections: ReadonlyArray<{ name: string; slug: string }> =
    EDITORIAL_SECTIONS;

  try {
    sections = await getVisibleSections();
  } catch {
    // Keep the primary navigation available while the API is unavailable.
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" href="/" aria-label="DORIDA Startseite">
          <strong>{PUBLICATION.name}</strong>
          <span>{PUBLICATION.strapline}</span>
        </Link>

        <nav className="site-header__nav" aria-label="Hauptnavigation">
          {sections.map((section) => (
            <Link
              key={section.slug}
              href={`/${section.slug}`}
              aria-current={
                activeSectionSlug === section.slug ? "page" : undefined
              }
            >
              {section.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PublicSiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>{PUBLICATION.name}</strong>
        <span>{PUBLICATION.strapline}</span>
      </div>

      <p>{PUBLICATION.description}</p>
      <small>© {new Date().getFullYear()} DORIDA</small>
    </footer>
  );
}
