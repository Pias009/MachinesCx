import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { verifySessionToken, SESSION_COOKIE, ADMIN_PATH } from "@/lib/adminAuth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith(`/${ADMIN_PATH}`);
  const isAdminApi  = pathname.startsWith("/api/admin");

  // admin console + its API sit outside the locale tree — untranslated,
  // gated by session cookie instead of running through next-intl at all
  if (isAdminPage || isAdminApi) {
    // login endpoints stay reachable
    if (pathname === `/${ADMIN_PATH}/login` || pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (ok) return NextResponse.next();

    if (isAdminApi) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = `/${ADMIN_PATH}/login`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // every other page-rendering route resolves its locale (en/ar/hi)
  return intlMiddleware(req);
}

export const config = {
  // run on the admin console + its API (handled above) and on every public
  // page route (handled by next-intl) — but skip API routes, static files,
  // and Next.js internals, none of which render localized HTML
  matcher: ["/cx-ops-x7k9q2/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
