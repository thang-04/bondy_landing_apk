import { NextRequest, NextResponse } from "next/server";

// Tell Next.js to always run this route dynamically (not cached)
export const dynamic = "force-dynamic";

// Allow large file uploads (up to 60 seconds runtime)
export const maxDuration = 60;

const BACKEND_URL = "http://103.149.86.25:3000";

// Rewrite backend URLs to point to our Vercel proxy so images load correctly
function rewriteBackendUrls(text: string): string {
  // Replace https://103.149.86.25:3000/api/uploads/ → /uploads/
  // So Flutter can load images through our proxy
  return text
    .replace(/https?:\/\/103\.149\.86\.25:3000\/api\/uploads\//g, "/uploads/")
    .replace(/https?:\/\/103\.149\.86\.25:3000\/uploads\//g, "/uploads/");
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const backendTarget = `${BACKEND_URL}/api/upload${url.search}`;

    // Build forwarded headers - preserve Authorization and Content-Type (multipart boundary)
    const forwardHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip headers that would conflict with the proxied request
      if (
        lowerKey !== "host" &&
        lowerKey !== "content-length" &&
        lowerKey !== "transfer-encoding" &&
        lowerKey !== "connection" &&
        lowerKey !== "keep-alive"
      ) {
        forwardHeaders[key] = value;
      }
    });

    console.log(
      `[api-proxy/upload] POST → ${backendTarget}`,
      `Content-Type: ${forwardHeaders["content-type"] || "unknown"}`
    );

    // Stream the request body to backend (preserves multipart/form-data boundary)
    const backendResponse = await fetch(backendTarget, {
      method: "POST",
      headers: forwardHeaders,
      body: req.body,
      // @ts-expect-error - duplex is required for streaming body in Node.js 18+
      duplex: "half",
    });

    // Read entire response as text (buffered, not streaming)
    // This is CRITICAL: Safari iOS doesn't support ReadableStream.getReader()
    // properly when reading chunked transfer responses.
    const responseText = await backendResponse.text();

    // Rewrite any backend IP URLs in the response to use our Vercel proxy
    const rewrittenText = rewriteBackendUrls(responseText);

    console.log(
      `[api-proxy/upload] Backend → ${backendResponse.status}:`,
      rewrittenText.substring(0, 300)
    );

    const responseBody = Buffer.from(rewrittenText, "utf-8");

    // Return fully-buffered response with explicit Content-Length
    // This prevents Safari from trying to stream-read the response
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": String(responseBody.length),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        // Prevent any caching/transform issues
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[api-proxy/upload] Proxy error:", error);

    const errorBody = JSON.stringify({
      success: false,
      message: "Upload proxy error: " + String(error),
    });

    return new NextResponse(errorBody, {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": String(Buffer.byteLength(errorBody, "utf-8")),
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}
