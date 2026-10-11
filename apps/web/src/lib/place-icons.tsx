import type { ReactNode } from "react";

import type { PlaceIconName } from "../types/article";

export const PLACE_ICON_OPTIONS: ReadonlyArray<{
  value: PlaceIconName;
  label: string;
}> = [
  { value: "coffee", label: "Кава" },
  { value: "restaurant", label: "Ресторан" },
  { value: "music", label: "Музика" },
  { value: "museum", label: "Музей" },
  { value: "shopping", label: "Магазин" },
  { value: "park", label: "Парк" },
  { value: "hotel", label: "Готель" },
  { value: "landmark", label: "Пам’ятка" },
];

const iconPaths: Record<PlaceIconName, ReactNode> = {
  coffee: (
    <>
      <path d="M5 8h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
      <path d="M15 10h1.5a2.5 2.5 0 0 1 0 5H15M7 4v2m3-2v2m3-2v2M4 20h13" />
    </>
  ),
  restaurant: (
    <>
      <path d="M7 3v7m-3-7v5a3 3 0 0 0 6 0V3M7 10v11M15 3v18m0-18c3 2 4 5 4 8h-4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </>
  ),
  museum: (
    <>
      <path d="m3 9 9-5 9 5M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M4 18h16M3 21h18" />
    </>
  ),
  shopping: (
    <>
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
  park: (
    <>
      <path d="M12 3 7 10h3l-4 6h12l-4-6h3l-5-7Z" />
      <path d="M12 16v5" />
    </>
  ),
  hotel: (
    <>
      <path d="M4 21V4h12v17M8 8h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1M16 10h4v11M2 21h20" />
    </>
  ),
  landmark: (
    <>
      <path d="m3 9 9-6 9 6M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M3 21h18" />
    </>
  ),
};

export function PlaceIcon({
  name,
  className,
}: {
  name: PlaceIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}

const iconPathMarkup: Record<PlaceIconName, string> = {
  coffee:
    '<path d="M5 8h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M15 10h1.5a2.5 2.5 0 0 1 0 5H15M7 4v2m3-2v2m3-2v2M4 20h13"/>',
  restaurant:
    '<path d="M7 3v7m-3-7v5a3 3 0 0 0 6 0V3M7 10v11M15 3v18m0-18c3 2 4 5 4 8h-4"/>',
  music:
    '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  museum:
    '<path d="m3 9 9-5 9 5M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M4 18h16M3 21h18"/>',
  shopping:
    '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
  park:
    '<path d="M12 3 7 10h3l-4 6h12l-4-6h3l-5-7Z"/><path d="M12 16v5"/>',
  hotel:
    '<path d="M4 21V4h12v17M8 8h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1M16 10h4v11M2 21h20"/>',
  landmark:
    '<path d="m3 9 9-6 9 6M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M3 21h18"/>',
};

export function getPlaceIconMarkup(name: PlaceIconName) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPathMarkup[name]}</svg>`;
}
