import { buildServerApiUrl } from "@/lib/api/config";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "revboostai-local-dev-auth-secret-change-me";

const PROTECTED_PATHS = ["/dashboard", "/onboarding"];
const AUTH_PATHS = ["/login", "/signup"];
const ONBOARDING_PATHS = ["/onboarding"];
const DASHBOARD_PATHS = ["/dashboard"];

function startsWithPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function loginUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return url;
}

async function fetchProfileCompleted(accessToken: unknown) {
  if (typeof accessToken !== "string" || !accessToken) {
    return undefined;
  }

  try {
    const response = await fetch(buildServerApiUrl("/api/auth/profile/"), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return undefined;
    }

    const profile = (await response.json()) as {
      is_profile_completed?: unknown;
    };

    return typeof profile.is_profile_completed === "boolean"
      ? profile.is_profile_completed
      : undefined;
  } catch {
    return undefined;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: AUTH_SECRET });
  const isAuthenticated = Boolean(token?.accessToken);
  let isProfileCompleted =
    typeof token?.isProfileCompleted === "boolean"
      ? token.isProfileCompleted
      : undefined;

  if (startsWithPath(pathname, PROTECTED_PATHS) && !isAuthenticated) {
    return NextResponse.redirect(loginUrl(request));
  }

  if (isAuthenticated && isProfileCompleted === undefined) {
    isProfileCompleted = await fetchProfileCompleted(token?.accessToken);
  }

  if (
    isAuthenticated &&
    isProfileCompleted === false &&
    startsWithPath(pathname, DASHBOARD_PATHS)
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (
    isAuthenticated &&
    isProfileCompleted === true &&
    startsWithPath(pathname, ONBOARDING_PATHS)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (startsWithPath(pathname, AUTH_PATHS) && isAuthenticated) {
    return NextResponse.redirect(
      new URL(isProfileCompleted === false ? "/onboarding" : "/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"],
};
