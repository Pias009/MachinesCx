"use client";

import { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { LogOut, Wrench, ClipboardList, Package, CheckCircle2, Clock, Inbox } from "lucide-react";

interface InquiryMachine { name: string; model: string; qty: number; notes: string; }
interface InquiryPart { name: string; machine: string; quantity: number; notes: string; }
interface InquiryReply { message: string; sentAt: string; }
interface AccountInquiry {
  _id: string;
  inquiryType: "talk-to-engineer" | "direct" | "parts";
  machines: InquiryMachine[];
  parts: InquiryPart[];
  message: string;
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  createdAt: string;
}

const TYPE_META: Record<AccountInquiry["inquiryType"], { label: string; icon: typeof Wrench }> = {
  "talk-to-engineer": { label: "Talk to Engineer", icon: Wrench },
  direct:             { label: "Direct Inquiry",   icon: ClipboardList },
  parts:              { label: "Part Inquiry",     icon: Package },
};

// Customer-facing framing — the admin panel's internal "new/read/replied"
// pipeline states, worded for someone checking on their own request.
const STATUS_META: Record<AccountInquiry["status"], { label: string; color: string }> = {
  new:     { label: "Received",   color: "var(--ink-35)" },
  read:    { label: "In review",  color: "#f5c451" },
  replied: { label: "Replied",    color: "var(--brand-teal)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<{ email: string; name: string; inquiries: AccountInquiry[] } | null>(null);
  const [notAuthed, setNotAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/account/me")
      .then(async r => {
        if (r.status === 401) { if (alive) setNotAuthed(true); return; }
        if (!r.ok) return;
        const j = await r.json();
        if (alive) setData(j);
      })
      .catch(() => { if (alive) setNotAuthed(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (notAuthed) router.replace("/account/login");
  }, [notAuthed, router]);

  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    router.replace("/account/login");
  }

  if (notAuthed) return null;

  return (
    <div className="acc-dash">
      <div className="acc-dash__inner">
        <div className="acc-dash__head">
          <div>
            <div className="acc-dash__eyebrow">Your account</div>
            <h1 className="acc-dash__title">{data?.name ? `Welcome back, ${data.name}` : "Your inquiries"}</h1>
            {data?.email && <p className="acc-dash__email">{data.email}</p>}
          </div>
          <button onClick={logout} className="acc-dash__logout"><LogOut size={14} /> Log out</button>
        </div>

        <div className="acc-dash__actions">
          <Link href="/inquiries" className="acc-dash__cta">Submit a new inquiry</Link>
        </div>

        {!data ? (
          <div className="acc-dash__skel" />
        ) : data.inquiries.length === 0 ? (
          <div className="acc-empty">
            <Inbox size={26} />
            <p>No inquiries on file yet.</p>
          </div>
        ) : (
          <div className="acc-list">
            {data.inquiries.map(inq => {
              const meta = TYPE_META[inq.inquiryType] ?? TYPE_META.direct;
              const Icon = meta.icon;
              const statusMeta = STATUS_META[inq.status] ?? STATUS_META.new;
              return (
                <div key={inq._id} className="acc-item">
                  <div className="acc-item__head">
                    <span className="acc-item__type"><Icon size={13} /> {meta.label}</span>
                    <span className="acc-item__status" style={{ color: statusMeta.color }}>
                      {inq.status === "replied" ? <CheckCircle2 size={13} /> : <Clock size={13} />} {statusMeta.label}
                    </span>
                  </div>

                  <div className="acc-item__summary">
                    {inq.inquiryType === "parts"
                      ? inq.parts.map(p => `${p.name} × ${p.quantity}`).join(", ") || "No parts listed"
                      : inq.machines.map(m => `${m.name}${m.qty > 1 ? ` × ${m.qty}` : ""}`).join(", ") || "No machines listed"}
                  </div>

                  {inq.message && <p className="acc-item__message">&quot;{inq.message}&quot;</p>}

                  <div className="acc-item__date">Submitted {formatDate(inq.createdAt)}</div>

                  {inq.replies.length > 0 && (
                    <div className="acc-item__replies">
                      {inq.replies.map((r, i) => (
                        <div key={i} className="acc-reply">
                          <div className="acc-reply__label">Reply from Ashal Innomech · {formatDate(r.sentAt)}</div>
                          <p className="acc-reply__text">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .acc-dash { min-height: 100vh; background: var(--bg-base, var(--bg-surface)); padding: 130px 1.2rem 3rem; }
        .acc-dash__inner { max-width: 680px; margin: 0 auto; font-family: var(--ff-body), system-ui, sans-serif; }
        .acc-dash__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem; }
        .acc-dash__eyebrow { font-family: var(--ff-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brand-teal); margin-bottom: 0.4rem; }
        .acc-dash__title { font-family: var(--ff-display); font-size: clamp(1.6rem, 4vw, 2.2rem); color: var(--ink); margin: 0; }
        .acc-dash__email { font-size: 0.85rem; color: var(--ink-35); margin: 0.3rem 0 0; }
        .acc-dash__logout {
          display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
          padding: 0.5rem 0.85rem; border-radius: 8px; cursor: pointer;
          background: var(--bg-raise); border: 1px solid var(--bg-line); color: var(--ink-35);
          font-family: inherit; font-size: 0.8rem; font-weight: 600;
          transition: border-color 0.15s, color 0.15s;
        }
        .acc-dash__logout:hover { border-color: var(--brand-teal); color: var(--brand-teal); }

        .acc-dash__actions { margin-bottom: 2rem; }
        .acc-dash__cta {
          display: inline-block; padding: 0.65rem 1.1rem; border-radius: 10px;
          background: var(--brand-teal); color: #06110f; text-decoration: none;
          font-size: 0.88rem; font-weight: 700;
        }
        .acc-dash__cta:hover { opacity: 0.88; }

        .acc-dash__skel { height: 200px; border-radius: 14px; background: var(--bg-surface); border: 1px solid var(--bg-line); }
        .acc-empty {
          display: flex; flex-direction: column; align-items: center; gap: 0.7rem;
          padding: 3rem 1rem; text-align: center; color: var(--ink-35);
          background: var(--bg-surface); border: 1px solid var(--bg-line); border-radius: 14px;
        }

        .acc-list { display: flex; flex-direction: column; gap: 1rem; }
        .acc-item { background: var(--bg-surface); border: 1px solid var(--bg-line); border-radius: 14px; padding: 1.2rem 1.3rem; }
        .acc-item__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.6rem; }
        .acc-item__type { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 700; color: var(--brand-teal); }
        .acc-item__status { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; }
        .acc-item__summary { font-size: 0.95rem; font-weight: 700; color: var(--ink); margin-bottom: 0.4rem; }
        .acc-item__message { font-size: 0.85rem; color: var(--ink-35); font-style: italic; margin: 0 0 0.6rem; line-height: 1.5; }
        .acc-item__date { font-size: 0.75rem; color: var(--ink-35); }

        .acc-item__replies { margin-top: 0.9rem; padding-top: 0.9rem; border-top: 1px solid var(--bg-line); display: flex; flex-direction: column; gap: 0.7rem; }
        .acc-reply { background: rgba(43,191,179,0.06); border-radius: 10px; padding: 0.75rem 0.9rem; }
        .acc-reply__label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--brand-teal); margin-bottom: 0.35rem; }
        .acc-reply__text { font-size: 0.85rem; color: var(--ink-60); line-height: 1.6; margin: 0; white-space: pre-wrap; }
      `}</style>
    </div>
  );
}
