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
  async headers() {
    return [
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
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // General headers for all Flutter web assets
        source: "/web/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
