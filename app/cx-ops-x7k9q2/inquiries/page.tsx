"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import { familyBySlug, familyImages } from "@/lib/products";
import type { InquiryMachine, InquiryPart, InquiryReply, InquiryType } from "@/models/Inquiry";

interface InquiryRow {
  _id: string;
  inquiryType: InquiryType;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  machines: InquiryMachine[];
  parts: InquiryPart[];
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  source: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<InquiryType, { label: string; icon: string; color: string }> = {
  "talk-to-engineer": { label: "Talk to Engineer", icon: "⚙", color: "#8b5cf6" },
  direct:             { label: "Direct Inquiry",   icon: "📋", color: "#3b82f6" },
  parts:              { label: "Part Inquiry",     icon: "🔧", color: "#f59e0b" },
};

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  google:    { label: "Google",    color: "#4285F4" },
  facebook:  { label: "Facebook",  color: "#1877F2" },
  instagram: { label: "Instagram", color: "#E4405F" },
  linkedin:  { label: "LinkedIn",  color: "#0A66C2" },
  twitter:   { label: "X",         color: "#000" },
  direct:    { label: "Direct",    color: "rgba(255,255,255,0.4)" },
  other:     { label: "Other",     color: "rgba(255,255,255,0.4)" },
};

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

function SourceIcon({ name }: { name: string }) {
  const s: React.CSSProperties = { width: 14, height: 14, flexShrink: 0 };
  switch (name) {
    case "google":
      return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
    case "facebook":
      return <svg style={s} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "instagram":
      return <svg style={s} viewBox="0 0 24 24" fill="url(#ig_g)"><defs><linearGradient id="ig_g" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#FFDC80"/><stop offset="25%" stopColor="#F77737"/><stop offset="50%" stopColor="#E1306C"/><stop offset="75%" stopColor="#C13584"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case "linkedin":
      return <svg style={s} viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    default:
      return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
  }
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | InquiryType>("all");

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

  const filtered = inquiries?.filter(i => {
    if (filter !== "all" && i.status !== filter) return false;
    if (typeFilter !== "all" && i.inquiryType !== typeFilter) return false;
    return true;
  }) ?? [];

  const typeCounts = {
    all: inquiries?.length ?? 0,
    "talk-to-engineer": inquiries?.filter(i => i.inquiryType === "talk-to-engineer").length ?? 0,
    direct: inquiries?.filter(i => i.inquiryType === "direct").length ?? 0,
    parts: inquiries?.filter(i => i.inquiryType === "parts").length ?? 0,
  };

  const typeTabs: { key: "all" | InquiryType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "talk-to-engineer", label: "Talk to Engineer" },
    { key: "direct", label: "Direct Inquiry" },
    { key: "parts", label: "Part Inquiry" },
  ];

  return (
    <AdminShell>
      <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "2.4rem", color: "#fff", lineHeight: 1.05, margin: "0 0 0.5rem" }}>
        Inquiries
      </h1>
      <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(255,255,255,0.6)", margin: "0 0 2rem", maxWidth: "62ch", lineHeight: 1.6 }}>
        Every inquiry submitted from the site — machine requests, parts requests, and engineering consultations. Click one to read the full request and reply.
      </p>

      {!inquiries ? (
        <p style={{ fontFamily: "var(--ff-body)", color: "rgba(255,255,255,0.6)" }}>Loading…</p>
      ) : inquiries.length === 0 ? (
        <div style={{ borderRadius: 16, background: "#0d1a18", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>
            No inquiries yet — they&apos;ll show up here as soon as a customer submits the contact form.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.25rem", alignItems: "start" }}>
          {/* ── list ── */}
          <div style={{ borderRadius: 16, background: "#0d1a18", overflow: "hidden" }}>
            {/* type filter tabs */}
            <div style={{ display: "flex", gap: "0.35rem", padding: "0.9rem 0.9rem 0.5rem", flexWrap: "wrap" }}>
              {typeTabs.map(tab => {
                const active = typeFilter === tab.key;
                const count = typeCounts[tab.key];
                return (
                  <button key={tab.key} onClick={() => setTypeFilter(tab.key)} style={{
                    padding: "0.4rem 0.7rem", borderRadius: 8, border: "none", cursor: "pointer",
                    fontFamily: "var(--ff-body)", fontSize: "0.78rem", fontWeight: 600,
                    background: active
                      ? (tab.key === "all" ? "var(--brand-teal)" : TYPE_CONFIG[tab.key as InquiryType].color)
                      : "rgba(255,255,255,0.06)",
                    color: active ? "#04211e" : "rgba(255,255,255,0.65)",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                  }}>
                    {tab.key !== "all" && <span>{TYPE_CONFIG[tab.key as InquiryType].icon}</span>}
                    {tab.label}
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      minWidth: 18, height: 18, borderRadius: 9,
                      background: active ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)",
                      fontSize: "0.7rem", fontWeight: 700,
                      color: active ? "#04211e" : "rgba(255,255,255,0.5)",
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* status filter tabs */}
            <div style={{ display: "flex", gap: "0.3rem", padding: "0 0.9rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {(["all", "new", "read", "replied"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "0.35rem 0.65rem", borderRadius: 6, border: "none", cursor: "pointer",
                  fontFamily: "var(--ff-body)", fontSize: "0.75rem", fontWeight: 600,
                  background: filter === f ? "var(--brand-teal)" : "rgba(255,255,255,0.04)",
                  color: filter === f ? "#04211e" : "rgba(255,255,255,0.55)",
                  textTransform: "capitalize",
                }}>{f}</button>
              ))}
            </div>

            <div style={{ maxHeight: "68vh", overflowY: "auto" }}>
              {filtered.map(inq => {
                const type = TYPE_CONFIG[inq.inquiryType];
                return (
                  <button key={inq._id} onClick={() => selectInquiry(inq)} style={{
                    display: "block", width: "100%", textAlign: "left", padding: "0.9rem 1.1rem",
                    border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                    background: selectedId === inq._id ? "#122320" : "transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{inq.name}</span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[inq.status], flexShrink: 0 }} />
                    </div>

                    {/* type badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.25rem",
                        padding: "0.15rem 0.5rem", borderRadius: 5,
                        background: type.color + "22", color: type.color,
                        fontFamily: "var(--ff-body)", fontSize: "0.7rem", fontWeight: 700,
                      }}>
                        <span>{type.icon}</span> {type.label}
                      </span>
                    </div>

                    {/* summary */}
                    <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.3rem" }}>
                      {inq.inquiryType === "parts"
                        ? inq.parts.map(p => p.name).join(", ") || "No parts listed"
                        : inq.machines.map(m => m.name).join(", ") || "No machines listed"
                      }
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem",
                        fontFamily: "var(--ff-body)", fontSize: "0.7rem", fontWeight: 600,
                        color: SOURCE_CONFIG[inq.source]?.color ?? "rgba(255,255,255,0.4)",
                      }}>
                        <SourceIcon name={inq.source} />
                        {SOURCE_CONFIG[inq.source]?.label ?? "Unknown"}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                      {timeAgo(inq.createdAt)}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ padding: "1.5rem", fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                  No matching inquiries.
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

  const type = TYPE_CONFIG[inquiry.inquiryType];

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
      {/* header with type badge */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.25rem 0.7rem", borderRadius: 6,
            background: type.color + "22", color: type.color,
            fontFamily: "var(--ff-body)", fontSize: "0.82rem", fontWeight: 700,
          }}>
            <span>{type.icon}</span> {type.label}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            padding: "0.2rem 0.55rem", borderRadius: 5,
            background: STATUS_COLOR[inquiry.status] + "22",
            color: STATUS_COLOR[inquiry.status],
            fontFamily: "var(--ff-body)", fontSize: "0.75rem", fontWeight: 700,
          }}>
            {STATUS_LABEL[inquiry.status]}
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.6rem", color: "#fff", margin: 0 }}>{inquiry.name}</h2>
      </div>

      {/* customer details */}
      <div>
        <div style={rowStyle}>
          <span style={keyStyle}>Source</span>
          <span style={{ ...valStyle, display: "flex", alignItems: "center", gap: "0.35rem", color: SOURCE_CONFIG[inquiry.source]?.color ?? "rgba(255,255,255,0.4)" }}>
            <SourceIcon name={inquiry.source} />
            {SOURCE_CONFIG[inquiry.source]?.label ?? "Unknown"}
          </span>
        </div>
        {[
          ["Email", inquiry.email],
          ["Company", inquiry.company],
          ["Phone", inquiry.phone],
          ["Country", inquiry.country],
        ].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={rowStyle}><span style={keyStyle}>{k}</span><span style={valStyle}>{v}</span></div>
        ))}
      </div>

      {/* machines requested (talk-to-engineer & direct) */}
      {(inquiry.inquiryType === "talk-to-engineer" || inquiry.inquiryType === "direct") && inquiry.machines.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-teal)", marginBottom: "0.6rem" }}>Machines requested</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {inquiry.machines.map((m, i) => (
              <div key={i} style={{ borderRadius: 10, background: "rgba(255,255,255,0.04)", padding: "0.85rem 1rem" }}>
                <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{m.name}</div>
                <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: "0.2rem" }}>
                  Model: {m.model} · Qty: {m.qty}
                </div>
                {m.notes && <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", marginTop: "0.3rem", fontStyle: "italic" }}>&quot;{m.notes}&quot;</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* parts requested (parts) */}
      {inquiry.inquiryType === "parts" && inquiry.parts.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-teal)", marginBottom: "0.6rem" }}>Parts requested</div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--ff-body)" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                  {["Part Name", "Machine", "Qty", "Notes", "Images"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.6rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquiry.parts.map((p, i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.88rem", color: "#fff", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.65)" }}>{p.machine || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.65)" }}>{p.quantity}</td>
                    <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontStyle: p.notes ? "italic" : "normal", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.notes || "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      {p.images.length > 0 && (
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          {p.images.map((src, j) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={j} src={src} alt="" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 5, background: "rgba(255,255,255,0.06)" }} />
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
