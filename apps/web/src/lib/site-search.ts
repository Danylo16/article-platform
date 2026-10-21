import type { Article } from "../types/article";

export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("de").replace(/ß/g, "ss").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
const fields = (article: Article) => [article.title, article.author.name, article.category?.name ?? "", article.section.name].map(normalizeSearch);

export function searchArticles(articles: Article[], query: string) {
  const tokens = [...new Set(normalizeSearch(query.slice(0, 120)).split(/\s+/).filter(Boolean))];
  if (!tokens.length) return [];
  return articles.flatMap(article => {
    const values = fields(article);
    if (!tokens.every(token => values.some(value => value.includes(token)))) return [];
    // Lexicographic ranking: lower-priority fields cannot outweigh a title match.
    const rank = values.map(value => tokens.filter(token => value.includes(token)).length);
    return [{ article, rank }];
  }).sort((a, b) => {
    for (let i = 0; i < 4; i++) if (a.rank[i] !== b.rank[i]) return b.rank[i] - a.rank[i];
    return (b.article.publishedAt ?? "").localeCompare(a.article.publishedAt ?? "") || a.article.id.localeCompare(b.article.id);
  }).map(({ article }) => article);
}

function distance(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
  }
  return rows[a.length][b.length];
}

export function suggestCorrection(articles: Article[], query: string): string | null {
  const normalized = normalizeSearch(query.slice(0, 120));
  if (!normalized || searchArticles(articles, normalized).length) return null;
  const vocabulary = [...new Set(articles.flatMap(article => fields(article).flatMap(value => value.split(" "))))].filter(word => word.length >= 4 && word.length <= 40).sort();
  const corrected = normalized.split(" ").map(token => {
    if (token.length < 4 || token.length > 40 || vocabulary.some(word => word.includes(token))) return token;
    const candidates = vocabulary.filter(word => Math.abs(word.length - token.length) <= 2).map(word => ({ word, edits: distance(token, word) })).filter(({ edits }) => edits <= (token.length >= 7 ? 2 : 1)).sort((a, b) => a.edits - b.edits || a.word.localeCompare(b.word));
    return candidates[0]?.word ?? token;
  }).join(" ");
  return corrected !== normalized && searchArticles(articles, corrected).length ? corrected : null;
}
