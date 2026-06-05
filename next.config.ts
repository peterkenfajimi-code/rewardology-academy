import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      { source: "/cartoons", destination: "/comics", permanent: true },
      { source: "/favicon.ico", destination: "/favicon.svg", permanent: false },
    ];
  },
};

export default nextConfig;
