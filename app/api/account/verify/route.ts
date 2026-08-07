import { NextRequest, NextResponse } from "next/server";
import { verifyLoginToken, createCustomerSessionToken, CUSTOMER_SESSION_COOKIE, customerSessionCookieOptions } from "@/lib/customerAuth";

export const runtime = "nodejs";

// "en" is unprefixed under next-intl's "as-needed" locale prefix strategy
// (see i18n/routing.ts) — every other locale needs its own /<locale> prefix.
function localePath(locale: string, path: string): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

// Opened from the magic-link email — verifies the short-lived login token,
// mints a real (long-lived) customer session, and redirects into the portal.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? undefined;
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const email = await verifyLoginToken(token);

  const url = req.nextUrl.clone();
  url.search = "";

  if (!email) {
    url.pathname = localePath(locale, "/account/login");
    url.searchParams.set("error", "expired");
    return NextResponse.redirect(url);
  }

  const sessionToken = await createCustomerSessionToken(email);
  url.pathname = localePath(locale, "/account");
  const res = NextResponse.redirect(url);
  res.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, customerSessionCookieOptions());
  return res;
}
