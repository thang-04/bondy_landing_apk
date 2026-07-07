import type { NextConfig } from "next";

// Backend API base URL. Overridable via env (build-time for Docker/standalone);
// falls back to the production VPS.
const API_PROXY_TARGET = (
  process.env.API_PROXY_TARGET || "https://103.149.86.25/api"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/web",
        destination: "/web/index.html",
      },
      {
        source: "/web/",
        destination: "/web/index.html",
      },
      {
        source: "/api-proxy/:path*",
        destination: `${API_PROXY_TARGET}/:path*`,
      },
      {
        source: "/web/assets/.env",
        destination: "/web/assets/env.txt",
      },
      {
        source: "/uploads/:path*",
        destination: `${API_PROXY_TARGET}/uploads/:path*`,
      },
      {
        source: "/api/uploads/:path*",
        destination: `${API_PROXY_TARGET}/uploads/:path*`,
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
