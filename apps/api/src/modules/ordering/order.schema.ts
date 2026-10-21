import { z } from "zod";

const Ids = z.array(z.string().min(1).max(100)).min(1).max(1000)
  .refine(ids => new Set(ids).size === ids.length, "Duplicate ids");
export const ReorderSchema = z.object({ ids: Ids, expectedIds: Ids }).strict()
  .refine(({ ids, expectedIds }) => ids.length === expectedIds.length && ids.every(id => expectedIds.includes(id)), "Ids must be a permutation");

export function matchesOrder(current: string[], expected: string[]) {
  return current.length === expected.length && current.every((id, index) => id === expected[index]);
}
