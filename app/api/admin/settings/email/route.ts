import { NextRequest, NextResponse } from "next/server";
import { requestEmailChange, getAdminEmail } from "@/lib/adminCredentials";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";

export const runtime = "nodejs";

// Auth (valid admin session) is enforced by middleware. Requires the
// current password too (same reasoning as the password-change route),
// and doesn't change the login email immediately — it emails a
// confirmation link to the NEW address first. Only the person who
// actually controls that inbox can complete the change, so a typo or a
// hijacked session can't quietly redirect admin access to an address
// the real admin doesn't own.
export async function GET() {
  const email = await getAdminEmail();
  return NextResponse.json({ email });
}

export async function POST(req: NextRequest) {
  let body: { currentPassword?: string; newEmail?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const { currentPassword, newEmail } = body;
  if (!currentPassword || !newEmail) {
    return NextResponse.json({ error: "Current password and new email are required" }, { status: 400 });
  }

  const result = await requestEmailChange(currentPassword, newEmail);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const confirmUrl = new URL(`/api/admin/settings/email/confirm?token=${result.token}`, req.nextUrl.origin).toString();

  try {
    await sendEmail({
      to: newEmail,
      subject: "Confirm your new Ashal Innomach admin email",
      html: renderEmailLayout({
        preheader: "Confirm this address to finish changing your admin sign-in email",
        heading: "Confirm your new admin email",
        bodyHtml: `
          <p style="margin:0 0 8px;">You (or someone with admin access) requested to change the sign-in email for the Ashal Innomach admin panel to this address.</p>
          <p style="margin:0; font-size:13px; color:#5b6b68;">This link expires in 30 minutes. If you didn't request this, ignore this email — your admin login is unaffected until this link is used.</p>
        `,
        ctaLabel: "Confirm this email change",
        ctaUrl: confirmUrl,
      }),
    });
  } catch (e) {
    console.error("Failed to send admin email-change confirmation:", e);
    return NextResponse.json({ error: "Couldn't send the confirmation email — check RESEND_API_KEY / RESEND_FROM_EMAIL configuration" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
