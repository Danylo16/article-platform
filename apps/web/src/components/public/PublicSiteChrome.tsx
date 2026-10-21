import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";

import { getVisibleSections } from "../../api/server";
import { PublicMobileNavigation } from "./PublicMobileNavigation";
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
      <a className="public-skip-link" href="#public-content">Zum Inhalt</a>
      <div className="site-header__inner">
        <Link className="site-header__brand" href="/" aria-label="DORIDA Startseite">
          <strong>{PUBLICATION.name}</strong>
          <span>{PUBLICATION.strapline}</span>
        </Link>

        <HeaderSearch />
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
        <PublicMobileNavigation sections={sections} activeSectionSlug={activeSectionSlug} />
      </div>
    </header>
  );
}

export async function PublicSiteFooter() {
  let sections: ReadonlyArray<{ name: string; slug: string }> = EDITORIAL_SECTIONS;
  try { sections = await getVisibleSections(); } catch { /* Navigation fallback remains usable. */ }
  const developerLinkedIn = process.env.DEVELOPER_LINKEDIN_URL?.trim() || "https://www.linkedin.com/in/danylo-zubrii-bb0758299/";
  const safeLinkedIn = developerLinkedIn && /^https:\/\/(www\.)?linkedin\.com\/in\/[^\s]+$/.test(developerLinkedIn) ? developerLinkedIn : null;
  return (
    <footer className="site-footer">
      <div className="site-footer__identity"><Link href="/" aria-label="DORIDA Startseite"><strong>{PUBLICATION.name}</strong></Link><span>{PUBLICATION.strapline}</span><p>{PUBLICATION.description}</p></div>
      <nav className="site-footer__navigation" aria-label="Navigation im Footer"><h2>Entdecken</h2><Link href="/">Alle Geschichten</Link>{sections.map(section => <Link key={section.slug} href={`/${section.slug}`}>{section.name}</Link>)}<Link href="/search">Suche</Link></nav>
      <div className="site-footer__contact"><h2>In Verbindung bleiben</h2><p>Einblicke und neue Geschichten von Dariia Skrypnyk.</p><a href="https://www.instagram.com/dariia_skrypnyk/" target="_blank" rel="noopener noreferrer">Instagram · @dariia_skrypnyk ↗</a></div>
      <div className="site-footer__bottom"><small>© {new Date().getFullYear()} DORIDA</small><small>Konzeption &amp; Entwicklung: {safeLinkedIn ? <a href={safeLinkedIn} target="_blank" rel="noopener noreferrer">Danylo Zubrii ↗</a> : "Danylo Zubrii"}</small><a href="#public-content">Nach oben ↑</a></div>
    </footer>
  );
}
