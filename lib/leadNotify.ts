// Fires earlier than the formal Inquiry email in lib/inquiries.ts (which
// only sends once the guided chat flow reaches qty/"done") — this fires as
// soon as a visitor gives ASHA their email, so the admin can jump in on an
// engaged visitor before they might abandon the flow partway through.
import { connectDB } from "@/lib/mongodb";
import { sendEmail } from "@/lib/resend";
import VisitorSession from "@/models/VisitorSession";
import { renderEmailLayout, infoBlock } from "@/lib/emailTemplate";
import { formatDuration } from "@/lib/format";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export interface LeadCapturedInput {
  sessionId: string;
  name?: string;
  email: string;
  machineName?: string;
}

/** Best-effort — never throws, so a failed notification never blocks the chat turn. */
export async function notifyLeadCaptured(input: LeadCapturedInput) {
  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!notifyTo || !process.env.RESEND_API_KEY) return;

  try {
    await connectDB();
    const visitor = await VisitorSession.findOne({ sessionId: input.sessionId }).lean();

    const infoRows = [
      { label: "Name", value: input.name ? escapeHtml(input.name) : "Unknown" },
      { label: "Email", value: escapeHtml(input.email) },
      ...(input.machineName ? [{ label: "Asking about", value: escapeHtml(input.machineName) }] : []),
      ...(visitor?.countryCode ? [{ label: "Country", value: escapeHtml(visitor.countryCode) }] : []),
      ...(visitor?.device ? [{ label: "Device", value: `${escapeHtml(visitor.device)} (${escapeHtml(visitor.browser ?? "")} / ${escapeHtml(visitor.os ?? "")})` }] : []),
      ...(visitor?.totalDurationMs ? [{ label: "Time on site", value: formatDuration(visitor.totalDurationMs) }] : []),
      ...(visitor?.landingPath ? [{ label: "Landed on", value: escapeHtml(visitor.landingPath) }] : []),
    ];

    await sendEmail({
      to: notifyTo,
      replyTo: input.email,
      subject: `[Lead] ${input.name ? escapeHtml(input.name) : "A visitor"} shared their email via ASHA chat`,
      html: renderEmailLayout({
        preheader: `${input.name ?? "A visitor"} (${input.email}) shared their email via ASHA`,
        heading: "New lead from ASHA chat",
        bodyHtml: infoBlock(infoRows) + `<p style="margin:14px 0 0; font-size:12px; color:#5b6b68;">This fires as soon as the visitor shares their email mid-chat — they may not have completed a formal inquiry yet. Full activity is in the admin panel's Analytics section.</p>`,
      }),
    });
  } catch (e) {
    console.error("Failed to send lead-captured notification email:", e);
  }
}
