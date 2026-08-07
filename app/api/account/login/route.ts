import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { createLoginToken } from "@/lib/customerAuth";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCALES = ["en", "ar", "hi"];

// Public — requests a no-password magic-link login for the customer
// portal. Always returns the same response whether or not the email has
// any inquiries on file, so this can't be used to enumerate customers;
// the email itself is only actually sent when there's something to show.
export async function POST(req: NextRequest) {
  let body: { email?: string; locale?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); }

  const email = body.email?.trim().toLowerCase();
  const locale = LOCALES.includes(body.locale ?? "") ? body.locale! : "en";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  await connectDB();
  // Case-insensitive: new inquiries store a lowercased email (see
  // lib/inquiries.ts), but older records may predate that normalization.
  const hasInquiries = await Inquiry.exists({ email }).collation({ locale: "en", strength: 2 });

  if (hasInquiries) {
    try {
      const token = await createLoginToken(email);
      const verifyUrl = new URL(
        `/api/account/verify?token=${encodeURIComponent(token)}&locale=${locale}`,
        req.nextUrl.origin,
      ).toString();
      await sendEmail({
        to: email,
        subject: "Your Ashal Innomach account login link",
        html: renderEmailLayout({
          preheader: "Click to view your inquiries and replies",
          heading: "Log in to your account",
          bodyHtml: `
            <p style="margin:0 0 8px;">Click below to view your inquiry history and replies from Ashal Innomach.</p>
            <p style="margin:0; font-size:13px; color:#5b6b68;">This link expires in 20 minutes. If you didn't request this, you can safely ignore this email.</p>
          `,
          ctaLabel: "View my inquiries",
          ctaUrl: verifyUrl,
        }),
      });
    } catch (e) {
      console.error("account login: failed to send magic link:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
