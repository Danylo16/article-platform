export const MEDIA_TITLE_PREFIX = "dorida:";

export type ArticleMedia = {
  raw: string;
  start: number;
  end: number;
  url: string;
  alt: string;
  caption: string;
  credit: string;
};

function escapeAlt(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("]", "\\]");
}

function unescapeAlt(value: string) {
  return value.replaceAll("\\]", "]").replaceAll("\\\\", "\\");
}

export function createMediaTitle(caption: string, credit: string) {
  const payload = encodeURIComponent(
    JSON.stringify({
      caption: caption.trim(),
      credit: credit.trim(),
    }),
  );

  return `${MEDIA_TITLE_PREFIX}${payload}`;
}

export function parseMediaTitle(title?: string | null) {
  if (!title?.startsWith(MEDIA_TITLE_PREFIX)) {
    return {
      caption: "",
      credit: "",
    };
  }

  try {
    const parsed = JSON.parse(
      decodeURIComponent(title.slice(MEDIA_TITLE_PREFIX.length)),
    ) as {
      caption?: unknown;
      credit?: unknown;
    };

    return {
      caption: typeof parsed.caption === "string" ? parsed.caption : "",
      credit: typeof parsed.credit === "string" ? parsed.credit : "",
    };
  } catch {
    return {
      caption: "",
      credit: "",
    };
  }
}

export function createMediaMarkdown(input: {
  url: string;
  alt: string;
  caption: string;
  credit: string;
}) {
  const title = createMediaTitle(input.caption, input.credit);

  return `![${escapeAlt(input.alt.trim())}](${input.url} "${title}")`;
}

export function getArticleMedia(content: string): ArticleMedia[] {
  const imagePattern =
    /!\[((?:\\.|[^\]])*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/g;
  const media: ArticleMedia[] = [];

  for (const match of content.matchAll(imagePattern)) {
    if (match.index === undefined) {
      continue;
    }

    const metadata = parseMediaTitle(match[3]);

    media.push({
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
      url: match[2],
      alt: unescapeAlt(match[1]),
      caption: metadata.caption,
      credit: metadata.credit,
    });
  }

  return media;
}
