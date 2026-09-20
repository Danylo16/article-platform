const WORDS_PER_MINUTE = 220;

function removeMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, " ")
    .replace(/[\\*_~|]/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
}

export function calculateReadingTime(markdown: string) {
  const words = removeMarkdown(markdown).match(
    /[\p{L}\p{N}]+(?:['’\u2019-][\p{L}\p{N}]+)*/gu,
  );

  return Math.max(1, Math.ceil((words?.length ?? 0) / WORDS_PER_MINUTE));
}
