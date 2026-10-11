"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import maplibregl, {
  type Map as MapLibreMap,
  type Marker as MapLibreMarker,
} from "maplibre-gl";

import { getMediaUrl } from "../../api/media";
import { getPlaceIconMarkup, PlaceIcon } from "../../lib/place-icons";
import type { Place } from "../../types/article";

const DEFAULT_MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const markerTones = ["#efb5c2", "#91c9de", "#6d9fbc", "#d9a85c"];

function getMarkerColor(order: number) {
  return markerTones[Math.abs(order - 1) % markerTones.length];
}

function applyDoridaPalette(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];

  layers.forEach((layer) => {
    const id = layer.id.toLowerCase();

    if (
      layer.type === "symbol" &&
      ["poi", "transit", "airport", "aerodrome"].some((token) =>
        id.includes(token),
      )
    ) {
      map.setLayoutProperty(layer.id, "visibility", "none");
      return;
    }

    if (layer.type === "background") {
      map.setPaintProperty(layer.id, "background-color", "#f8f4ee");
      return;
    }

    if (layer.type === "fill") {
      if (id.includes("water")) {
        map.setPaintProperty(layer.id, "fill-color", "#91c9de");
        map.setPaintProperty(layer.id, "fill-opacity", 0.72);
      } else if (
        ["park", "landcover", "landuse", "wood", "grass"].some((token) =>
          id.includes(token),
        )
      ) {
        map.setPaintProperty(layer.id, "fill-color", "#e4e9df");
        map.setPaintProperty(layer.id, "fill-opacity", 0.66);
      } else if (id.includes("building")) {
        map.setPaintProperty(layer.id, "fill-color", "#ded8cf");
        map.setPaintProperty(layer.id, "fill-opacity", 0.58);
      }
      return;
    }

    if (layer.type === "line") {
      if (id.includes("water")) {
        map.setPaintProperty(layer.id, "line-color", "#6d9fbc");
      } else if (
        ["road", "transportation", "street", "motorway"].some((token) =>
          id.includes(token),
        )
      ) {
        map.setPaintProperty(layer.id, "line-color", "#d8d2c8");
      }
      return;
    }

    if (layer.type === "symbol") {
      map.setPaintProperty(layer.id, "text-color", "#35516b");
      map.setPaintProperty(layer.id, "text-halo-color", "#f8f4ee");
      map.setPaintProperty(layer.id, "text-halo-width", 1);
    }
  });
}

export function LocationsMap({ places }: { places: Place[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef(new Map<string, MapLibreMarker>());
  const [mapReady, setMapReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    places[0]?.id ?? null,
  );

  const locationTypes = useMemo(() => {
    const uniqueTypes = new Map(
      places
        .filter((place) => place.type.isVisible)
        .map((place) => [place.type.id, place.type]),
    );

    return [...uniqueTypes.values()].sort(
      (left, right) => left.navigationOrder - right.navigationOrder,
    );
  }, [places]);

  const filteredPlaces = useMemo(
    () =>
      activeFilter === "ALL"
        ? places
        : places.filter((place) => place.type.id === activeFilter),
    [activeFilter, places],
  );

  const selectedPlace =
    filteredPlaces.find((place) => place.id === selectedPlaceId) ??
    filteredPlaces[0] ??
    null;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const markers = markerRefs.current;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? DEFAULT_MAP_STYLE,
      center: [16.3738, 48.2082],
      zoom: 11.4,
      minZoom: 9,
      maxZoom: 18,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      cooperativeGestures: true,
      attributionControl: {
        compact: true,
      },
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      "top-left",
    );

    map.once("load", () => {
      applyDoridaPalette(map);
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map) {
      return;
    }

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current.clear();

    const bounds = new maplibregl.LngLatBounds();

    filteredPlaces.forEach((place) => {
      const markerElement = document.createElement("button");
      const selected = place.id === selectedPlace?.id;

      markerElement.type = "button";
      markerElement.className = "locations-marker-shell";
      markerElement.title = place.name;
      markerElement.setAttribute("aria-label", place.name);
      markerElement.innerHTML = `<span class="locations-marker${selected ? " is-selected" : ""}" style="--marker-color:${getMarkerColor(place.type.navigationOrder)}">${getPlaceIconMarkup(place.type.icon)}</span>`;
      markerElement.addEventListener("click", () => {
        setSelectedPlaceId(place.id);
      });

      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      markerRefs.current.set(place.id, marker);
      bounds.extend([place.longitude, place.latitude]);
    });

    if (filteredPlaces.length === 1) {
      map.flyTo({
        center: [filteredPlaces[0].longitude, filteredPlaces[0].latitude],
        zoom: 14.5,
        duration: 700,
      });
    } else if (filteredPlaces.length > 1) {
      map.fitBounds(bounds, {
        padding: 58,
        maxZoom: 14.5,
        duration: 700,
      });
    }
  }, [filteredPlaces, mapReady, selectedPlace?.id]);

  function selectPlace(place: Place) {
    setSelectedPlaceId(place.id);
    mapRef.current?.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 14.5,
      duration: 650,
    });
  }

  const selectedArticle = selectedPlace?.articles?.[0];
  const selectedCover = getMediaUrl(selectedArticle?.coverImage);

  return (
    <section className="locations-explorer" aria-label="Orte in Wien">
      <div className="locations-filters" aria-label="Orte filtern">
        <button
          type="button"
          className={activeFilter === "ALL" ? "is-active" : ""}
          aria-pressed={activeFilter === "ALL"}
          onClick={() => {
            setActiveFilter("ALL");
            setSelectedPlaceId(null);
          }}
        >
          Alle
        </button>

        {locationTypes.map((locationType) => (
          <button
            key={locationType.id}
            type="button"
            className={activeFilter === locationType.id ? "is-active" : ""}
            aria-pressed={activeFilter === locationType.id}
            onClick={() => {
              setActiveFilter(locationType.id);
              setSelectedPlaceId(null);
            }}
          >
            <PlaceIcon name={locationType.icon} />
            {locationType.name}
          </button>
        ))}
      </div>

      <div className="locations-explorer__layout">
        <div
          ref={mapContainerRef}
          className="locations-map"
          aria-label="Interaktive Karte mit Orten in Wien"
        />

        <aside className="locations-panel" aria-live="polite">
          {selectedPlace && selectedArticle ? (
            <article className="location-feature-card">
              <div className="location-feature-card__media">
                {selectedCover ? (
                  <img src={selectedCover} alt="" />
                ) : (
                  <div aria-hidden="true">
                    <PlaceIcon name={selectedPlace.type.icon} />
                    <span>DORIDA</span>
                  </div>
                )}
                <span className="location-feature-card__type">
                  <PlaceIcon name={selectedPlace.type.icon} />
                  {selectedPlace.type.name}
                </span>
              </div>

              <div className="location-feature-card__content">
                <p className="location-feature-card__address">
                  {selectedPlace.address}
                </p>
                <h2>{selectedPlace.name}</h2>
                <div
                  className="location-feature-card__rule"
                  aria-hidden="true"
                />
                <h3>{selectedArticle.title}</h3>
                {(selectedArticle.excerpt ?? selectedArticle.subtitle) && (
                  <p className="location-feature-card__summary">
                    {selectedArticle.excerpt ?? selectedArticle.subtitle}
                  </p>
                )}
                <Link href={`/articles/${selectedArticle.slug}`}>
                  Artikel lesen <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ) : (
            <div className="locations-panel__empty">
              <p className="eyebrow">Keine Treffer</p>
              <h2>Für diesen Filter gibt es noch keine Orte.</h2>
            </div>
          )}
        </aside>
      </div>

      {filteredPlaces.length > 0 && (
        <div className="locations-list" aria-label="Liste der Orte">
          {filteredPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              className={place.id === selectedPlace?.id ? "is-active" : ""}
              onClick={() => selectPlace(place)}
            >
              <span className="locations-list__icon">
                <PlaceIcon name={place.type.icon} />
              </span>
              <span className="locations-list__content">
                <small>{place.type.name}</small>
                <strong>{place.name}</strong>
                <em>{place.address}</em>
              </span>
              <span className="locations-list__arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
