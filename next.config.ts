import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./lib/security/csp";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [{ source: "/cartoons", destination: "/comics", permanent: true }];
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/api/favicon" },
      { source: "/favicon.svg", destination: "/api/favicon" },
      { source: "/apple-touch-icon.png", destination: "/api/favicon" },
      { source: "/apple-touch-icon.svg", destination: "/api/favicon" },
    ];
  },
};

export default nextConfig;
