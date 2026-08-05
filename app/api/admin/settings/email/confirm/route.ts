import { NextRequest, NextResponse } from "next/server";
import { confirmEmailChange } from "@/lib/adminCredentials";
import { ADMIN_PATH } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Reachable without an admin session (see middleware.ts) — the token in
// the URL, mailed only to the new address, is the credential here. Renders
// a small standalone HTML page rather than JSON since a human opens this
// link directly from their inbox, not the app.
function page(title: string, message: string, ok: boolean) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: system-ui, sans-serif; background: #05080a; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; padding: 1.5rem; }
      .card { max-width: 420px; text-align: center; }
      h1 { font-size: 1.4rem; color: ${ok ? "#2bbfb3" : "#ff6b7d"}; margin-bottom: 0.75rem; }
      p { color: rgba(255,255,255,0.7); line-height: 1.6; }
      a { color: #2bbfb3; }
    </style></head>
    <body><div class="card"><h1>${title}</h1><p>${message}</p><p><a href="/${ADMIN_PATH}">Go to admin panel</a></p></div></body></html>`;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse(page("Missing token", "This confirmation link is incomplete.", false), { status: 400, headers: { "Content-Type": "text/html" } });
  }

  const result = await confirmEmailChange(token);
  if (!result.ok) {
    return new NextResponse(page("Couldn't confirm", result.error, false), { status: 400, headers: { "Content-Type": "text/html" } });
  }

  return new NextResponse(
    page("Email updated", `The admin sign-in email is now <strong>${result.email}</strong>.`, true),
    { headers: { "Content-Type": "text/html" } }
  );
}
