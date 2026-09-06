import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { parseSessionToken, SESSION_COOKIE, ADMIN_PATH, MACHINE_MANAGER_SCHEMAS } from "@/lib/adminAuth";
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

    const user = await parseSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!user) {
      if (isAdminApi) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = `/${ADMIN_PATH}/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }

    const role = user.role;

    // ── RBAC Enforcement for Admin API routes ──
    if (isAdminApi) {
      // machine_manager: restricted from roles, settings, inquiries, analytics, and non-machine CMS mutations
      if (role === "machine_manager") {
        if (
          pathname.startsWith("/api/admin/roles") ||
          pathname.startsWith("/api/admin/settings") ||
          pathname.startsWith("/api/admin/inquiries") ||
          pathname.startsWith("/api/admin/analytics")
        ) {
          return NextResponse.json({ error: "forbidden: role 'machine_manager' does not have access to this resource" }, { status: 403 });
        }

        if (pathname.startsWith("/api/admin/data/")) {
          const section = pathname.split("/api/admin/data/")[1]?.split("/")[0] || "";
          if (section && !MACHINE_MANAGER_SCHEMAS.includes(section)) {
            return NextResponse.json({ error: "forbidden: role 'machine_manager' can only modify machinery catalog schemas" }, { status: 403 });
          }
        }
      }

      // content_editor: cannot manage roles or global settings
      if (role === "content_editor") {
        if (
          pathname.startsWith("/api/admin/roles") ||
          pathname.startsWith("/api/admin/settings")
        ) {
          return NextResponse.json({ error: "forbidden: role 'content_editor' cannot manage roles or settings" }, { status: 403 });
        }
      }

      // analytics_viewer: read-only access to inquiries and analytics, no CMS/roles/settings
      if (role === "analytics_viewer") {
        if (
          pathname.startsWith("/api/admin/roles") ||
          pathname.startsWith("/api/admin/settings") ||
          pathname.startsWith("/api/admin/upload") ||
          (pathname.startsWith("/api/admin/data/") && req.method !== "GET")
        ) {
          return NextResponse.json({ error: "forbidden: role 'analytics_viewer' cannot perform this action" }, { status: 403 });
        }
      }

      return NextResponse.next();
    }

    // ── RBAC Enforcement for Admin Page routes ──
    if (isAdminPage) {
      if (role === "machine_manager") {
        if (
          pathname.startsWith(`/${ADMIN_PATH}/settings`) ||
          pathname.startsWith(`/${ADMIN_PATH}/inquiries`) ||
          pathname.startsWith(`/${ADMIN_PATH}/analytics`)
        ) {
          const url = req.nextUrl.clone();
          url.pathname = `/${ADMIN_PATH}`;
          url.search = "";
          return NextResponse.redirect(url);
        }

        if (pathname.startsWith(`/${ADMIN_PATH}/s/`)) {
          const slug = pathname.split(`/${ADMIN_PATH}/s/`)[1]?.split("/")[0] || "";
          if (slug && !MACHINE_MANAGER_SCHEMAS.includes(slug)) {
            const url = req.nextUrl.clone();
            url.pathname = `/${ADMIN_PATH}/s/products`;
            url.search = "";
            return NextResponse.redirect(url);
          }
        }
      }

      if (role === "content_editor") {
        if (pathname.startsWith(`/${ADMIN_PATH}/settings`)) {
          const url = req.nextUrl.clone();
          url.pathname = `/${ADMIN_PATH}`;
          url.search = "";
          return NextResponse.redirect(url);
        }
      }

      if (role === "analytics_viewer") {
        if (
          pathname.startsWith(`/${ADMIN_PATH}/settings`) ||
          pathname.startsWith(`/${ADMIN_PATH}/s/`)
        ) {
          const url = req.nextUrl.clone();
          url.pathname = `/${ADMIN_PATH}/inquiries`;
          url.search = "";
          return NextResponse.redirect(url);
        }
      }

      return NextResponse.next();
    }
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
