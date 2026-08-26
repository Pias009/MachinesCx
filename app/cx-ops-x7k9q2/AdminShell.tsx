"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Inbox, LineChart, Settings, LogOut, Search,
  ChevronDown, Bell, Menu, X, FileText, Sparkles, Star, FolderKanban
} from "lucide-react";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH } from "@/lib/adminAuth";
import { SectionIcon } from "./adminIcons";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace(`/${ADMIN_PATH}/login`);
    router.refresh();
  }

  const isMainDashboard = pathname === `/${ADMIN_PATH}`;

  return (
    <div className="adm-shell" data-admin="true">
      {/* Mobile Top Bar */}
      <div style={{
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.2rem",
        background: "#0c1424",
        borderBottom: "1px solid var(--adm-border)",
        position: "sticky", top: 0, zIndex: 40
      }} className="adm-mobile-header">
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
        >
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 800, color: "#fff" }}>Ashal Innomech Ops</span>
        <span style={{ width: 22 }} />
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 45
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`adm-side ${mobileOpen ? "adm-side--open" : ""}`}>
        {/* Brand Header */}
        <div className="adm-brand" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              position: "relative", width: 38, height: 38, borderRadius: 10,
              overflow: "hidden", border: "1px solid rgba(0, 210, 148, 0.4)",
              background: "#ffffff", padding: 2, flexShrink: 0,
              boxShadow: "0 0 16px rgba(0, 210, 148, 0.25)"
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpeg"
                alt="Ashal Innomech"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
              />
              <span style={{
                position: "absolute", top: 1, right: 1, width: 7, height: 7, borderRadius: "50%",
                background: "#00E5A3", boxShadow: "0 0 6px #00E5A3"
              }} />
            </div>
            <div>
              <span className="adm-brand__name" style={{ display: "block", fontSize: "1.05rem", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "0.02em" }}>
                <em style={{ color: "var(--brand-red)", fontStyle: "normal", marginRight: "0.25em" }}>ASHAL</em>
                INNOMECH
              </span>
              <span style={{ fontSize: "0.68rem", color: "var(--adm-mint)", fontWeight: 700, letterSpacing: "0.05em" }}>
                OPS COMMAND
              </span>
            </div>
          </div>
          <span style={{
            fontSize: "0.65rem", padding: "0.15rem 0.45rem", borderRadius: 8,
            background: "rgba(0,210,148,0.12)", color: "var(--adm-mint)", border: "1px solid rgba(0,210,148,0.25)",
            fontWeight: 700
          }}>
            LIVE
          </span>
        </div>

        {/* Sidebar Search Input */}
        <div className="adm-side__search">
          <Search size={14} className="adm-side__search-icon" />
          <input
            type="text"
            placeholder="Search CMS schemas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="adm-side__search-input"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0 0.3rem" }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* 2-Column Grid Navigation Buttons */}
        <div className="adm-side__grid">
          <Link
            href={`/${ADMIN_PATH}`}
            className={`adm-side__grid-btn ${isMainDashboard ? "adm-side__grid-btn--active" : ""}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href={`/${ADMIN_PATH}/inquiries`}
            className={`adm-side__grid-btn ${pathname.startsWith(`/${ADMIN_PATH}/inquiries`) ? "adm-side__grid-btn--active" : ""}`}
          >
            <Inbox size={18} />
            Inquiries
            {newCount > 0 && <span style={{ marginLeft: "auto", background: "var(--adm-mint)", color: "#061814", borderRadius: 10, padding: "0.1rem 0.4rem", fontSize: "0.68rem", fontWeight: 800 }}>{newCount}</span>}
          </Link>
          <Link
            href={`/${ADMIN_PATH}/analytics`}
            className={`adm-side__grid-btn ${pathname === `/${ADMIN_PATH}/analytics` ? "adm-side__grid-btn--active" : ""}`}
          >
            <LineChart size={18} />
            Analytics
          </Link>
          <Link
            href={`/${ADMIN_PATH}/settings`}
            className={`adm-side__grid-btn ${pathname === `/${ADMIN_PATH}/settings` ? "adm-side__grid-btn--active" : ""}`}
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>

        {/* Favorites Accordion Group */}
        <div className="adm-side__group">
          <div className="adm-side__group-head">
            <ChevronDown size={14} />
            Shortcuts & Pipeline
          </div>
          <div className="adm-side__group-items">
            <Link href={`/${ADMIN_PATH}/settings`} className="adm-side__item">
              <span className="adm-side__bullet" style={{ background: "#00D294" }} />
              Roles & Privacy Access
            </Link>
            <Link href={`/${ADMIN_PATH}/inquiries`} className="adm-side__item">
              <span className="adm-side__bullet" style={{ background: "#3b82f6" }} />
              Inquiry Pipeline
            </Link>
            <Link href={`/${ADMIN_PATH}/s/products`} className="adm-side__item">
              <span className="adm-side__bullet" style={{ background: "#f5c451" }} />
              Machinery Catalogue
            </Link>
          </div>
        </div>

        {/* Site Content Management Accordion Group */}
        <div className="adm-side__group">
          <div className="adm-side__group-head">
            <ChevronDown size={14} />
            CMS Content Schemas
          </div>
          <div className="adm-side__group-items">
            {SECTION_SCHEMAS
              .filter(s => !search.trim() || s.title.toLowerCase().includes(search.toLowerCase()) || s.slug.toLowerCase().includes(search.toLowerCase()))
              .map(s => {
                const href = `/${ADMIN_PATH}/s/${s.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={s.slug}
                    href={href}
                    className={`adm-side__item ${active ? "adm-side__item--active" : ""}`}
                  >
                    <SectionIcon slug={s.slug} size={15} />
                    {s.title}
                  </Link>
                );
              })}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="adm-side__user">
          <div className="adm-side__user-info">
            <div className="adm-side__user-avatar" style={{ position: "relative" }}>
              AD
              <span style={{
                position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%",
                background: "#00E5A3", border: "1px solid #121b2d"
              }} />
            </div>
            <div>
              <div className="adm-side__user-name">Admin</div>
              <div className="adm-side__user-role">System Operator</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <Link
              href={`/${ADMIN_PATH}/inquiries`}
              title="Notifications"
              className="adm-side__user-btn"
              style={{ position: "relative" }}
            >
              <Bell size={15} />
              {newCount > 0 && (
                <span style={{
                  position: "absolute", top: -3, right: -3, width: 8, height: 8,
                  borderRadius: "50%", background: "#ff6b7d"
                }} />
              )}
            </Link>
            <button
              onClick={logout}
              title="Log out"
              className="adm-side__user-btn adm-side__user-btn--danger"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="adm-main">
        {children}
      </main>
    </div>
  );
}
