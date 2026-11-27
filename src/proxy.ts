import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CLERK_URLS, isClerkServerConfigured } from "@/lib/clerk-config";

const PUBLIC_ROUTE_PREFIXES = ["/sign-in", "/sign-up", "/api/health"] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Route matcher eksplisit tanpa menggunakan createRouteMatcher yang deprecated di @clerk/nextjs v7.
 * Public routes: /, /sign-in(.*), /sign-up(.*), /api/health
 * Protected routes: /dashboard(.*) dan seluruh /api/(.*) kecuali /api/health
 */
function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return PUBLIC_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

function isProtectedDashboardRoute(pathname: string): boolean {
  return matchesPrefix(pathname, "/dashboard");
}

function isProtectedApiRoute(pathname: string): boolean {
  return matchesPrefix(pathname, "/api") && !matchesPrefix(pathname, "/api/health");
}

const clerkProxy = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) {
    return;
  }

  if (isProtectedApiRoute(pathname)) {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Sesi login diperlukan untuk mengakses API ini." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
    return;
  }

  if (isProtectedDashboardRoute(pathname)) {
    await auth.protect();
  }
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = req.nextUrl;

  if (!isClerkServerConfigured()) {
    if (isProtectedApiRoute(pathname)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          reason: "clerk_not_configured",
          message:
            "Autentikasi Clerk belum dikonfigurasi. Isi NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY dan CLERK_SECRET_KEY di .env.local.",
        },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (isProtectedDashboardRoute(pathname)) {
      const signInUrl = new URL(CLERK_URLS.signInUrl, req.url);
      signInUrl.searchParams.set("redirect_url", `${pathname}${search}`);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }

  return clerkProxy(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals & static assets unless matched in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API and tRPC routes
    "/(api|trpc)(.*)",
  ],
};
