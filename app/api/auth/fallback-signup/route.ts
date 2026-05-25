import { buildServerApiUrl } from "@/lib/api/config";
import { encode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const COOKIE_CHUNK_SIZE = 4096 - 163;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "revboostai-local-dev-auth-secret-change-me";

interface RegisterResponse {
  user: {
    id: number | string;
    full_name: string;
    email: string;
    role: string;
  };
  access: string;
  refresh: string;
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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

function redirectToSignup(request: NextRequest, error: string): NextResponse {
  const signupUrl = new URL("/signup", requestOrigin(request));
  signupUrl.searchParams.set("error", error);
  return NextResponse.redirect(signupUrl, { status: 303 });
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
      return redirectToSignup(request, "OriginMismatch");
    }

    const formData = await request.formData();
    const fullName = formString(formData, "name");
    const email = formString(formData, "email");
    const password = formString(formData, "password");
    const confirmPassword = formString(formData, "confirmPassword");

    if (!fullName || !EMAIL_PATTERN.test(email) || password.length < 8) {
      return redirectToSignup(request, "Validation");
    }

    if (password !== confirmPassword) {
      return redirectToSignup(request, "PasswordMismatch");
    }

    const registerResponse = await fetch(
      buildServerApiUrl("/api/auth/register/"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      }
    );

    if (!registerResponse.ok) {
      return redirectToSignup(request, "Register");
    }

    const data = (await registerResponse.json()) as RegisterResponse;
    await fetch(buildServerApiUrl("/api/auth/send-email-verification-otp/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    const token = await encode({
      maxAge: SESSION_MAX_AGE,
      secret: AUTH_SECRET,
      token: {
        id: String(data.user.id),
        name: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        accessToken: data.access,
        refreshToken: data.refresh,
      },
    });

    const verifyEmailUrl = new URL("/verify-email", requestOrigin(request));
    verifyEmailUrl.searchParams.set("email", email);

    const response = NextResponse.redirect(verifyEmailUrl, { status: 303 });
    setSessionCookie(response, request, token);
    return response;
  } catch (error) {
    console.error("Fallback signup failed:", error);
    return redirectToSignup(request, "BackendUnavailable");
  }
}

export function GET(request: NextRequest) {
  return redirectToSignup(request, "MethodNotAllowed");
}
