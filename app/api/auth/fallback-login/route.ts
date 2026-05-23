import { buildServerApiUrl } from "@/lib/api/config";
import { encode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const COOKIE_CHUNK_SIZE = 4096 - 163;

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "revboostai-local-dev-auth-secret-change-me";

interface LoginResponse {
  user: {
    id: number | string;
    full_name: string;
    email: string;
    role: string;
  };
  access: string;
  refresh: string;
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<LoginResponse>;
  return (
    typeof data.access === "string" &&
    typeof data.refresh === "string" &&
    typeof data.user === "object" &&
    data.user !== null &&
    "id" in data.user &&
    typeof data.user.email === "string"
  );
}

function safeCallbackUrl(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function requestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto || request.nextUrl.protocol.replace(/:$/, "");

  return `${protocol === "http" ? "http" : "https"}://${host}`;
}

function expectedOrigin(request: NextRequest): string {
  if (!process.env.NEXTAUTH_URL) return requestOrigin(request);

  try {
    return new URL(process.env.NEXTAUTH_URL).origin;
  } catch {
    return requestOrigin(request);
  }
}

function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === expectedOrigin(request);
}

function shouldUseSecureCookies(request: NextRequest): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  return (
    process.env.NEXTAUTH_URL?.startsWith("https://") ||
    process.env.VERCEL === "1" ||
    forwardedProto === "https" ||
    request.nextUrl.protocol === "https:"
  );
}

function redirectToLogin(request: NextRequest, error: string): NextResponse {
  const loginUrl = new URL("/login", requestOrigin(request));
  loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl, { status: 303 });
}

function setSessionCookie(
  response: NextResponse,
  request: NextRequest,
  value: string
) {
  const secure = shouldUseSecureCookies(request);
  const cookieName = `${secure ? "__Secure-" : ""}next-auth.session-token`;
  const cookieOptions = {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };

  response.cookies.set(cookieName, "", { ...cookieOptions, maxAge: 0 });

  for (let index = 0; index < 5; index += 1) {
    response.cookies.set(`${cookieName}.${index}`, "", {
      ...cookieOptions,
      maxAge: 0,
    });
  }

  if (value.length <= COOKIE_CHUNK_SIZE) {
    response.cookies.set(cookieName, value, cookieOptions);
    return;
  }

  const chunkCount = Math.ceil(value.length / COOKIE_CHUNK_SIZE);
  for (let index = 0; index < chunkCount; index += 1) {
    response.cookies.set(
      `${cookieName}.${index}`,
      value.slice(index * COOKIE_CHUNK_SIZE, (index + 1) * COOKIE_CHUNK_SIZE),
      cookieOptions
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return redirectToLogin(request, "OriginMismatch");
    }

    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return redirectToLogin(request, "CredentialsSignin");
    }

    const loginResponse = await fetch(buildServerApiUrl("/api/auth/login/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      return redirectToLogin(request, "CredentialsSignin");
    }

    const data = (await loginResponse.json()) as unknown;
    if (!isLoginResponse(data)) {
      return redirectToLogin(request, "LoginResponse");
    }

    const token = await encode({
      maxAge: SESSION_MAX_AGE,
      secret: AUTH_SECRET,
      token: {
        id: String(data.user.id),
        name: data.user.full_name || data.user.email,
        email: data.user.email,
        role: data.user.role,
        accessToken: data.access,
        refreshToken: data.refresh,
      },
    });

    const redirectUrl = new URL(
      safeCallbackUrl(formData.get("callbackUrl")),
      requestOrigin(request)
    );
    const response = NextResponse.redirect(redirectUrl, { status: 303 });
    setSessionCookie(response, request, token);
    return response;
  } catch (error) {
    console.error("Fallback login failed:", error);
    return redirectToLogin(request, "BackendUnavailable");
  }
}

export function GET(request: NextRequest) {
  return redirectToLogin(request, "MethodNotAllowed");
}
