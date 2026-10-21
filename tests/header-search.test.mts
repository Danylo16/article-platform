import assert from "node:assert/strict";
import { test } from "node:test";
import { searchArticles, suggestCorrection } from "../apps/web/src/lib/site-search.ts";
import type { Article } from "../apps/web/src/types/article.ts";
const record = (id: string, title: string, author = "Anna", category = "Kultur", section = "News") => ({id, title, author: {name: author}, category: {name: category}, section: {name: section}, publishedAt: "2026-10-21"}) as Article;
test("strict field priority is title, author, category, section", () => {
 const articles = [record("section", "Andere", "Anna", "Kultur", "Wien"), record("category", "Andere", "Anna", "Wien"), record("author", "Andere", "Wien"), record("title", "Wien")];
 assert.deepEqual(searchArticles(articles, "Wien").map(a => a.id), ["title", "author", "category", "section"]);
 assert.equal(searchArticles(articles, "Wien Anna").length, 3);
});
test("correction handles transpositions without replacing valid prefixes or short queries", () => {
 const articles = [record("1", "Kultur in Wien", "Dariia Skrypnyk")];
 assert.equal(suggestCorrection(articles, "Wein"), "wien");
 assert.equal(suggestCorrection(articles, "Kult"), null);
 assert.equal(suggestCorrection(articles, "xy"), null);
 assert.equal(suggestCorrection(articles, "unrelated"), null);
 assert.equal(suggestCorrection(articles, "Kultur Wiem"), "kultur wien");
});

 test("the long-read fixture exceeds ten minutes using the production estimator", async () => {
 const { readFile } = await import("node:fs/promises");
 const { estimateReadingTime } = await import("../apps/api/src/modules/articles/article.reading-time.ts");
 const text = await readFile(new URL("../apps/api/prisma/fixtures/long-read.md", import.meta.url), "utf8");
 assert.ok(estimateReadingTime(text).minutes > 10);
 });
