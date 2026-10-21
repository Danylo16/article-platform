"use client";
import { useState } from "react";
export function AuthorAvatar({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> :
    <span className="article-page__author-initials" aria-hidden="true">{name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("")}</span>;
}
