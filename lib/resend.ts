import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";

const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set — add it to .env.local (see the comment above it for how to get one)");
  return new Resend(key);
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

/** Reads a site-local image path (/machines/... or /uploads/...) into an
 *  attachment buffer. Silently skips paths that aren't local files
 *  (e.g. remote URLs) or that fail to read, rather than failing the whole send. */
export async function loadLocalImageAttachments(imagePaths: string[]): Promise<EmailAttachment[]> {
  const out: EmailAttachment[] = [];
  for (const p of imagePaths) {
    if (!p || !p.startsWith("/")) continue;
    try {
      const abs = path.join(process.cwd(), "public", p);
      const content = await fs.readFile(abs);
      out.push({ filename: path.basename(p), content });
    } catch {
      // image missing on disk — skip rather than fail the whole email
    }
  }
  return out;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}) {
  const resend = client();
  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    attachments: opts.attachments,
  });
  if (error) throw new Error(error.message || "Failed to send email");
}
