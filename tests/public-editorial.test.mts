import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateReadingTime, calculateReadingTime } from "../apps/api/src/modules/articles/article.reading-time.ts";
import { categoryOptions, filterByCategory, sameLabel, categoryHref } from "../apps/web/src/lib/public-categories.ts";
import type { Article } from "../apps/web/src/types/article.ts";

test("reading estimate counts visible text, not link targets, markup or hidden comments", () => {
  assert.equal(estimateReadingTime('# Guten Morgen\n[Wien erleben](https://example.com/a/b)\n<!-- hidden words -->').words, 4);
  assert.equal(estimateReadingTime('[Wien erleben][link]\n[link]: https://example.com').words, 2);
  assert.equal(estimateReadingTime('Wien &amp; Berlin').words, 2);
});
test("reading estimate supports multilingual words and a one-minute minimum", () => {
  assert.equal(estimateReadingTime('Український текст über Wien').words, 4);
  assert.equal(calculateReadingTime(''), 1);
  assert.equal(calculateReadingTime('Wort '.repeat(221)), 2);
});
test("illustrations add time without counting their URLs and alt text as prose", () => {
  const result = estimateReadingTime('Wort '.repeat(220) + '\n![long alt text](https://example.com/pic_(1).jpg)');
  assert.equal(result.words, 220);
  assert.equal(result.imageCount, 1);
  assert.equal(result.minutes, 2);
  assert.equal(estimateReadingTime('![Bild][ref]\n[ref]: /bild.jpg').imageCount, 1);
});
test("fenced code is timed separately; image syntax inside code is not an illustration", () => {
  const result = estimateReadingTime('```ts\n' + 'value '.repeat(101) + '\n```');
  assert.equal(result.words, 0);
  assert.equal(result.codeTokens, 101);
  assert.equal(result.minutes, 2);
  assert.equal(estimateReadingTime('~~~\n![not an image](/x.jpg)\n~~~').imageCount, 0);
});
test("category controls count actual published-list categories and preserve uncategorized stories under All", () => {
  const articles = [{ category: { name: 'Kultur', slug: 'kultur' } }, { category: null }, { category: { name: 'Kultur', slug: 'kultur' } }] as Article[];
  assert.deepEqual(categoryOptions(articles), [{ name: 'Kultur', slug: 'kultur', count: 2 }]);
  assert.equal(filterByCategory(articles).length, 3);
  assert.equal(filterByCategory(articles, 'kultur').length, 2);
  assert.equal(filterByCategory(articles, 'missing').length, 0);
  assert.equal(sameLabel(' Events ', 'EVENTS'), true);
  assert.equal(categoryHref('kunst & kultur'), '/?rubrik=kunst%20%26%20kultur');
});
