import Link from "next/link";

import { LocationsMap } from "../components/public/LocationsMap";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "../components/public/PublicSiteChrome";
import type { Place } from "../types/article";

export function LocationsPage({
  places,
  loadError = false,
}: {
  places: Place[];
  loadError?: boolean;
}) {
  return (
    <div className="home-page locations-page">
      <PublicSiteHeader activeSectionSlug="locations" />

      <main className="home-page__main">
        <header className="section-page__heading locations-page__heading">
          <p className="eyebrow">DORIDA · Wien entdecken</p>
          <h1>LOCATIONS</h1>
          <p>
            Cafés, Restaurants und Orte für besondere Abende — ausgewählt,
            besucht und journalistisch erzählt.
          </p>
        </header>

        <div className="dorida-rule" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {loadError && (
          <section className="homepage-message homepage-message--compact">
            <p className="eyebrow">Verbindung unterbrochen</p>
            <h2>Die Karte konnte nicht geladen werden.</h2>
            <Link className="homepage-message__link" href="/locations">
              Erneut versuchen
            </Link>
          </section>
        )}

        {!loadError && places.length === 0 && (
          <section className="homepage-message homepage-message--compact">
            <p className="eyebrow">LOCATIONS</p>
            <h2>Die ersten Orte sind unterwegs.</h2>
            <p>Veröffentlichte Empfehlungen erscheinen hier.</p>
          </section>
        )}

        {!loadError && places.length > 0 && <LocationsMap places={places} />}
      </main>

      <PublicSiteFooter />
    </div>
  );
}
