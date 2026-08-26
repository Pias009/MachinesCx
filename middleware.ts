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
    // login stays reachable without a session; the email-change confirm
    // link is opened from an email client (often a different browser/
    // session entirely) and is authenticated by its own signed token, not
    // the admin cookie — so it also has to bypass the session check here.
    if (
      pathname === `/${ADMIN_PATH}/login` ||
      pathname === `/${ADMIN_PATH}/invite` ||
      pathname === "/api/admin/login" ||
      pathname === "/api/admin/invite/verify" ||
      pathname === "/api/admin/settings/email/confirm"
    ) {
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
  // run on the admin console + its API, on /api/admin/* specifically (the
  // session check above is meaningless if this middleware never executes
  // for those routes — the general "/((?!api|...))" pattern below
  // excludes ALL of /api, admin included, so it has to be listed
  // explicitly), and on every public page route (handled by next-intl,
  // which skips the rest of /api, static files, and Next.js internals)
  matcher: ["/cx-ops-x7k9q2/:path*", "/api/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
