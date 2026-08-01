"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Inbox, TrendingUp, CheckCircle2, Clock, ArrowRight, ArrowUpRight,
  MessageSquare, Wrench, Sparkles, Mail, Factory, ImagePlus, Info,
} from "lucide-react";
import AdminShell from "./AdminShell";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH } from "@/lib/adminAuth";
import { SectionIcon } from "./adminIcons";
import type { InquiryType } from "@/models/Inquiry";

interface InquiryRow {
  _id: string;
  inquiryType: InquiryType;
  name: string;
  company: string;
  status: "new" | "read" | "replied";
  source: string;
  createdAt: string;
}

const TYPE_META: Record<InquiryType, { label: string; icon: typeof Wrench; color: string }> = {
  "talk-to-engineer": { label: "asked to talk to an engineer", icon: Wrench, color: "#8b5cf6" },
  direct:             { label: "sent a direct inquiry",        icon: Mail,   color: "#3b82f6" },
  parts:              { label: "requested parts",              icon: Factory,color: "#f59e0b" },
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

function StatCardSkeleton() {
  return (
    <div className="adm-stat">
      <div className="adm-skel" style={{ width: 38, height: 38, borderRadius: 10, marginBottom: "0.9rem" }} />
      <div className="adm-skel" style={{ width: "45%", height: 28, borderRadius: 6, marginBottom: "0.5rem" }} />
      <div className="adm-skel" style={{ width: "70%", height: 14, borderRadius: 6 }} />
    </div>
  );
}

export default function AdminHome() {
  const [inquiries, setInquiries] = useState<InquiryRow[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/inquiries")
      .then(r => r.json())
      .then(j => { if (alive && Array.isArray(j.inquiries)) setInquiries(j.inquiries); })
      .catch(() => { if (alive) setInquiries([]); });
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => {
    if (!inquiries) return null;
    const total = inquiries.length;
    const newCount = inquiries.filter(i => i.status === "new").length;
    const replied = inquiries.filter(i => i.status === "replied").length;
    const last7 = inquiries.filter(i => Date.now() - new Date(i.createdAt).getTime() < 7 * 86400000).length;
    const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0;
    return { total, newCount, replied, last7, responseRate };
  }, [inquiries]);

  const recent = useMemo(() => (inquiries ?? []).slice(0, 6), [inquiries]);

  return (
    <AdminShell>
      <div className="adm-page-head adm-rise">
        <div className="adm-page-head__eyebrow">
          <Sparkles size={13} />
          Operations Console
        </div>
        <h1 className="adm-page-head__title">Welcome back</h1>
        <p className="adm-page-head__sub">
          Here&apos;s what&apos;s happening across the site. Content changes go live the moment you hit save —
          no rebuild needed, and you can upload photos straight from your computer.
        </p>
      </div>

      {/* ── stat cards ── */}
      <div className="adm-stats adm-stagger">
        {!stats ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="adm-stat">
              <div className="adm-stat__icon"><Inbox size={18} /></div>
              <div className="adm-stat__value">{stats.total}</div>
              <div className="adm-stat__label">Total inquiries</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat__icon" style={{ background: "rgba(225,29,72,0.15)", color: "#e11d48" }}><Clock size={18} /></div>
              <div className="adm-stat__value">{stats.newCount}</div>
              <div className="adm-stat__label">Awaiting review</div>
              {stats.newCount > 0 && (
                <span className="adm-stat__trend" style={{ background: "rgba(225,29,72,0.15)", color: "#e11d48" }}>Needs you</span>
              )}
            </div>
            <div className="adm-stat">
              <div className="adm-stat__icon" style={{ background: "rgba(43,191,179,0.15)", color: "var(--brand-teal)" }}><CheckCircle2 size={18} /></div>
              <div className="adm-stat__value">{stats.responseRate}%</div>
              <div className="adm-stat__label">Response rate</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat__icon" style={{ background: "rgba(245,196,81,0.15)", color: "#f5c451" }}><TrendingUp size={18} /></div>
              <div className="adm-stat__value">{stats.last7}</div>
              <div className="adm-stat__label">New in last 7 days</div>
            </div>
          </>
        )}
      </div>

      {/* ── activity + quick actions ── */}
      <div className="adm-rise adm-overview-grid" style={{ animationDelay: "0.1s", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.1rem", marginBottom: "2.5rem", alignItems: "start" }}>
        <div className="adm-panel">
          <div className="adm-panel__head">
            <h2 className="adm-panel__title"><MessageSquare size={17} color="var(--brand-teal)" /> Recent activity</h2>
            <Link href={`/${ADMIN_PATH}/inquiries`} style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-teal)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="adm-feed">
            {!inquiries ? (
              <div style={{ padding: "1.1rem 1.35rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: "flex", gap: "0.85rem" }}>
                    <div className="adm-skel" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="adm-skel" style={{ width: "60%", height: 13, borderRadius: 6, marginBottom: "0.4rem" }} />
                      <div className="adm-skel" style={{ width: "35%", height: 11, borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="adm-feed__empty">No inquiries yet — they&apos;ll show up here as soon as a customer submits the contact form.</div>
            ) : (
              recent.map(inq => {
                const meta = TYPE_META[inq.inquiryType ?? "direct"] ?? TYPE_META.direct;
                const Icon = meta.icon;
                return (
                  <Link key={inq._id} href={`/${ADMIN_PATH}/inquiries`} className="adm-feed__row" style={{ textDecoration: "none" }}>
                    <div className="adm-feed__icon" style={{ background: `${meta.color}22`, color: meta.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="adm-feed__body">
                      <div className="adm-feed__title">
                        {inq.name}{inq.company ? ` · ${inq.company}` : ""}
                        {inq.status === "new" && (
                          <span style={{ marginLeft: "0.5rem", display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#e11d48", verticalAlign: "middle" }} />
                        )}
                      </div>
                      <div className="adm-feed__meta">{meta.label} · {timeAgo(inq.createdAt)}</div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="adm-panel">
          <div className="adm-panel__head">
            <h2 className="adm-panel__title">Quick actions</h2>
          </div>
          <div className="adm-actions">
            <Link href={`/${ADMIN_PATH}/inquiries`} className="adm-action-btn">
              <Inbox size={17} />
              Review inquiries
              <ArrowUpRight size={15} />
            </Link>
            <Link href={`/${ADMIN_PATH}/s/home-hero`} className="adm-action-btn">
              <Sparkles size={17} />
              Edit homepage hero
              <ArrowUpRight size={15} />
            </Link>
            <Link href={`/${ADMIN_PATH}/s/products`} className="adm-action-btn">
              <Factory size={17} />
              Manage products
              <ArrowUpRight size={15} />
            </Link>
            <Link href={`/${ADMIN_PATH}/s/news`} className="adm-action-btn">
              <ImagePlus size={17} />
              Post news update
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── content sections ── */}
      <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: "0 0 1rem" }}>
        Edit site content
      </h2>
      <div className="adm-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.1rem" }}>
        {SECTION_SCHEMAS.map(s => (
          <Link
            key={s.slug}
            href={`/${ADMIN_PATH}/s/${s.slug}`}
            className="adm-tile"
            onMouseMove={e => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
          >
            <div className="adm-tile__head">
              <div className="adm-tile__icon"><SectionIcon slug={s.slug} size={20} /></div>
              <span
                className="adm-tile__info"
                tabIndex={0}
                role="note"
                aria-label={s.description}
                onClick={e => e.preventDefault()}
              >
                <Info size={14} />
                <span className="adm-tile__desc">{s.description}</span>
              </span>
            </div>
            <div className="adm-tile__title">{s.title}</div>
            <div className="adm-tile__cta">Edit this section <ArrowRight size={15} /></div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
