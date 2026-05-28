import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://103.149.86.25:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
