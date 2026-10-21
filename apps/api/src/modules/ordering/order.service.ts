import { prisma } from "../../lib/prisma.js";
import { matchesOrder } from "./order.schema.js";

export async function reorder(resource: "sections" | "location-types", ids: string[], expectedIds: string[]) {
  // All positions are written atomically. Serializable isolation also rejects
  // overlapping reorders instead of committing a partially stale sequence.
  await prisma.$transaction(async tx => {
    const current = resource === "sections"
      ? await tx.section.findMany({ orderBy: [{ navigationOrder: "asc" }, { name: "asc" }], select: { id: true } })
      : await tx.locationType.findMany({ orderBy: [{ navigationOrder: "asc" }, { name: "asc" }], select: { id: true } });
    if (!matchesOrder(current.map(item => item.id), expectedIds)) throw new Error("ORDER_CONFLICT");
    for (const [navigationOrder, id] of ids.entries()) {
      if (resource === "sections") await tx.section.update({ where: { id }, data: { navigationOrder } });
      else await tx.locationType.update({ where: { id }, data: { navigationOrder } });
    }
  }, { isolationLevel: "Serializable", timeout: 15000 });
}
