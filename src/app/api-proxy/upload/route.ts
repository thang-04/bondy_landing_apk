import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND_URL = "http://103.149.86.25:3000";

// Rewrite backend IP URLs → Vercel proxy URLs so images load correctly on iOS
function rewriteBackendUrls(text: string): string {
  return text
    .replace(/https?:\/\/103\.149\.86\.25:?\d*\/api\/uploads\//g, "/uploads/")
    .replace(/https?:\/\/103\.149\.86\.25:?\d*\/uploads\//g, "/uploads/");
}

// Build CORS response headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const backendTarget = `${BACKEND_URL}/api/upload${url.search}`;

    // ── Step 1: Buffer entire request body ────────────────────────────────
    // Vercel Serverless does NOT support streaming body (duplex:"half").
    // Must buffer completely first.
    const bodyBuffer = await req.arrayBuffer();

    // ── Step 2: Build forwarded headers ───────────────────────────────────
    const forwardHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip hop-by-hop headers that conflict with proxy
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "keep-alive" &&
        lowerKey !== "transfer-encoding" &&
        lowerKey !== "content-length" // Let fetch recalculate based on ArrayBuffer
      ) {
        forwardHeaders[key] = value;
      }
    });

    // ── Step 3: Forward real client IP ────────────────────────────────────
    // Without this, backend rate-limits ALL users to the same Vercel IP pool.
    // Extract the original client IP from Vercel's x-forwarded-for chain.
    const vercelForwardedFor = req.headers.get("x-forwarded-for");
    const realClientIp = vercelForwardedFor
      ? vercelForwardedFor.split(",")[0].trim() // First IP = original client
      : req.headers.get("x-real-ip") || "unknown";

    forwardHeaders["x-forwarded-for"] = realClientIp;
    forwardHeaders["x-real-ip"] = realClientIp;

    console.log(
      `[upload-proxy] POST → ${backendTarget} | ` +
      `IP: ${realClientIp} | ` +
      `ContentType: ${forwardHeaders["content-type"] || "MISSING"} | ` +
      `BodySize: ${bodyBuffer.byteLength} bytes`
    );

    // ── Step 4: Send to backend ────────────────────────────────────────────
    const backendResponse = await fetch(backendTarget, {
      method: "POST",
      headers: forwardHeaders,
      body: bodyBuffer,
    });

    // ── Step 5: Read backend response ─────────────────────────────────────
    const responseText = await backendResponse.text();
    console.log(
      `[upload-proxy] Backend → ${backendResponse.status}: ${responseText.substring(0, 300)}`
    );

    // ── Step 6: Rewrite IP-based URLs in response ──────────────────────────
    const rewrittenText = rewriteBackendUrls(responseText);
    const responseBody = Buffer.from(rewrittenText, "utf-8");

    // ── Step 7: Build response headers ────────────────────────────────────
    const responseHeaders: Record<string, string> = {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": String(responseBody.length),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };

    // Forward rate-limit headers from backend so client knows when to retry
    const rateLimitHeaders = [
      "x-ratelimit-limit",
      "x-ratelimit-remaining",
      "x-ratelimit-reset",
      "retry-after",
      "ratelimit-limit",
      "ratelimit-remaining",
      "ratelimit-reset",
    ];
    rateLimitHeaders.forEach((h) => {
      const val = backendResponse.headers.get(h);
      if (val) responseHeaders[h] = val;
    });

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[upload-proxy] FATAL ERROR:", error);
    const errMsg = JSON.stringify({
      success: false,
      message: "Upload proxy error: " + String(error),
    });
    return new NextResponse(errMsg, {
      status: 500,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": String(Buffer.byteLength(errMsg, "utf-8")),
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}
