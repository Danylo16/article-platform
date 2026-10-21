import type { PlaceIconName } from "../types/article";

export const PLACE_ICON_OPTIONS: ReadonlyArray<{
  value: PlaceIconName;
  label: string;
  keywords: string;
}> = [
  { value: "coffee", label: "Кав’ярня", keywords: "кава кафе coffee cafe" },
  { value: "restaurant", label: "Ресторан", keywords: "їжа ресторан food" },
  { value: "bar", label: "Бар", keywords: "бар келих коктейль wine" },
  { value: "bakery", label: "Пекарня", keywords: "хліб випічка bakery" },
  { value: "music", label: "Музика", keywords: "музика концерт music" },
  { value: "theatre", label: "Театр", keywords: "театр сцена вистава" },
  { value: "cinema", label: "Кіно", keywords: "кіно фільм cinema" },
  { value: "museum", label: "Музей", keywords: "музей історія museum" },
  { value: "gallery", label: "Галерея", keywords: "галерея мистецтво art" },
  { value: "shopping", label: "Магазин", keywords: "магазин покупки shop" },
  { value: "market", label: "Ринок", keywords: "ринок базар market" },
  { value: "park", label: "Парк", keywords: "парк дерево park" },
  { value: "nature", label: "Природа", keywords: "природа маршрут гора nature" },
  { value: "hotel", label: "Готель", keywords: "готель житло hotel" },
  { value: "landmark", label: "Пам’ятка", keywords: "пам'ятка архітектура landmark" },
  { value: "church", label: "Сакральне місце", keywords: "церква храм church" },
  { value: "library", label: "Бібліотека", keywords: "книги бібліотека book" },
  { value: "sports", label: "Спорт", keywords: "спорт стадіон fitness" },
  { value: "wellness", label: "Велнес", keywords: "спа велнес здоров'я spa" },
  { value: "nightlife", label: "Нічне життя", keywords: "ніч клуб party" },
  { value: "family", label: "Для родини", keywords: "родина діти family" },
  { value: "viewpoint", label: "Оглядовий майданчик", keywords: "вид панорама viewpoint" },
  { value: "coworking", label: "Коворкінг", keywords: "робота офіс coworking" },
  { value: "other", label: "Інше", keywords: "інше місце other" },
];

const iconPathMarkup: Record<PlaceIconName, string> = {
  coffee: '<path d="M5 8h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M15 10h1.5a2.5 2.5 0 0 1 0 5H15M7 4v2m3-2v2m3-2v2M4 20h13"/>',
  restaurant: '<path d="M7 3v7m-3-7v5a3 3 0 0 0 6 0V3M7 10v11M15 3v18m0-18c3 2 4 5 4 8h-4"/>',
  bar: '<path d="M5 4h14l-7 8-7-8Z"/><path d="M12 12v7m-4 2h8"/>',
  bakery: '<path d="M5 11c-2-4 2-7 5-4 1-5 7-4 7 1 4 0 5 5 2 7H6c-3 0-4-3-1-4Z"/><path d="M7 15v5h10v-5M9 10l1 2m3-3 1 3"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  theatre: '<path d="M4 5c5 2 11 2 16 0v7c0 5-4 9-8 9s-8-4-8-9V5Z"/><path d="M7 10h2m6 0h2m-9 5c2 2 6 2 8 0"/>',
  cinema: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m8 3 3 3m2-3 3 3M3 11h18m-13 4 4 2-4 2v-4Z"/>',
  museum: '<path d="m3 9 9-5 9 5M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M4 18h16M3 21h18"/>',
  gallery: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="9" r="2"/><path d="m4 17 5-5 4 4 2-2 5 5"/>',
  shopping: '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
  market: '<path d="M4 10h16l-2-6H6l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M4 10c1 3 4 3 5 0 1 3 5 3 6 0 1 3 4 3 5 0"/>',
  park: '<path d="M12 3 7 10h3l-4 6h12l-4-6h3l-5-7Z"/><path d="M12 16v5"/>',
  nature: '<path d="M3 20 9 8l3 5 3-8 6 15H3Z"/><path d="m7 14 2 2 2-2m3-4 2 2 1-2"/>',
  hotel: '<path d="M4 21V4h12v17M8 8h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1M16 10h4v11M2 21h20"/>',
  landmark: '<path d="m3 9 9-6 9 6M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M3 21h18"/>',
  church: '<path d="M12 2v5m-3-2h6M7 10l5-3 5 3v11H7V10Zm-3 11h16M10 21v-6h4v6"/>',
  library: '<path d="M4 5c3-1 6 0 8 2v14c-2-2-5-3-8-2V5Zm16 0c-3-1-6 0-8 2v14c2-2 5-3 8-2V5Z"/>',
  sports: '<circle cx="12" cy="12" r="9"/><path d="m8 5 4 3 4-3m-4 3v5m-5 5 2-5-5-3m13 8-2-5 5-3"/>',
  wellness: '<path d="M12 21c-5-3-8-7-8-11 4 0 7 2 8 5 1-5 4-8 8-9 1 7-2 12-8 15Z"/><path d="M12 15c0-5-2-8-5-11"/>',
  nightlife: '<path d="M15 3a8 8 0 1 0 6 12 7 7 0 0 1-6-12Z"/><path d="m5 4 .5 1.5L7 6l-1.5.5L5 8l-.5-1.5L3 6l1.5-.5L5 4Z"/>',
  family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 21v-2a5 5 0 0 1 10 0v2m1-6a4 4 0 0 1 7 3v3"/>',
  viewpoint: '<path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v2m0 14v2"/>',
  coworking: '<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M8 21h8m-4-3v3M8 10h8m-8 4h5"/>',
  other: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
};

function getIconPath(name: PlaceIconName) {
  return iconPathMarkup[name] ?? iconPathMarkup.other;
}

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
      dangerouslySetInnerHTML={{ __html: getIconPath(name) }}
    />
  );
}

export function getPlaceIconMarkup(name: PlaceIconName) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${getIconPath(name)}</svg>`;
}
