import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://103.149.86.25/api/:path*",
      },
      {
        source: "/web/assets/.env",
        destination: "/web/assets/env.txt",
      },
      {
        source: "/uploads/:path*",
        destination: "https://103.149.86.25/api/uploads/:path*",
      },
      {
        source: "/api/uploads/:path*",
        destination: "https://103.149.86.25/api/uploads/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        // CORS and Cache control for proxied uploads
        source: "/uploads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
      {
        // CORS and Cache control for proxied API uploads
        source: "/api/uploads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
      {
        // Serve .wasm files with correct MIME type (critical for iOS Safari CanvasKit)
        source: "/web/:path*.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Serve .js files in /web/ with correct MIME type
        source: "/web/:path*.js",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        // CORS for all Flutter web assets (fonts, images, etc.)
        source: "/web/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
