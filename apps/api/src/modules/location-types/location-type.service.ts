import slugify from "slugify";

import { prisma } from "../../lib/prisma.js";
import type {
  CreateLocationTypeInput,
  UpdateLocationTypeInput,
} from "./location-type.schema.js";

function createSlug(name: string) {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}

async function assertSlugAvailable(slug: string, ignoredId?: string) {
  const existing = await prisma.locationType.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing && existing.id !== ignoredId) {
    throw new Error("LOCATION_TYPE_ALREADY_EXISTS");
  }
}

export async function getAdminLocationTypes() {
  return prisma.locationType.findMany({
    include: {
      _count: {
        select: {
          places: true,
        },
      },
    },
    orderBy: [{ navigationOrder: "asc" }, { name: "asc" }],
  });
}

export async function createLocationType(input: CreateLocationTypeInput) {
  const slug = createSlug(input.name);

  await assertSlugAvailable(slug);

  return prisma.locationType.create({
    data: {
      ...input,
      slug,
    },
  });
}

export async function updateLocationType(
  id: string,
  input: UpdateLocationTypeInput,
) {
  const slug = input.name ? createSlug(input.name) : undefined;

  if (slug) {
    await assertSlugAvailable(slug, id);
  }

  return prisma.locationType.update({
    where: { id },
    data: {
      ...input,
      ...(slug ? { slug } : {}),
    },
  });
}

export async function deleteLocationType(id: string) {
  const placeCount = await prisma.place.count({
    where: { typeId: id },
  });

  if (placeCount > 0) {
    throw new Error("LOCATION_TYPE_IN_USE");
  }

  return prisma.locationType.delete({ where: { id } });
}
