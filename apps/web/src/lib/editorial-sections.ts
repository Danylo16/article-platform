export const EDITORIAL_SECTIONS = [
  {
    name: "EVENTS",
    slug: "events",
    description: "Termine, Festivals und Begegnungen in Wien.",
  },
  {
    name: "LOCATIONS",
    slug: "locations",
    description: "Orte, Lokale und Räume, die Wien prägen.",
  },
  {
    name: "MODE",
    slug: "mode",
    description: "Mode, Gestaltung und die Menschen dahinter.",
  },
  {
    name: "KULTUR",
    slug: "kultur",
    description: "Kunst, Bühne, Literatur und neue Perspektiven.",
  },
  {
    name: "INTERVIEWS",
    slug: "interviews",
    description: "Gespräche mit Menschen, die etwas zu erzählen haben.",
  },
  {
    name: "NEWS",
    slug: "news",
    description: "Aktuelle Entwicklungen aus Wien und darüber hinaus.",
  },
] as const;

export type EditorialSectionSlug = (typeof EDITORIAL_SECTIONS)[number]["slug"];

export function getEditorialSection(slug: string) {
  return EDITORIAL_SECTIONS.find((section) => section.slug === slug) ?? null;
}
