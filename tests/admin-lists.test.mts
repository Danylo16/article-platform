import assert from "node:assert/strict";
import { test } from "node:test";
import { moveItem, paginate } from "../apps/web/src/lib/admin-list.ts";
import { matchesOrder, ReorderSchema } from "../apps/api/src/modules/ordering/order.schema.ts";

test("article pages contain 10 items, with a partial final page", () => {
  const articles = Array.from({ length: 23 }, (_, id) => ({ id, title: `Article ${id}` }));
  const { start, end, pageCount } = paginate(articles.length, 3);
  assert.equal(pageCount, 3);
  assert.deepEqual(articles.slice(start, end).map(a => a.id), [20, 21, 22]);
});

test("search reaches records beyond the first page before pagination", () => {
  const articles = Array.from({ length: 35 }, (_, id) => ({ id, title: id === 34 ? "Match" : "Other" }));
  const found = articles.filter(a => a.title.includes("Match"));
  const { start, end } = paginate(found.length, 1);
  assert.deepEqual(found.slice(start, end).map(a => a.id), [34]);
});

test("deleting the only item on the last page clamps to the remaining page", () => {
  assert.deepEqual(paginate(10, 2), { currentPage: 1, pageCount: 1, start: 0, end: 10 });
  assert.deepEqual(paginate(0, 5), { currentPage: 1, pageCount: 1, start: 0, end: 0 });
});

test("reordering moves both directions without mutating the original", () => {
  const input = ["a", "b", "c"];
  assert.deepEqual(moveItem(input, 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(input, 2, 0), ["c", "a", "b"]);
  assert.deepEqual(moveItem(input, -1, 0), input);
  assert.deepEqual(moveItem(input, 0, 3), input);
  assert.deepEqual(input, ["a", "b", "c"]);
});

test("reorder rejects duplicates, missing/foreign ids and excessive lists", () => {
  const expectedIds = ["a", "b", "c"];
  for (const ids of [["a", "a", "c"], ["a", "b"], ["a", "b", "foreign"], []]) {
    assert.equal(ReorderSchema.safeParse({ ids, expectedIds }).success, false);
  }
  assert.equal(ReorderSchema.safeParse({ ids: ["c", "b", "a"], expectedIds }).success, true);
  const ids = Array.from({ length: 1001 }, (_, i) => String(i));
  assert.equal(ReorderSchema.safeParse({ ids, expectedIds: ids }).success, false);
});

test("concurrent edits are detected from the complete expected ordering", () => {
  assert.equal(matchesOrder(["a", "b"], ["a", "b"]), true);
  assert.equal(matchesOrder(["b", "a"], ["a", "b"]), false);
  assert.equal(matchesOrder(["a", "b", "c"], ["a", "b"]), false);
  assert.equal(matchesOrder(["a"], ["a", "b"]), false);
});
