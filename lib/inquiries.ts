// ---------------------------------------------------------------------------
// Shared inquiry-creation path — used by both the site's inquiry form
// (app/api/inquiries/route.ts) and the ASHA chat agent (app/api/chat/route.ts),
// so every inquiry lands in the same Mongo collection, the same admin panel
// list, and triggers the same admin notification email regardless of source.
// ---------------------------------------------------------------------------
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine } from "@/models/Inquiry";
import { sendEmail } from "@/lib/resend";

export interface CreateInquiryInput {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  machines: InquiryMachine[];
  source?: string;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Validates, persists, and (best-effort) notifies the admin of a new inquiry.
 *  Returns the created document. Throws only on validation failure — email
 *  delivery failures are swallowed since the inquiry is already saved. */
export async function createInquiry(body: CreateInquiryInput) {
  if (!body.name?.trim() || !body.email?.trim()) {
    throw new Error("Name and email are required");
  }
  if (!Array.isArray(body.machines) || body.machines.length === 0) {
    throw new Error("Select at least one machine");
  }

  await connectDB();
  const inquiry = await Inquiry.create({
    name: body.name.trim(),
    company: body.company?.trim() ?? "",
    email: body.email.trim(),
    phone: body.phone?.trim() ?? "",
    country: body.country?.trim() ?? "",
    message: body.message?.trim() ?? "",
    machines: body.machines,
    status: "new",
    source: body.source ?? "direct",
  });

  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (notifyTo && process.env.RESEND_API_KEY) {
    const machineRows = body.machines.map(m =>
      `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(m.name)}</td><td style="padding:4px 12px">${escapeHtml(m.model)}</td><td style="padding:4px">${m.qty}</td></tr>`
    ).join("");
    try {
      await sendEmail({
        to: notifyTo,
        replyTo: body.email,
        subject: `New inquiry from ${body.name}${body.company ? ` (${body.company})` : ""}`,
        html: `
          <h2>New machine inquiry</h2>
          <p><strong>${escapeHtml(body.name)}</strong>${body.company ? ` — ${escapeHtml(body.company)}` : ""}<br/>
          ${escapeHtml(body.email)}${body.phone ? ` · ${escapeHtml(body.phone)}` : ""}${body.country ? ` · ${escapeHtml(body.country)}` : ""}<br/>
          <span style="color:#888;font-size:13px">Source: ${(body.source ?? "direct").toUpperCase()}</span></p>
          <table style="border-collapse:collapse">${machineRows}</table>
          ${body.message ? `<p><strong>Message:</strong><br/>${escapeHtml(body.message).replace(/\n/g, "<br/>")}</p>` : ""}
          <p style="color:#888;font-size:12px">View and reply from the admin panel.</p>
        `,
      });
    } catch (e) {
      console.error("Failed to send inquiry notification email:", e);
    }
  }

  return inquiry;
}
