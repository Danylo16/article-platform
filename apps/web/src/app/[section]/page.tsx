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
  const sections = await getVisibleSections().catch(() => []);
  const section = sections.find((item) => item.slug === sectionSlug);

  if (!section || !staticSection) {
    return {};
  }

  return {
    title: section.name,
    description: staticSection.description,
    alternates: {
      canonical: `/${section.slug}`,
    },
  };
}

export default async function SectionRoute({ params }: SectionRouteProps) {
  const { section: sectionSlug } = await params;
  const staticSection = getEditorialSection(sectionSlug);
  const sections = await getVisibleSections().catch(() => []);
  const section = sections.find((item) => item.slug === sectionSlug);

  if (!section || !staticSection) {
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
