import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../index.css";
import "../views/HomePage.css";
import "../components/ArticleMarkdownImage.css";
import "../components/admin/InlineMediaEditor.css";
import "../views/admin/AdminArticleEditorPage.css";
import "../views/admin/AdminContentPage.css";
import "../views/admin/AdminAuth.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DORIDA — Journal aus Wien",
    template: "%s | DORIDA",
  },
  description:
    "Geschichten über Menschen, Kultur und Politik – nah an Wien und mit Blick in die Tiefe.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
