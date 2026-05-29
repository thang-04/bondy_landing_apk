import { NextRequest, NextResponse } from "next/server";

// Tell Next.js to always run this route dynamically (not cached)
export const dynamic = "force-dynamic";

// Allow large file uploads (up to 60 seconds runtime)
export const maxDuration = 60;

const BACKEND_URL = "http://103.149.86.25:3000";

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
        lowerKey !== "connection"
      ) {
        forwardHeaders[key] = value;
      }
    });

    console.log(
      `[api-proxy/upload] Proxying POST to: ${backendTarget}`,
      `Content-Type: ${forwardHeaders["content-type"] || "unknown"}`
    );

    // Stream the request body directly to the backend (supports multipart/form-data)
    const backendResponse = await fetch(backendTarget, {
      method: "POST",
      headers: forwardHeaders,
      body: req.body,
      // @ts-expect-error - duplex is required for streaming body in Node.js 18+
      duplex: "half",
    });

    // Read the backend response
    const responseText = await backendResponse.text();

    console.log(
      `[api-proxy/upload] Backend responded: ${backendResponse.status}`,
      responseText.substring(0, 200)
    );

    // Return the response with CORS headers
    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  } catch (error) {
    console.error("[api-proxy/upload] Proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Upload proxy error: " + String(error),
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
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
