"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import { familyBySlug, familyImages } from "@/lib/products";
import type { InquiryMachine, InquiryReply } from "@/models/Inquiry";

interface InquiryRow {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  machines: InquiryMachine[];
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  new: "#e11d48",
  read: "#f5c451",
  replied: "var(--brand-teal)",
};
const STATUS_LABEL: Record<string, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(d / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");

  async function load() {
    const res = await fetch("/api/admin/inquiries");
    const j = await res.json();
    setInquiries(j.inquiries ?? []);
  }

  useEffect(() => { load(); }, []);

  const selected = inquiries?.find(i => i._id === selectedId) ?? null;

  async function selectInquiry(inq: InquiryRow) {
    setSelectedId(inq._id);
    if (inq.status === "new") {
      await fetch(`/api/admin/inquiries/${inq._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      setInquiries(prev => prev?.map(i => i._id === inq._id ? { ...i, status: "read" } : i) ?? null);
    }
  }

  const filtered = inquiries?.filter(i => filter === "all" || i.status === filter) ?? [];

  return (
    <AdminShell>
      <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "2.4rem", color: "#fff", lineHeight: 1.05, margin: "0 0 0.5rem" }}>
        Inquiries
      </h1>
      <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(255,255,255,0.6)", margin: "0 0 2rem", maxWidth: "62ch", lineHeight: 1.6 }}>
        Every machine inquiry submitted from the site. Click one to read the full request and reply — your reply is emailed straight to the customer.
      </p>

      {!inquiries ? (
        <p style={{ fontFamily: "var(--ff-body)", color: "rgba(255,255,255,0.6)" }}>Loading…</p>
      ) : inquiries.length === 0 ? (
        <div style={{ borderRadius: 16, background: "#0d1a18", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>
            No inquiries yet — they'll show up here as soon as a customer submits the contact form.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.25rem", alignItems: "start" }}>
          {/* ── list ── */}
          <div style={{ borderRadius: 16, background: "#0d1a18", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "0.4rem", padding: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {(["all", "new", "read", "replied"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "0.4rem 0.75rem", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "var(--ff-body)", fontSize: "0.8rem", fontWeight: 600,
                  background: filter === f ? "var(--brand-teal)" : "rgba(255,255,255,0.06)",
                  color: filter === f ? "#04211e" : "rgba(255,255,255,0.65)",
                  textTransform: "capitalize",
                }}>{f}</button>
              ))}
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {filtered.map(inq => (
                <button key={inq._id} onClick={() => selectInquiry(inq)} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "1rem 1.1rem",
                  border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                  background: selectedId === inq._id ? "#122320" : "transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{inq.name}</span>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[inq.status], flexShrink: 0 }} />
                  </div>
                  <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.3rem" }}>
                    {inq.machines.map(m => m.name).join(", ")}
                  </div>
                  <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                    {timeAgo(inq.createdAt)}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: "1.5rem", fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                  No {filter} inquiries.
                </div>
              )}
            </div>
          </div>

          {/* ── detail + reply ── */}
          {selected ? (
            <InquiryDetail key={selected._id} inquiry={selected} onReplied={load} />
          ) : (
            <div style={{ borderRadius: 16, background: "#0d1a18", padding: "3rem", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--ff-body)", color: "rgba(255,255,255,0.45)" }}>Select an inquiry to view details.</p>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function InquiryDetail({ inquiry, onReplied }: { inquiry: InquiryRow; onReplied: () => void }) {
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentOk, setSentOk] = useState(false);

  // every real photo available across the inquired machines — the picker
  const availableImages = Array.from(new Set(
    inquiry.machines.flatMap(m => {
      const fam = familyBySlug(m.slug);
      return fam ? familyImages(fam) : [];
    })
  ));

  function toggleImage(src: string) {
    setSelectedImages(prev => prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]);
  }

  async function sendReply() {
    if (!message.trim()) return;
    setSending(true); setError(""); setSentOk(false);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, images: selectedImages }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send reply");
      }
      setMessage(""); setSelectedImages([]); setSentOk(true);
      onReplied();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  const rowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" };
  const keyStyle: React.CSSProperties = { fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" };
  const valStyle: React.CSSProperties = { fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: "#fff", fontWeight: 600, textAlign: "right" };

  return (
    <div style={{ borderRadius: 16, background: "#0d1a18", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* customer details */}
      <div>
        <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.6rem", color: "#fff", margin: "0 0 0.9rem" }}>{inquiry.name}</h2>
        {[
          ["Email", inquiry.email],
          ["Company", inquiry.company],
          ["Phone", inquiry.phone],
          ["Country", inquiry.country],
        ].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={rowStyle}><span style={keyStyle}>{k}</span><span style={valStyle}>{v}</span></div>
        ))}
      </div>

      {/* machines requested */}
      <div>
        <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-teal)", marginBottom: "0.6rem" }}>Machines requested</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {inquiry.machines.map((m, i) => (
            <div key={i} style={{ borderRadius: 10, background: "rgba(255,255,255,0.04)", padding: "0.85rem 1rem" }}>
              <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{m.name}</div>
              <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: "0.2rem" }}>
                Model: {m.model} · Qty: {m.qty}
              </div>
              {m.notes && <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", marginTop: "0.3rem", fontStyle: "italic" }}>"{m.notes}"</div>}
            </div>
          ))}
        </div>
      </div>

      {/* message */}
      {inquiry.message && (
        <div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-teal)", marginBottom: "0.5rem" }}>Message</div>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.92rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>{inquiry.message}</p>
        </div>
      )}

      {/* reply history */}
      {inquiry.replies.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-teal)", marginBottom: "0.6rem" }}>Previous replies</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {inquiry.replies.map((r, i) => (
              <div key={i} style={{ borderRadius: 10, background: "rgba(255,255,255,0.04)", padding: "0.85rem 1rem" }}>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", margin: "0 0 0.4rem", lineHeight: 1.5 }}>{r.message}</p>
                {r.images.length > 0 && (
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                    {r.images.map((src, j) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={j} src={src} alt="" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
                    ))}
                  </div>
                )}
                <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{timeAgo(String(r.sentAt))}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* reply composer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
        <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "0.6rem" }}>Reply to {inquiry.name}</div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write your reply — it will be emailed directly to the customer…"
          style={{
            width: "100%", minHeight: 120, padding: "0.85rem 1rem", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff", fontFamily: "var(--ff-body)", fontSize: "0.95rem", resize: "vertical", outline: "none",
          }}
        />

        {availableImages.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.5rem" }}>
              Attach machine photos (optional)
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {availableImages.map(src => {
                const on = selectedImages.includes(src);
                return (
                  <button key={src} type="button" onClick={() => toggleImage(src)} style={{
                    width: 64, height: 64, borderRadius: 10, cursor: "pointer", padding: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: on ? "2px solid var(--brand-teal)" : "2px solid transparent",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "#ff8a97", marginTop: "0.75rem" }}>{error}</div>}
        {sentOk && <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "var(--brand-teal)", marginTop: "0.75rem" }}>✓ Reply sent to {inquiry.email}</div>}

        <button onClick={sendReply} disabled={sending || !message.trim()} style={{
          marginTop: "1.1rem", padding: "0.85rem 1.75rem", borderRadius: 10,
          background: "var(--brand-teal)", color: "#04211e", border: "none",
          fontFamily: "var(--ff-body)", fontSize: "0.95rem", fontWeight: 700,
          cursor: sending || !message.trim() ? "default" : "pointer",
          opacity: sending || !message.trim() ? 0.5 : 1,
        }}>
          {sending ? "Sending…" : "Send reply"}
        </button>
      </div>
    </div>
  );
}
