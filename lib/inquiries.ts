// ---------------------------------------------------------------------------
// Shared inquiry-creation path — used by both the site's inquiry form
// (app/api/inquiries/route.ts) and the ASHA chat agent (app/api/chat/route.ts),
// so every inquiry lands in the same Mongo collection, the same admin panel
// list, and triggers the same admin notification email regardless of source.
// ---------------------------------------------------------------------------
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine, type InquiryPart, type InquiryType } from "@/models/Inquiry";
import { sendEmail } from "@/lib/resend";

export interface CreateInquiryInput {
  inquiryType?: InquiryType;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  machines?: InquiryMachine[];
  parts?: InquiryPart[];
  source?: string;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

const TYPE_LABELS: Record<InquiryType, string> = {
  "talk-to-engineer": "Talk to Engineer",
  "direct": "Direct Inquiry",
  "parts": "Part Inquiry",
};

/** Validates, persists, and (best-effort) notifies the admin of a new inquiry.
 *  Returns the created document. Throws only on validation failure — email
 *  delivery failures are swallowed since the inquiry is already saved. */
export async function createInquiry(body: CreateInquiryInput) {
  if (!body.name?.trim() || !body.email?.trim()) {
    throw new Error("Name and email are required");
  }

  const inquiryType = body.inquiryType ?? "direct";

  // Validate based on type
  if (inquiryType === "talk-to-engineer" || inquiryType === "direct") {
    if (!Array.isArray(body.machines) || body.machines.length === 0) {
      throw new Error("Select at least one machine");
    }
  }
  if (inquiryType === "parts") {
    if (!Array.isArray(body.parts) || body.parts.length === 0) {
      throw new Error("Add at least one part");
    }
  }

  await connectDB();
  const inquiry = await Inquiry.create({
    inquiryType,
    name: body.name.trim(),
    company: body.company?.trim() ?? "",
    email: body.email.trim(),
    phone: body.phone?.trim() ?? "",
    country: body.country?.trim() ?? "",
    message: body.message?.trim() ?? "",
    machines: body.machines ?? [],
    parts: body.parts ?? [],
    status: "new",
    source: body.source ?? "direct",
  });

  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (notifyTo && process.env.RESEND_API_KEY) {
    const typeLabel = TYPE_LABELS[inquiryType];
    let machineRows = "";
    let partRows = "";

    if (body.machines && body.machines.length > 0) {
      machineRows = body.machines.map(m =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(m.name)}</td><td style="padding:4px 12px">${escapeHtml(m.model)}</td><td style="padding:4px">${m.qty}</td></tr>`
      ).join("");
    }

    if (body.parts && body.parts.length > 0) {
      partRows = body.parts.map(p =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(p.name)}</td><td style="padding:4px 12px">${escapeHtml(p.machine)}</td><td style="padding:4px">${p.quantity}</td></tr>`
      ).join("");
    }

    try {
      await sendEmail({
        to: notifyTo,
        replyTo: body.email,
        subject: `[${typeLabel}] New inquiry from ${body.name}${body.company ? ` (${body.company})` : ""}`,
        html: `
          <h2>New ${typeLabel}</h2>
          <p><strong>${escapeHtml(body.name)}</strong>${body.company ? ` — ${escapeHtml(body.company)}` : ""}<br/>
          ${escapeHtml(body.email)}${body.phone ? ` · ${escapeHtml(body.phone)}` : ""}${body.country ? ` · ${escapeHtml(body.country)}` : ""}<br/>
          <span style="color:#888;font-size:13px">Type: ${typeLabel} · Source: ${(body.source ?? "direct").toUpperCase()}</span></p>
          ${machineRows ? `<h3>Machines</h3><table style="border-collapse:collapse">${machineRows}</table>` : ""}
          ${partRows ? `<h3>Parts</h3><table style="border-collapse:collapse">${partRows}</table>` : ""}
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
