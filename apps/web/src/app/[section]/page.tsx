import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
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
};

type StaticSection = NonNullable<ReturnType<typeof getEditorialSection>>;

function getSectionMetadata(
  section: { name: string; slug: string },
  description: string,
) {
  return {
    title: section.name,
    description,
    alternates: {
      canonical: `/${section.slug}`,
    },
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

  if (!staticSection) {
    return {};
  }

  try {
    const section = await getRequestedSection(sectionSlug);

    return section
      ? getSectionMetadata(section, staticSection.description)
      : {};
  } catch {
    return getSectionMetadata(staticSection, staticSection.description);
  }
}

export default async function SectionRoute({ params }: SectionRouteProps) {
  const { section: sectionSlug } = await params;
  const staticSection = getEditorialSection(sectionSlug);

  if (!staticSection) {
    notFound();
  }

  let section: Awaited<ReturnType<typeof getRequestedSection>>;

  try {
    section = await getRequestedSection(sectionSlug);
  } catch {
    return renderSectionLoadError(staticSection);
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
        description: staticSection.description,
      }}
      articles={articles}
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
