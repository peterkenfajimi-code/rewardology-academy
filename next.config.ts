import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
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
