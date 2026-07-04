import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, ADMIN_PATH } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith(`/${ADMIN_PATH}`);
  const isAdminApi  = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

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

export const config = {
  matcher: ["/cx-ops-x7k9q2/:path*", "/api/admin/:path*"],
};
