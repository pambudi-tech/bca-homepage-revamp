import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/preview-auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const LOGIN_PATHS = new Set(["/login", "/en/login", "/zh/login"]);

// Static files (public/ assets, manifest, etc.) — never run locale routing
// against these, next-intl's middleware rewrites/redirects unprefixed paths
// and that breaks plain asset requests (e.g. /assets/foo.svg -> 404).
const isStaticFile = (pathname: string) => /\.[^/]+$/.test(pathname);

export function proxy(request: NextRequest) {
  const password = process.env.PREVIEW_PASSWORD;
  const { pathname } = request.nextUrl;

  // Allow the social share thumbnail to be fetched without the gate,
  // so link previews (WhatsApp, X, Facebook) can load it.
  if (pathname === "/opengraph-bcacoid.png") {
    return NextResponse.next();
  }

  if (password && !LOGIN_PATHS.has(pathname)) {
    const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (cookie !== password) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
