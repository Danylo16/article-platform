import assert from "node:assert/strict";
import { test } from "node:test";
import { searchArticles, normalizeSearch } from "../apps/web/src/lib/site-search.ts";
import { CreateAuthorSchema } from "../apps/api/src/modules/authors/author.schema.ts";
import { UpdateArticleSchema } from "../apps/api/src/modules/articles/article.schema.ts";
import { isInstagramUrl } from "../apps/web/src/lib/social-links.ts";
import type { Article } from "../apps/web/src/types/article.ts";

const fixture = (id: string, title: string, content: string) => ({ id, title, content, subtitle: null, excerpt: null, author: { name: "Dariia" }, section: { name: "News" }, category: null, tags: [], publishedAt: "2026-10-21T00:00:00Z" }) as unknown as Article;
test("search excludes body-only matches and requires every query word", () => {
  const records = [fixture("body", "Andere Geschichte", "Wien Kultur"), fixture("title", "Wien Kultur", ""), fixture("partial", "Wien", "")];
  assert.deepEqual(searchArticles(records, "Wien Kultur").map(a => a.id), ["title"]);
  assert.deepEqual(searchArticles(records, "   "), []);
  assert.deepEqual(searchArticles(records, "missing"), []);
});
test("search handles German accents, author matches and literal punctuation safely", () => {
  assert.equal(normalizeSearch("Straße CAFÉ"), "strasse cafe");
  assert.equal(searchArticles([fixture("1", "Café", "")], "cafe").length, 1);
  assert.equal(searchArticles([fixture("1", "Café", "")], "Dariia").length, 1);
  assert.deepEqual(searchArticles([fixture("1", "Café", "")], "[.*]"), []);
});
test("author social URLs reject scripts, lookalike hosts and non-HTTPS", () => {
  for (const value of ["not a url", "javascript:alert(1)", "https://instagram.com.evil.test/a", "http://instagram.com/a"]) {
    assert.equal(isInstagramUrl(value), false);
    assert.equal(CreateAuthorSchema.safeParse({ name: "Dariia", instagramUrl: value }).success, false);
  }
  assert.equal(CreateAuthorSchema.safeParse({ name: "Dariia", instagramUrl: "https://www.instagram.com/dariia_skrypnyk/" }).success, true);
});
test("cover focus is bounded and descriptions have limits", () => {
  assert.equal(UpdateArticleSchema.safeParse({ coverFocusX: 0, coverFocusY: 100 }).success, true);
  assert.equal(UpdateArticleSchema.safeParse({ coverFocusX: 101 }).success, false);
  assert.equal(UpdateArticleSchema.safeParse({ coverFocusY: -1 }).success, false);
  assert.equal(UpdateArticleSchema.safeParse({ coverAlt: "x".repeat(301) }).success, false);
  assert.equal(UpdateArticleSchema.safeParse({ coverCaption: null }).success, true);
});
