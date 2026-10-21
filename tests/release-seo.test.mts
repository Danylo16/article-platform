import { test } from "node:test";
import assert from "node:assert/strict";
import { serializeJsonLd, seoDescription, indexingEnabled, articleJsonLd } from "../apps/web/src/lib/seo.ts";
import type { Article } from "../apps/web/src/types/article.ts";
test("JSON-LD cannot terminate its script element", () => {
 const input = { headline: '</script><script>alert(1)</script>' };
 const json = serializeJsonLd(input);
 assert.equal(json.includes('<'), false);
 assert.deepEqual(JSON.parse(json), input);
});
test("descriptions select nonblank values and remove Markdown", () => {
 assert.equal(seoDescription('  ', '**Kultur** in [Wien](https://example.com)'), 'Kultur in Wien');
 assert.ok(seoDescription('Wien '.repeat(100)).length <= 165);
});
test("indexing is disabled unless explicitly enabled", () => {
 const previous = process.env.SITE_INDEXING_ENABLED;
 try {
  delete process.env.SITE_INDEXING_ENABLED; assert.equal(indexingEnabled(), false);
  process.env.SITE_INDEXING_ENABLED='false'; assert.equal(indexingEnabled(), false);
  process.env.SITE_INDEXING_ENABLED='true'; assert.equal(indexingEnabled(), true);
 } finally { if (previous === undefined) delete process.env.SITE_INDEXING_ENABLED; else process.env.SITE_INDEXING_ENABLED=previous; }
});
test("article structured data uses actual author and dates, without a fictitious photo", () => {
 const article = {slug:'kultur',title:'Kultur',content:'Text',author:{name:'Dariia'},section:{name:'Kultur'},publishedAt:'2026-10-21',updatedAt:'2026-10-22'} as Article;
 const data = articleJsonLd(article,null);
 assert.equal(data.author.name,'Dariia'); assert.equal(data.dateModified,article.updatedAt);
 assert.equal('image' in data,false); assert.ok(data.url.endsWith('/articles/kultur'));
});
