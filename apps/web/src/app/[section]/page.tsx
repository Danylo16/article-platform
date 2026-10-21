import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicCategoriesEnabled,
  getPublicPlaces,
  getPublishedArticles,
  getVisibleSections,
} from "../../api/server";
import {
  EDITORIAL_SECTIONS,
  getEditorialSection,
} from "../../lib/editorial-sections";
import { SectionPage } from "../../views/SectionPage";
import { LocationsPage } from "../../views/LocationsPage";

type SectionRouteProps = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ rubrik?: string | string[] }>;
};

type StaticSection = { name: string; slug: string; description: string };

function getSectionMetadata(
  section: { name: string; slug: string },
  description: string,
) {
  return {
    title: section.name,
    description,
    alternates: { canonical: `/${section.slug}` },
    openGraph: { type: "website", siteName: "DORIDA", title: `${section.name} | DORIDA`, description, url: `/${section.slug}`, images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: `${section.name} | DORIDA`, description, images: ["/opengraph-image"] },
  } satisfies Metadata;
}

async function getRequestedSection(sectionSlug: string) {
  const sections = await getVisibleSections();
  return sections.find((section) => section.slug === sectionSlug) ?? null;
}

export function generateStaticParams() {
  return EDITORIAL_SECTIONS.map((section) => ({
    section: section.slug,
  }));
}

export async function generateMetadata({
  params,
}: SectionRouteProps): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const staticSection = getEditorialSection(sectionSlug);

  try {
    const section = await getRequestedSection(sectionSlug);

    return section
      ? getSectionMetadata(section, staticSection?.description ?? `Geschichten und Perspektiven aus dem Ressort ${section.name}.`)
      : {};
  } catch {
    return staticSection ? getSectionMetadata(staticSection, staticSection.description) : {};
  }
}

export default async function SectionRoute({ params, searchParams }: SectionRouteProps) {
  const { section: sectionSlug } = await params;
  const staticSection = getEditorialSection(sectionSlug);

  let section: Awaited<ReturnType<typeof getRequestedSection>>;

  try {
    section = await getRequestedSection(sectionSlug);
  } catch {
    return renderSectionLoadError(staticSection ?? { name: sectionSlug, slug: sectionSlug, description: "Dieses Ressort ist gerade nicht erreichbar." });
  }

  if (!section) {
    notFound();
  }

  if (section.slug === "locations") {
    let places: Awaited<ReturnType<typeof getPublicPlaces>> = [];
    let placesLoadError = false;

    try {
      places = await getPublicPlaces();
    } catch {
      placesLoadError = true;
    }

    return <LocationsPage places={places} loadError={placesLoadError} />;
  }

  const query = await searchParams;
  const categorySlug = await getPublicCategoriesEnabled() && typeof query.rubrik === "string" ? query.rubrik : undefined;

  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let loadError = false;

  try {
    articles = await getPublishedArticles(section.slug);
  } catch {
    loadError = true;
  }

  return (
    <SectionPage
      section={{
        name: section.name,
        slug: section.slug,
        description: staticSection?.description ?? `Geschichten und Perspektiven aus dem Ressort ${section.name}.`,
      }}
      articles={articles}
      categorySlug={categorySlug}
      loadError={loadError}
    />
  );
}

function renderSectionLoadError(section: StaticSection) {
  if (section.slug === "locations") {
    return <LocationsPage places={[]} loadError />;
  }

  return (
    <SectionPage section={section} articles={[]} loadError />
  );
}
