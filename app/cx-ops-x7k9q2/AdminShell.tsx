"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH } from "@/lib/adminAuth";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/inquiries")
      .then(r => r.json())
      .then(j => {
        if (!alive || !Array.isArray(j.inquiries)) return;
        setNewCount(j.inquiries.filter((i: { status: string }) => i.status === "new").length);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace(`/${ADMIN_PATH}/login`);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#000" }}>
      <style suppressHydrationWarning>{`
        .adm-nav__link {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1.1rem; margin: 0 0.6rem;
          border-radius: 10px;
          font-family: var(--ff-body); font-size: 0.95rem; font-weight: 500;
          color: rgba(255,255,255,0.7); text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .adm-nav__link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .adm-nav__link--on {
          background: var(--brand-teal) !important;
          color: #04211e !important;
          font-weight: 700;
        }
        @media (max-width: 900px) {
          .adm-side { position: static !important; width: 100% !important; height: auto !important; }
          .adm-main { margin-left: 0 !important; }
        }
      `}</style>

      {/* ── sidebar ── */}
      <aside className="adm-side" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 268,
        background: "#000",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", zIndex: 50,
      }}>
        <div style={{ padding: "1.75rem 1.5rem 1.25rem" }}>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-teal)", marginBottom: "0.15rem" }}>
            Ashal Innomach
          </div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.6rem", color: "#fff", lineHeight: 1 }}>
            Admin Panel
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0" }} aria-label="CMS sections">
          <Link
            href={`/${ADMIN_PATH}`}
            className={`adm-nav__link${pathname === `/${ADMIN_PATH}` ? " adm-nav__link--on" : ""}`}
          >
            🏠 Overview
          </Link>
          <Link
            href={`/${ADMIN_PATH}/inquiries`}
            className={`adm-nav__link${pathname.startsWith(`/${ADMIN_PATH}/inquiries`) ? " adm-nav__link--on" : ""}`}
            style={{ justifyContent: "space-between" }}
          >
            <span>📬 Inquiries</span>
            {newCount > 0 && (
              <span style={{
                background: "#e11d48", color: "#fff", borderRadius: 999,
                fontSize: "0.72rem", fontWeight: 700, padding: "0.1rem 0.5rem", minWidth: 20, textAlign: "center",
              }}>{newCount}</span>
            )}
          </Link>
          <div style={{ padding: "1.25rem 1.7rem 0.5rem", fontFamily: "var(--ff-body)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)" }}>
            Edit site content
          </div>
          {SECTION_SCHEMAS.map(s => {
            const href = `/${ADMIN_PATH}/s/${s.slug}`;
            return (
              <Link key={s.slug} href={href}
                className={`adm-nav__link${pathname === href ? " adm-nav__link--on" : ""}`}>
                {s.title}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1.25rem" }}>
          <button onClick={logout} style={{
            width: "100%", padding: "0.85rem", borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "none", color: "rgba(255,255,255,0.7)",
            fontFamily: "var(--ff-body)", fontSize: "0.9rem", fontWeight: 600,
            cursor: "pointer",
          }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── main ── */}
      <main className="adm-main" style={{ flex: 1, marginLeft: 268, padding: "clamp(1.75rem,4vw,3.5rem)", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
