import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine } from "@/models/Inquiry";
import { sendEmail } from "@/lib/resend";

export const runtime = "nodejs";

interface SubmitBody {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  machines: InquiryMachine[];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function POST(req: NextRequest) {
  let body: SubmitBody;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!Array.isArray(body.machines) || body.machines.length === 0) {
    return NextResponse.json({ error: "Select at least one machine" }, { status: 400 });
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
  });

  // Notify the admin — best-effort; the inquiry is already saved either way,
  // so a Resend outage never loses a customer's submission.
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
          ${escapeHtml(body.email)}${body.phone ? ` · ${escapeHtml(body.phone)}` : ""}${body.country ? ` · ${escapeHtml(body.country)}` : ""}</p>
          <table style="border-collapse:collapse">${machineRows}</table>
          ${body.message ? `<p><strong>Message:</strong><br/>${escapeHtml(body.message).replace(/\n/g, "<br/>")}</p>` : ""}
          <p style="color:#888;font-size:12px">View and reply from the admin panel.</p>
        `,
      });
    } catch (e) {
      console.error("Failed to send inquiry notification email:", e);
    }
  }

  return NextResponse.json({ ok: true, id: inquiry._id });
}
