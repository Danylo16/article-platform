import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    const target = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");
    if (!target) return [];
    const url = new URL(target);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("Invalid API_PROXY_TARGET");
    return [{ source: "/backend/:path*", destination: `${target}/:path*` }];
  },
  async redirects() { return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }]; },
  async headers() {
    return [
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, ...(process.env.SITE_INDEXING_ENABLED === "true" ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }])] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/search", headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] },
    ];
  },
};
export default nextConfig;
