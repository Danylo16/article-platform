import slugify from "slugify";

import { prisma } from "../../lib/prisma.js";
import type {
  CreatePlaceInput,
  UpdatePlaceInput,
} from "./place.schema.js";

function createSlug(name: string) {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}

async function assertSlugAvailable(slug: string, ignoredId?: string) {
  const existing = await prisma.place.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing && existing.id !== ignoredId) {
    throw new Error("PLACE_ALREADY_EXISTS");
  }
}

export async function getPublicPlaces() {
  return prisma.place.findMany({
    where: {
      isVisible: true,
      type: { isVisible: true },
    },
    include: {
      type: true,
      articles: {
        where: {
          status: "PUBLISHED",
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          excerpt: true,
          coverImage: true,
          coverFocusX: true,
          coverFocusY: true,
          publishedAt: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAdminPlaces() {
  return prisma.place.findMany({
    include: {
      type: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function createPlace(input: CreatePlaceInput) {
  const slug = createSlug(input.name);

  await assertSlugAvailable(slug);
  await assertLocationTypeExists(input.typeId);

  return prisma.place.create({
    data: {
      ...input,
      slug,
    },
  });
}

export async function updatePlace(id: string, input: UpdatePlaceInput) {
  const slug = input.name ? createSlug(input.name) : undefined;

  if (slug) {
    await assertSlugAvailable(slug, id);
  }

  if (input.typeId) {
    await assertLocationTypeExists(input.typeId);
  }

  return prisma.place.update({
    where: { id },
    data: {
      ...input,
      ...(slug ? { slug } : {}),
    },
  });
}

async function assertLocationTypeExists(id: string) {
  const locationType = await prisma.locationType.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!locationType) {
    throw new Error("LOCATION_TYPE_NOT_FOUND");
  }
}

export async function deletePlace(id: string) {
  const articleCount = await prisma.article.count({
    where: {
      placeId: id,
    },
  });

  if (articleCount > 0) {
    throw new Error("PLACE_IN_USE");
  }

  return prisma.place.delete({
    where: { id },
  });
}
