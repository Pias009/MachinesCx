// Shared branded HTML shell for every outbound email (inquiry replies,
// admin notifications, lead alerts, account emails). Table-based layout
// with inline styles only — the only markup that renders consistently
// across mail clients (Gmail, Outlook, Apple Mail all strip <style> tags
// or ignore modern CSS).
const LOGO_URL = "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1785928039/cx-machinery/email/brand-logo.jpg";
const BRAND_TEAL = "#2bbfb3";
const INK = "#16211f";
const INK_DIM = "#5b6b68";
const BORDER = "#e7edec";

export interface EmailLayoutOptions {
  /** Hidden preview text shown next to the subject line in inbox lists. */
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function renderEmailLayout({ preheader, heading, bodyHtml, ctaLabel, ctaUrl }: EmailLayoutOptions): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; padding:0; background:#f4f6f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    ${preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f6; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid ${BORDER};">
            <tr>
              <td style="background:${BRAND_TEAL}; padding:20px 32px;">
                <img src="${LOGO_URL}" alt="Ashal Innomach" height="30" style="display:block; height:30px; width:auto; border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 18px; font-size:19px; line-height:1.35; color:${INK};">${heading}</h1>
                <div style="font-size:15px; line-height:1.65; color:${INK};">${bodyHtml}</div>
                ${ctaLabel && ctaUrl ? `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;">
                  <tr>
                    <td style="border-radius:9px; background:${BRAND_TEAL};">
                      <a href="${ctaUrl}" style="display:inline-block; padding:12px 22px; font-size:14px; font-weight:700; color:#06110f; text-decoration:none;">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px; border-top:1px solid ${BORDER}; background:#fafbfb;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:${INK_DIM};">Ashal Innomach — Blown Film, Bag Making &amp; Recycling Machinery</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** A label/value list — sender info, visitor context, etc. */
export function infoBlock(rows: { label: string; value: string }[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin:2px 0 18px; font-size:14px;">
    ${rows.map(r => `<tr><td style="padding:3px 12px 3px 0; color:${INK_DIM}; white-space:nowrap; vertical-align:top;">${r.label}</td><td style="padding:3px 0; color:${INK}; font-weight:600;">${r.value}</td></tr>`).join("")}
  </table>`;
}

/** A highlighted quoted-message block — the customer/admin's free text, set apart from the surrounding copy. */
export function messageBlock(html: string): string {
  return `<div style="margin-top:6px; padding:14px 16px; background:#f4f6f6; border-left:3px solid ${BRAND_TEAL}; border-radius:6px; font-size:14px; line-height:1.6; color:${INK};">${html}</div>`;
}

/** A simple data table — machines/parts on an inquiry. */
export function dataTable(headers: string[], rows: string[][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin:14px 0; border-collapse:collapse; font-size:13px;">
    <tr>${headers.map(h => `<th style="text-align:left; padding:6px 10px 6px 0; color:${INK_DIM}; border-bottom:1px solid ${BORDER}; font-weight:600;">${h}</th>`).join("")}</tr>
    ${rows.map(r => `<tr>${r.map(c => `<td style="padding:6px 10px 6px 0; border-bottom:1px solid ${BORDER}; color:${INK};">${c}</td>`).join("")}</tr>`).join("")}
  </table>`;
}
