import { prisma } from "../../lib/prisma.js";

export async function getVisibleSections() {
  return prisma.section.findMany({
    where: {
      isVisible: true,
    },
    orderBy: {
      navigationOrder: "asc",
    },
  });
}

export async function getAdminSections() {
  return prisma.section.findMany({
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: [{ navigationOrder: "asc" }, { name: "asc" }],
  });
}

export async function updateSection(
  id: string,
  input: {
    name?: string;
    navigationOrder?: number;
    isVisible?: boolean;
  },
) {
  return prisma.section.update({
    where: { id },
    data: input,
  });
}
