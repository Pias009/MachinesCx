"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Inbox, LogOut, Menu, Settings, Terminal, X } from "lucide-react";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH } from "@/lib/adminAuth";
import { SectionIcon } from "./adminIcons";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const navLink = (href: string, active: boolean) =>
    `adm-nav__link${active ? " adm-nav__link--on" : ""}`;

  return (
    <div className="adm-shell">
      {/* ── mobile topbar ── */}
      <div className="adm-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0.4rem" }}
        >
          <Menu size={22} />
        </button>
        <span style={{ fontFamily: "var(--ff-display)", fontSize: "1.15rem", color: "#fff" }}>Admin Panel</span>
        <span style={{ width: 22 }} />
      </div>

      <div className={`adm-scrim${mobileOpen ? " adm-scrim--on" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ── sidebar ── */}
      <aside className={`adm-side${mobileOpen ? " adm-side--open" : ""}`}>
        <div className="adm-brand">
          <div className="adm-brand__eyebrow">
            <span className="adm-brand__dot" />
            Ashal Innomach
          </div>
          <div className="adm-brand__title">Admin Panel</div>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="adm-side-close"
        >
          <X size={20} />
        </button>

        <nav className="adm-nav" aria-label="CMS sections">
          <Link href={`/${ADMIN_PATH}`} className={navLink(`/${ADMIN_PATH}`, pathname === `/${ADMIN_PATH}`)}>
            <span className="adm-nav__link-icon"><Home size={16} /></span>
            Overview
          </Link>
          <Link
            href={`/${ADMIN_PATH}/inquiries`}
            className={navLink(`/${ADMIN_PATH}/inquiries`, pathname.startsWith(`/${ADMIN_PATH}/inquiries`))}
            style={{ justifyContent: "space-between" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="adm-nav__link-icon"><Inbox size={16} /></span>
              Inquiries
            </span>
            {newCount > 0 && <span className="adm-badge">{newCount}</span>}
          </Link>

          <Link
            href={`/${ADMIN_PATH}/analytics`}
            className={navLink(`/${ADMIN_PATH}/analytics`, pathname === `/${ADMIN_PATH}/analytics`)}
          >
            <span className="adm-nav__link-icon"><Terminal size={16} /></span>
            Analytics
          </Link>

          <Link
            href={`/${ADMIN_PATH}/settings`}
            className={navLink(`/${ADMIN_PATH}/settings`, pathname === `/${ADMIN_PATH}/settings`)}
          >
            <span className="adm-nav__link-icon"><Settings size={16} /></span>
            Settings
          </Link>

          <div className="adm-nav__section">Edit site content</div>
          <div className="adm-nav__group">
            {SECTION_SCHEMAS.map(s => {
              const href = `/${ADMIN_PATH}/s/${s.slug}`;
              return (
                <Link key={s.slug} href={href} className={navLink(href, pathname === href)}>
                  <span className="adm-nav__link-icon"><SectionIcon slug={s.slug} size={16} /></span>
                  {s.title}
                </Link>
              );
            })}
          </div>
        </nav>

        <button onClick={logout} className="adm-signout">
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* ── main ── */}
      <main className="adm-main">
        {children}
      </main>
    </div>
  );
}
