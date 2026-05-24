import { buildServerApiUrl } from "@/lib/api/config";
import { NextRequest, NextResponse } from "next/server";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ detail: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const backendUrl = buildServerApiUrl("/api/auth/register/");

    if (!/^https?:\/\//i.test(backendUrl)) {
      return errorResponse("Backend API URL is not configured", 500);
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await backendResponse.text();
    const contentType = backendResponse.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!backendResponse.ok) {
      return errorResponse(responseText || "Registration failed", backendResponse.status);
    }

    return NextResponse.json(
      { detail: responseText || "Registration completed" },
      { status: backendResponse.status }
    );
  } catch (error) {
    console.error("Registration proxy failed:", error);
    return errorResponse("Registration service unavailable", 502);
  }
}
