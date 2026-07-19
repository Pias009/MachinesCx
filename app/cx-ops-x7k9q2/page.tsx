"use client";
import Link from "next/link";
import AdminShell from "./AdminShell";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH } from "@/lib/adminAuth";

const SECTION_ICON: Record<string, string> = {
  "products": "🏭",
  "home-hero": "✨",
  "machine-catalog": "🗂️",
  "production-line": "🔧",
  "flexo-strip": "🖨️",
  "printing-showcase": "🎞️",
  "scrollhome-bags": "🛍️",
};

export default function AdminHome() {
  return (
    <AdminShell>
      <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "2.6rem", color: "#fff", lineHeight: 1, margin: "0 0 0.75rem" }}>
        Welcome back
      </h1>
      <p style={{ fontFamily: "var(--ff-body)", fontSize: "1.05rem", color: "rgba(255,255,255,0.65)", margin: "0 0 2.5rem", maxWidth: "62ch", lineHeight: 1.7 }}>
        Pick what you'd like to edit below. Changes go live on the site as soon as you hit save —
        no rebuild needed, and you can upload photos straight from your computer.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.1rem" }}>
        {SECTION_SCHEMAS.map(s => (
          <Link key={s.slug} href={`/${ADMIN_PATH}/s/${s.slug}`} style={{
            display: "block", padding: "1.75rem", textDecoration: "none",
            background: "#111", borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.07)",
            transition: "transform 0.15s, border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--brand-teal)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.85rem" }}>{SECTION_ICON[s.slug] ?? "📄"}</div>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.4rem", color: "#fff", lineHeight: 1.1, marginBottom: "0.6rem" }}>
              {s.title}
            </div>
            <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.92rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "1.1rem" }}>
              {s.description}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontFamily: "var(--ff-body)", fontSize: "0.9rem", fontWeight: 700,
              color: "var(--brand-teal)",
            }}>
              Edit this section →
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
