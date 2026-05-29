import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND_URL = "http://103.149.86.25:3000";

// Rewrite backend IP URLs → Vercel proxy URLs so images load correctly on iOS
function rewriteBackendUrls(text: string): string {
  return text
    .replace(
      /https?:\/\/103\.149\.86\.25:?\d*\/api\/uploads\//g,
      "/uploads/"
    )
    .replace(/https?:\/\/103\.149\.86\.25:?\d*\/uploads\//g, "/uploads/");
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const backendTarget = `${BACKEND_URL}/api/upload${url.search}`;

    // ─── Step 1: Read the FULL request body as ArrayBuffer ─────────────────
    // CRITICAL: Vercel Serverless does NOT support streaming req.body with
    // duplex:"half". We must buffer the entire body first.
    const bodyBuffer = await req.arrayBuffer();

    // ─── Step 2: Forward headers, preserving Content-Type (with boundary) ──
    const forwardHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "keep-alive" &&
        lowerKey !== "transfer-encoding"
        // NOTE: Do NOT skip content-length here - let fetch recalculate it
        // NOTE: Do NOT skip content-type - it has the multipart boundary!
      ) {
        forwardHeaders[key] = value;
      }
    });

    console.log(
      `[upload-proxy] POST → ${backendTarget}`,
      `Content-Type: ${forwardHeaders["content-type"] || "missing!"}`,
      `Body size: ${bodyBuffer.byteLength} bytes`
    );

    // ─── Step 3: Send buffered body to backend ──────────────────────────────
    const backendResponse = await fetch(backendTarget, {
      method: "POST",
      headers: forwardHeaders,
      body: bodyBuffer, // ArrayBuffer - works reliably on Vercel
    });

    // ─── Step 4: Read backend response as text ──────────────────────────────
    const responseText = await backendResponse.text();
    console.log(
      `[upload-proxy] Backend → ${backendResponse.status}: ${responseText.substring(0, 300)}`
    );

    // ─── Step 5: Rewrite any IP-based URLs in the response ─────────────────
    const rewrittenText = rewriteBackendUrls(responseText);

    // ─── Step 6: Return fully-buffered response ─────────────────────────────
    // Use explicit Content-Length so Safari doesn't try to stream-read the body
    const responseBody = Buffer.from(rewrittenText, "utf-8");

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": String(responseBody.length),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[upload-proxy] ERROR:", error);
    const errMsg = JSON.stringify({
      success: false,
      message: "Upload proxy error: " + String(error),
    });
    return new NextResponse(errMsg, {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
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
