import type { MetadataRoute } from "next";
import { indexingEnabled, absoluteUrl } from "../lib/seo";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  return indexingEnabled()
    ? { rules: { userAgent: "*", allow: "/", disallow: ["/backend/", "/api/"] }, sitemap: absoluteUrl("/sitemap.xml") }
    : { rules: { userAgent: "*", disallow: "/" } };
}
