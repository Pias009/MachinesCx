"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Inbox, LineChart, Settings, LogOut, Search,
  ChevronDown, Bell, Menu, X, ShieldAlert, ArrowLeft, Lock
} from "lucide-react";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH, SessionUser } from "@/lib/adminAuth";
import { AdminRole } from "@/lib/adminRoles";
import { SectionIcon } from "./adminIcons";

const roleBadgeColors: Record<AdminRole, string> = {
  super_admin: "#00E5A3",
  content_editor: "#3b82f6",
  machine_manager: "#f5c451",
  analytics_viewer: "#a855f7",
};

const roleTitles: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  machine_manager: "Machine Manager",
  analytics_viewer: "Analytics Viewer",
};

const MACHINE_MANAGER_SCHEMAS = [
  "products",
  "machine-catalog",
  "production-line",
  "flexo-strip",
  "printing-showcase",
  "scrollhome-bags",
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch current authenticated user & role
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive) return;
        if (j && j.authenticated && j.user) {
          setCurrentUser(j.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingUser(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Fetch inquiries count if user has access to inquiries
  useEffect(() => {
    let alive = true;
    if (
      currentUser &&
      (currentUser.role === "super_admin" || currentUser.role === "analytics_viewer")
    ) {
      fetch("/api/admin/inquiries")
        .then((r) => r.json())
        .then((j) => {
          if (!alive || !Array.isArray(j.inquiries)) return;
          setNewCount(j.inquiries.filter((i: { status: string }) => i.status === "new").length);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [pathname, currentUser]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace(`/${ADMIN_PATH}/login`);
    router.refresh();
  }

  const role: AdminRole = currentUser?.role || "super_admin";

  // Filter visible nav items based on role
  const canSeeInquiries = role === "super_admin" || role === "analytics_viewer";
  const canSeeAnalytics = role === "super_admin" || role === "analytics_viewer";
  const canSeeSettings = role === "super_admin";
  const canSeeCMS = role !== "analytics_viewer";

  const visibleSchemas = SECTION_SCHEMAS.filter((s) => {
    if (!canSeeCMS) return false;
    if (role === "machine_manager") {
      return MACHINE_MANAGER_SCHEMAS.includes(s.slug);
    }
    return true;
  }).filter(
    (s) =>
      !search.trim() ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Check if current route is authorized for this role
  let isRouteAllowed = true;
  if (pathname.startsWith(`/${ADMIN_PATH}/settings`)) {
    isRouteAllowed = role === "super_admin";
  } else if (
    pathname.startsWith(`/${ADMIN_PATH}/inquiries`) ||
    pathname.startsWith(`/${ADMIN_PATH}/analytics`)
  ) {
    isRouteAllowed = role === "super_admin" || role === "analytics_viewer";
  } else if (pathname.startsWith(`/${ADMIN_PATH}/s/`)) {
    const slug = pathname.split("/s/")[1]?.split("/")[0] || "";
    if (role === "analytics_viewer") {
      isRouteAllowed = false;
    } else if (role === "machine_manager") {
      isRouteAllowed = MACHINE_MANAGER_SCHEMAS.includes(slug);
    }
  }

  const isMainDashboard = pathname === `/${ADMIN_PATH}`;

  // Get user initials for avatar
  const userInitials = (currentUser?.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="adm-shell" data-admin="true">
      {/* Mobile Top Bar */}
      <div
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.2rem",
          background: "#0c1424",
          borderBottom: "1px solid var(--adm-border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
        className="adm-mobile-header"
      >
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
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 45,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`adm-side ${mobileOpen ? "adm-side--open" : ""}`}>
        {/* Brand Header */}
        <div
          className="adm-brand"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: 10,
                overflow: "hidden",
                border: `1px solid ${roleBadgeColors[role]}66`,
                background: "#ffffff",
                padding: 2,
                flexShrink: 0,
                boxShadow: `0 0 16px ${roleBadgeColors[role]}44`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpeg"
                alt="Ashal Innomech"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 1,
                  right: 1,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: roleBadgeColors[role],
                  boxShadow: `0 0 6px ${roleBadgeColors[role]}`,
                }}
              />
            </div>
            <div>
              <span
                className="adm-brand__name"
                style={{ display: "block", fontSize: "1.05rem", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "0.02em" }}
              >
                <em style={{ color: "var(--brand-red)", fontStyle: "normal", marginRight: "0.25em" }}>ASHAL</em>
                INNOMECH
              </span>
              <span style={{ fontSize: "0.68rem", color: roleBadgeColors[role], fontWeight: 700, letterSpacing: "0.05em" }}>
                {roleTitles[role].toUpperCase()}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.65rem",
              padding: "0.15rem 0.45rem",
              borderRadius: 8,
              background: `${roleBadgeColors[role]}1c`,
              color: roleBadgeColors[role],
              border: `1px solid ${roleBadgeColors[role]}3d`,
              fontWeight: 700,
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* Sidebar Search Input (Visible if user can edit CMS) */}
        {canSeeCMS && (
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
        )}

        {/* Role-Filtered Navigation Buttons */}
        <div className="adm-side__grid">
          <Link
            href={`/${ADMIN_PATH}`}
            className={`adm-side__grid-btn ${isMainDashboard ? "adm-side__grid-btn--active" : ""}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          {canSeeInquiries && (
            <Link
              href={`/${ADMIN_PATH}/inquiries`}
              className={`adm-side__grid-btn ${pathname.startsWith(`/${ADMIN_PATH}/inquiries`) ? "adm-side__grid-btn--active" : ""}`}
            >
              <Inbox size={18} />
              Inquiries
              {newCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "var(--adm-mint)",
                    color: "#061814",
                    borderRadius: 10,
                    padding: "0.1rem 0.4rem",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                  }}
                >
                  {newCount}
                </span>
              )}
            </Link>
          )}

          {canSeeAnalytics && (
            <Link
              href={`/${ADMIN_PATH}/analytics`}
              className={`adm-side__grid-btn ${pathname === `/${ADMIN_PATH}/analytics` ? "adm-side__grid-btn--active" : ""}`}
            >
              <LineChart size={18} />
              Analytics
            </Link>
          )}

          {canSeeSettings && (
            <Link
              href={`/${ADMIN_PATH}/settings`}
              className={`adm-side__grid-btn ${pathname === `/${ADMIN_PATH}/settings` ? "adm-side__grid-btn--active" : ""}`}
            >
              <Settings size={18} />
              Settings
            </Link>
          )}
        </div>

        {/* Role Shortcuts Accordion Group */}
        <div className="adm-side__group">
          <div className="adm-side__group-head">
            <ChevronDown size={14} />
            Shortcuts & Scope
          </div>
          <div className="adm-side__group-items">
            {canSeeSettings && (
              <Link href={`/${ADMIN_PATH}/settings`} className="adm-side__item">
                <span className="adm-side__bullet" style={{ background: "#00D294" }} />
                Roles & Privacy Access
              </Link>
            )}
            {canSeeInquiries && (
              <Link href={`/${ADMIN_PATH}/inquiries`} className="adm-side__item">
                <span className="adm-side__bullet" style={{ background: "#3b82f6" }} />
                Inquiry Pipeline
              </Link>
            )}
            {canSeeCMS && (
              <Link href={`/${ADMIN_PATH}/s/products`} className="adm-side__item">
                <span className="adm-side__bullet" style={{ background: "#f5c451" }} />
                Machinery Catalogue
              </Link>
            )}
          </div>
        </div>

        {/* Site Content Management Accordion Group */}
        {canSeeCMS && (
          <div className="adm-side__group">
            <div className="adm-side__group-head">
              <ChevronDown size={14} />
              CMS Content Schemas ({visibleSchemas.length})
            </div>
            <div className="adm-side__group-items">
              {visibleSchemas.map((s) => {
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
        )}

        {/* User Profile Footer */}
        <div className="adm-side__user">
          <div className="adm-side__user-info">
            <div
              className="adm-side__user-avatar"
              style={{
                position: "relative",
                background: `${roleBadgeColors[role]}22`,
                color: roleBadgeColors[role],
                border: `1px solid ${roleBadgeColors[role]}44`,
                fontWeight: 800,
              }}
            >
              {userInitials}
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: roleBadgeColors[role],
                  border: "1px solid #121b2d",
                }}
              />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                className="adm-side__user-name"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 110,
                }}
              >
                {currentUser?.name || "Admin"}
              </div>
              <div
                className="adm-side__user-role"
                style={{ color: roleBadgeColors[role], fontWeight: 700 }}
              >
                {roleTitles[role]}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.3rem" }}>
            {canSeeInquiries && (
              <Link
                href={`/${ADMIN_PATH}/inquiries`}
                title="Notifications"
                className="adm-side__user-btn"
                style={{ position: "relative" }}
              >
                <Bell size={15} />
                {newCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ff6b7d",
                    }}
                  />
                )}
              </Link>
            )}
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
        {!isRouteAllowed ? (
          <div
            className="adm-rise"
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              maxWidth: 540,
              margin: "3rem auto",
              background: "rgba(18, 27, 45, 0.6)",
              borderRadius: 20,
              border: "1px solid rgba(255, 107, 125, 0.25)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: "rgba(255, 107, 125, 0.15)",
                color: "#ff8a97",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <ShieldAlert size={32} />
            </div>
            <h2
              style={{
                fontFamily: "var(--ff-display)",
                fontSize: "1.75rem",
                color: "#fff",
                margin: "0 0 0.5rem",
              }}
            >
              Role Access Restricted
            </h2>
            <p
              style={{
                fontSize: "0.92rem",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.6,
                margin: "0 0 1.75rem",
              }}
            >
              Your logged-in role (
              <strong style={{ color: roleBadgeColors[role] }}>
                {roleTitles[role]}
              </strong>
              ) does not have permission to view or modify this section.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <Link
                href={`/${ADMIN_PATH}`}
                className="adm-btn"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <ArrowLeft size={16} /> Return to Console
              </Link>
              <button
                onClick={logout}
                style={{
                  padding: "0.65rem 1.1rem",
                  borderRadius: 10,
                  background: "rgba(255,107,125,0.15)",
                  border: "1px solid rgba(255,107,125,0.3)",
                  color: "#ff8a97",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Lock size={15} /> Switch Account
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
