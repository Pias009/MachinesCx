// ---------------------------------------------------------------------------
// Shared inquiry-creation path — used by both the site's inquiry form
// (app/api/inquiries/route.ts) and the ASHA chat agent (app/api/chat/route.ts),
// so every inquiry lands in the same Mongo collection, the same admin panel
// list, and triggers the same admin notification email regardless of source.
// ---------------------------------------------------------------------------
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine, type InquiryPart, type InquiryType } from "@/models/Inquiry";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout, infoBlock, messageBlock, dataTable } from "@/lib/emailTemplate";

export interface CreateInquiryInput {
  inquiryType?: InquiryType;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  images?: string[];
  machines?: InquiryMachine[];
  parts?: InquiryPart[];
  source?: string;
  flow?: string;
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

  // Validate based on type. "talk-to-engineer" can go out with no machine
  // attached — the visitor may just want to describe a general request —
  // so it isn't required there the way it is for "direct" (a machine is
  // the whole point of that flow).
  if (inquiryType === "direct") {
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
    images: body.images ?? [],
    machines: body.machines ?? [],
    parts: body.parts ?? [],
    status: "new",
    source: body.source ?? "direct",
    flow: body.flow ?? "",
  });

  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (notifyTo && process.env.RESEND_API_KEY) {
    const typeLabel = TYPE_LABELS[inquiryType];

    const infoRows = [
      { label: "Name", value: escapeHtml(body.name) + (body.company ? ` — ${escapeHtml(body.company)}` : "") },
      { label: "Email", value: escapeHtml(body.email) },
      ...(body.phone ? [{ label: "Phone", value: escapeHtml(body.phone) }] : []),
      ...(body.country ? [{ label: "Country", value: escapeHtml(body.country) }] : []),
      { label: "Type", value: `${typeLabel} · Source: ${(body.source ?? "direct").toUpperCase()}` },
    ];

    const bodyParts = [infoBlock(infoRows)];

    if (body.machines && body.machines.length > 0) {
      bodyParts.push(`<p style="margin:0 0 4px; font-weight:700;">Machines</p>` + dataTable(
        ["Machine", "Model", "Qty"],
        body.machines.map(m => [escapeHtml(m.name), escapeHtml(m.model), String(m.qty)]),
      ));
    }
    if (body.parts && body.parts.length > 0) {
      bodyParts.push(`<p style="margin:0 0 4px; font-weight:700;">Parts</p>` + dataTable(
        ["Part", "Machine", "Qty"],
        body.parts.map(p => [escapeHtml(p.name), escapeHtml(p.machine), String(p.quantity)]),
      ));
    }
    if (body.message) {
      bodyParts.push(messageBlock(escapeHtml(body.message).replace(/\n/g, "<br/>")));
    }
    if (body.images && body.images.length > 0) {
      bodyParts.push(`<p style="margin:14px 0 0; font-size:13px; color:#5b6b68;"><strong>${body.images.length} attached photo${body.images.length > 1 ? "s" : ""}</strong> — view in the admin panel.</p>`);
    }
    bodyParts.push(`<p style="margin:18px 0 0; font-size:12px; color:#5b6b68;">View and reply from the admin panel.</p>`);

    try {
      await sendEmail({
        to: notifyTo,
        replyTo: body.email,
        subject: `[${typeLabel}] New inquiry from ${body.name}${body.company ? ` (${body.company})` : ""}`,
        html: renderEmailLayout({
          preheader: `${typeLabel} from ${body.name}`,
          heading: `New ${typeLabel}`,
          bodyHtml: bodyParts.join(""),
        }),
      });
    } catch (e) {
      console.error("Failed to send inquiry notification email:", e);
    }
  }

  return inquiry;
}
