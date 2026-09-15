import type { ComponentPropsWithoutRef } from "react";

import { getMediaUrl } from "../api/media";
import { parseMediaTitle } from "../lib/articleMedia";

import "./ArticleMarkdownImage.css";

type ArticleMarkdownImageProps = ComponentPropsWithoutRef<"img"> & {
  node?: unknown;
};

export function ArticleMarkdownImage({
  src,
  alt,
  title,
}: ArticleMarkdownImageProps) {
  const metadata = parseMediaTitle(title);
  const imageUrl = getMediaUrl(src);

  if (!imageUrl) {
    return null;
  }

  return (
    <span className="article-inline-media">
      <img src={imageUrl} alt={alt ?? ""} loading="lazy" />

      {(metadata.caption || metadata.credit) && (
        <span className="article-inline-media__caption">
          {metadata.caption && <span>{metadata.caption}</span>}
          {metadata.credit && (
            <small>Foto: {metadata.credit}</small>
          )}
        </span>
      )}
    </span>
  );
}
