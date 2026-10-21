// Editorial estimate, not a measurement of an individual reader's speed.
const WORDS_PER_MINUTE = 220;
const CODE_TOKENS_PER_MINUTE = 100;
const wordPattern = /[\p{L}\p{N}]+(?:['’\u2019-][\p{L}\p{N}]+)*/gu;

export function estimateReadingTime(markdown: string) {
  let codeTokens = 0;
  let imageCount = 0;
  const text = markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n([\s\S]*?)(?:^ {0,3}\1[^\S\n]*$|(?![\s\S]))/gm, (_match, _fence, code: string) => {
      codeTokens += (code.match(wordPattern) ?? []).length;
      return " ";
    })
    .replace(/!\[[^\]]*\]\((?:[^()\n]|\([^()]*\))*\)|!\[[^\]]*\]\[[^\]]*\]|<img\b[^>]*>/gi, () => {
      imageCount += 1;
      return " ";
    })
    .replace(/^ {0,3}\[[^\]]+\]:[^\n]*$/gm, " ")
    .replace(/\[([^\]]+)\]\((?:[^()\n]|\([^()]*\))*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, " ")
    .replace(/[\\`*_~|]/g, " ");
  const words = (text.match(wordPattern) ?? []).length;
  // First illustration: 12 seconds, then progressively down to 3 seconds.
  let imageSeconds = 0;
  for (let index = 0; index < imageCount; index += 1) {
    imageSeconds += Math.max(3, 12 - index);
  }
  const seconds = (words / WORDS_PER_MINUTE + codeTokens / CODE_TOKENS_PER_MINUTE) * 60 + imageSeconds;
  return { words, imageCount, codeTokens, minutes: Math.max(1, Math.ceil(seconds / 60)) };
}

export function calculateReadingTime(markdown: string) {
  return estimateReadingTime(markdown).minutes;
}
