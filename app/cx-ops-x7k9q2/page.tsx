"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Share2, MoreHorizontal, ArrowUpRight, Search,
  Users, DollarSign, TrendingUp, UserPlus, CheckCircle2, Clock,
  Video, CalendarDays, ChevronDown, MoreVertical, ExternalLink,
  X, Plus, RefreshCw, Download, Filter, Trash2, Eye, Mail, Check
} from "lucide-react";
import AdminShell from "./AdminShell";
import { ADMIN_PATH } from "@/lib/adminAuth";
import type { InquiryType } from "@/models/Inquiry";

interface InquiryRow {
  _id: string;
  inquiryType: InquiryType;
  name: string;
  company: string;
  email?: string;
  status: "new" | "read" | "replied";
  source?: string;
  createdAt: string;
}

interface ScheduleTask {
  id: string;
  title: string;
  subtitle: string;
  category: "meetings" | "tasks" | "events";
  time: string;
  type: string;
  link?: string;
}

export default function AdminHome() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<InquiryRow[] | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"meetings" | "tasks" | "events">("meetings");

  // Modals & Menu States
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState("11 Nov 2024");
  const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSub, setNewTaskSub] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("14:00 - 15:00");
  const [newTaskCat, setNewTaskCat] = useState<"meetings" | "tasks" | "events">("meetings");

  // Schedule Tasks initial state
  const [scheduleItems, setScheduleItems] = useState<ScheduleTask[]>([
    {
      id: "s1",
      title: "Interview Candidate UI/UX Designer",
      subtitle: "Project Discussion",
      category: "meetings",
      time: "13:00 - 13:30",
      type: "Google Meet",
      link: "https://meet.google.com/new"
    },
    {
      id: "s2",
      title: "Retro Day Celebration - HR Department",
      subtitle: "Arrangement Plan",
      category: "meetings",
      time: "15:00 - 16:00",
      type: "Google Meet",
      link: "https://meet.google.com/new"
    },
    {
      id: "s3",
      title: "Update Machine Technical Specs PDF",
      subtitle: "Catalogue CMS",
      category: "tasks",
      time: "10:00 - 11:30",
      type: "Internal Task"
    },
    {
      id: "s4",
      title: "Quarterly Extrusion Line Audit",
      subtitle: "Engineering Dept",
      category: "tasks",
      time: "16:30 - 17:30",
      type: "Inspection"
    },
    {
      id: "s5",
      title: "Wenzhou Industry Expo 2026",
      subtitle: "Main Stage Presentation",
      category: "events",
      time: "All Day",
      type: "Conference"
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInquiries = () => {
    fetch("/api/admin/inquiries")
      .then(r => r.json())
      .then(j => { if (Array.isArray(j.inquiries)) setInquiries(j.inquiries); })
      .catch(() => setInquiries([]));
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Compute stat totals
  const stats = useMemo(() => {
    const list = inquiries ?? [];
    const total = list.length || 432;
    const newCount = list.filter(i => i.status === "new").length || 24;
    const replied = list.filter(i => i.status === "replied").length || 38;
    const activeQuotes = list.filter(i => i.inquiryType === "talk-to-engineer").length || 24;
    const turnoverRate = 8;
    return { total, newCount, replied, activeQuotes, turnoverRate };
  }, [inquiries]);

  // Filter table rows
  const tableRows = useMemo(() => {
    const list = inquiries && inquiries.length > 0 ? inquiries : [
      { _id: "1", name: "Marvin McKinney", company: "3644765346", email: "example@gmail.com", status: "new", createdAt: "2024-11-11", inquiryType: "direct" },
      { _id: "2", name: "Ralph Edwards", company: "365467354", email: "example@gmail.com", status: "new", createdAt: "2024-11-10", inquiryType: "talk-to-engineer" },
      { _id: "3", name: "Courtney Henry", company: "982347123", email: "henry@gmail.com", status: "replied", createdAt: "2024-11-09", inquiryType: "parts" },
      { _id: "4", name: "Theresa Webb", company: "482341209", email: "webb@gmail.com", status: "read", createdAt: "2024-11-08", inquiryType: "direct" },
    ];
    if (!tableSearch.trim()) return list;
    return list.filter(r =>
      r.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      r.company.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(tableSearch.toLowerCase()))
    );
  }, [inquiries, tableSearch]);

  // Real CSV Export Handler
  const exportDataToCSV = () => {
    const headers = ["ID", "Name", "Company", "Email", "Status", "Inquiry Type", "Created At"];
    const rows = tableRows.map(r => [
      r._id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.email ?? ""}"`,
      r.status,
      r.inquiryType,
      r.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `homies_lab_report_${selectedDate.replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Report downloaded successfully!");
  };

  // Add Task Handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const item: ScheduleTask = {
      id: "custom-" + Date.now(),
      title: newTaskTitle,
      subtitle: newTaskSub || "Custom Schedule",
      category: newTaskCat,
      time: newTaskTime,
      type: newTaskCat === "meetings" ? "Google Meet" : "Task Note",
      link: newTaskCat === "meetings" ? "https://meet.google.com/new" : undefined
    };
    setScheduleItems(prev => [item, ...prev]);
    setNewTaskTitle("");
    setNewTaskSub("");
    setShowAddModal(false);
    showToast("Schedule item added!");
  };

  // Row actions
  const handleDeleteRow = (id: string) => {
    setInquiries(prev => prev ? prev.filter(r => r._id !== id) : []);
    setActiveRowMenu(null);
    showToast("Record removed from table");
  };

  const handleMarkRead = (id: string) => {
    setInquiries(prev => prev ? prev.map(r => r._id === id ? { ...r, status: "read" } : r) : []);
    setActiveRowMenu(null);
    showToast("Status updated to Read");
  };

  const filteredSchedule = scheduleItems.filter(s => s.category === activeTab);

  return (
    <AdminShell>
      <div className="adm-rise" style={{ position: "relative" }}>

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            background: "#00D294", color: "#061814", fontWeight: 700,
            padding: "0.75rem 1.25rem", borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,210,148,0.4)",
            display: "flex", alignItems: "center", gap: "0.5rem",
            animation: "adm-rise 0.3s ease"
          }}>
            <CheckCircle2 size={18} />
            {toastMessage}
          </div>
        )}

        {/* Header Top Bar */}
        <div className="adm-header">
          <div>
            <div className="adm-breadcrumb">
              Home / <span>Dashboard</span>
            </div>
            <h1 className="adm-title">Good Morning, Homies</h1>
            <p className="adm-subtitle">Overview & metrics for {selectedDate}.</p>
          </div>
          <div className="adm-header__actions">
            <button
              className="adm-icon-btn"
              title="Open Calendar Schedule"
              onClick={() => setShowCalendarModal(true)}
            >
              <Calendar size={18} />
            </button>
            <button
              className="adm-icon-btn"
              title="Export Report CSV"
              onClick={exportDataToCSV}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Top Metrics & Circular Gauge Row */}
        <div className="adm-top-row">
          {/* Left: 4 Stat Cards */}
          <div className="adm-stats-grid">
            <div className="adm-stat-card">
              <div className="adm-stat-card__top">
                <div className="adm-stat-card__icon"><Users size={17} /></div>
              </div>
              <div>
                <div className="adm-stat-card__val">{stats.total}</div>
                <div className="adm-stat-card__lbl">Employees</div>
              </div>
            </div>

            <div className="adm-stat-card">
              <div className="adm-stat-card__top">
                <div className="adm-stat-card__icon"><DollarSign size={17} /></div>
              </div>
              <div>
                <div className="adm-stat-card__val">{stats.newCount}</div>
                <div className="adm-stat-card__lbl">Payrolls</div>
              </div>
            </div>

            <div className="adm-stat-card">
              <div className="adm-stat-card__top">
                <div className="adm-stat-card__icon"><TrendingUp size={17} /></div>
              </div>
              <div>
                <div className="adm-stat-card__val">{stats.turnoverRate}%</div>
                <div className="adm-stat-card__lbl">Turnover Rate</div>
              </div>
            </div>

            <div className="adm-stat-card">
              <div className="adm-stat-card__top">
                <div className="adm-stat-card__icon"><UserPlus size={17} /></div>
              </div>
              <div>
                <div className="adm-stat-card__val">{stats.activeQuotes}</div>
                <div className="adm-stat-card__lbl">Job Applicants</div>
              </div>
            </div>
          </div>

          {/* Right: Circular Arc Gauge Meter */}
          <div className="adm-gauge-card">
            <div className="adm-gauge-wrap">
              <svg className="adm-gauge-svg" viewBox="0 0 160 100">
                <path
                  d="M 20 90 A 60 60 0 0 1 140 90"
                  fill="none"
                  stroke="#162338"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 90 A 60 60 0 0 1 128 42"
                  fill="none"
                  stroke="#00D294"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle cx="128" cy="42" r="5" fill="#fff" />
              </svg>
              <div className="adm-gauge-center">
                <div className="adm-gauge-val">80%</div>
                <div className="adm-gauge-sub">Employee Satisfactory</div>
              </div>
            </div>
            <div className="adm-gauge-ticks">
              <span>00</span>
              <span>40</span>
              <span>60</span>
              <span>80</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Middle Section (3 Columns) */}
        <div className="adm-mid-row">
          {/* Column 1: Schedule / Tasks Panel */}
          <div className="adm-card" style={{ position: "relative" }}>
            <div className="adm-card__head">
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: "var(--adm-text-sub)", fontWeight: 600, cursor: "pointer" }}
                >
                  {selectedDate} <ChevronDown size={14} />
                </button>
                {showDateDropdown && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 30,
                    background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10,
                    padding: "0.4rem", width: 140, boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                  }}>
                    {["11 Nov 2024", "Today", "This Week", "All Time"].map(d => (
                      <button
                        key={d}
                        onClick={() => { setSelectedDate(d); setShowDateDropdown(false); showToast(`Date updated to ${d}`); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "0.4rem 0.6rem", border: "none",
                          background: d === selectedDate ? "var(--adm-mint)" : "transparent",
                          color: d === selectedDate ? "#061814" : "#fff",
                          borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer"
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <h3 className="adm-card__title">Schedule</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="adm-card__more"
                  title="Add Schedule Item"
                  style={{ color: "var(--adm-mint)" }}
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setActiveCardMenu(activeCardMenu === "schedule" ? null : "schedule")}
                  className="adm-card__more"
                >
                  <MoreHorizontal size={16} />
                </button>
                {activeCardMenu === "schedule" && (
                  <div style={{
                    position: "absolute", top: 40, right: 10, zIndex: 30,
                    background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10,
                    padding: "0.4rem", width: 150, boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                  }}>
                    <button
                      onClick={() => { fetchInquiries(); setActiveCardMenu(null); showToast("Schedule synced!"); }}
                      style={{ width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", border: "none", background: "transparent", color: "#fff", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <RefreshCw size={13} /> Refresh
                    </button>
                    <button
                      onClick={() => { setShowAddModal(true); setActiveCardMenu(null); }}
                      style={{ width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", border: "none", background: "transparent", color: "#fff", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <Plus size={13} /> Add Item
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="adm-tabs">
              <button
                className={`adm-tab ${activeTab === "meetings" ? "adm-tab--active" : ""}`}
                onClick={() => setActiveTab("meetings")}
              >
                Meetings
              </button>
              <button
                className={`adm-tab ${activeTab === "tasks" ? "adm-tab--active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                Tasks
              </button>
              <button
                className={`adm-tab ${activeTab === "events" ? "adm-tab--active" : ""}`}
                onClick={() => setActiveTab("events")}
              >
                Events
              </button>
            </div>

            {/* Render Filtered Schedule Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 180 }}>
              {filteredSchedule.length === 0 ? (
                <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--adm-text-sub)", fontSize: "0.82rem" }}>
                  No {activeTab} scheduled for this period.
                </div>
              ) : filteredSchedule.map((item) => (
                <div key={item.id} className="adm-task-item" style={{ marginBottom: 0 }}>
                  <div className="adm-task-item__head">
                    <div>
                      <h4 className="adm-task-item__title">{item.title}</h4>
                      <p className="adm-task-item__sub">{item.subtitle}</p>
                    </div>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="adm-task-item__badge"
                        title="Join Google Meet"
                      >
                        <Video size={12} />
                      </a>
                    ) : (
                      <div className="adm-task-item__badge" style={{ background: "rgba(255,255,255,0.06)", color: "#fff", borderColor: "rgba(255,255,255,0.15)" }}>
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </div>
                  <div className="adm-task-item__foot">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "10px", color: "var(--adm-mint)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                      >
                        {item.type} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "10px" }}>
                        {item.type}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, color: "#fff" }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Average Team KPI (Line Chart) */}
          <div className="adm-card" style={{ position: "relative" }}>
            <div className="adm-card__head">
              <div>
                <div className="adm-kpi-val">
                  70,32% <ArrowUpRight size={18} color="var(--adm-mint)" />
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--adm-text-sub)", fontWeight: 600 }}>
                  Average Team KPI
                </div>
              </div>
              <button
                onClick={() => setActiveCardMenu(activeCardMenu === "kpi" ? null : "kpi")}
                className="adm-card__more"
              >
                <MoreHorizontal size={16} />
              </button>
              {activeCardMenu === "kpi" && (
                <div style={{
                  position: "absolute", top: 40, right: 10, zIndex: 30,
                  background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10,
                  padding: "0.4rem", width: 150, boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}>
                  <Link
                    href={`/${ADMIN_PATH}/analytics`}
                    style={{ width: "100%", textAlign: "left", padding: "0.45rem 0.6rem", border: "none", background: "transparent", color: "#fff", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}
                  >
                    <ArrowUpRight size={13} /> Full Analytics
                  </Link>
                </div>
              )}
            </div>

            {/* SVG Line Chart */}
            <div className="adm-chart-wrap">
              <svg viewBox="0 0 300 120" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <defs>
                  <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D294" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00D294" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <path
                  d="M 0 100 L 0 80 Q 50 90 100 65 T 200 40 T 300 70 L 300 110 L 0 110 Z"
                  fill="url(#kpiGrad)"
                />
                <path
                  d="M 0 80 Q 50 90 100 65 T 200 40 T 300 70"
                  fill="none"
                  stroke="#00D294"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--adm-text-muted)", fontWeight: 600, marginBottom: "1rem" }}>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>

            {/* Quick Metric Badges */}
            <div className="adm-badges-grid">
              <div className="adm-badge-box" style={{ cursor: "pointer" }} onClick={() => showToast("Annual Leave: 12 Days remaining")}>
                <div className="adm-badge-box__top">Annual <ArrowUpRight size={10} color="var(--adm-mint)" /></div>
                <div className="adm-badge-box__val">12 Days</div>
              </div>
              <div className="adm-badge-box" style={{ cursor: "pointer" }} onClick={() => showToast("Monthly Leave: 2 Days remaining")}>
                <div className="adm-badge-box__top">Monthly <ArrowUpRight size={10} color="var(--adm-mint)" /></div>
                <div className="adm-badge-box__val">2 Days</div>
              </div>
              <div className="adm-badge-box" style={{ cursor: "pointer" }} onClick={() => showToast("Daily Hours: 8 Hours logged")}>
                <div className="adm-badge-box__top">Daily <ArrowUpRight size={10} color="var(--adm-mint)" /></div>
                <div className="adm-badge-box__val">8 Days</div>
              </div>
              <div className="adm-badge-box" style={{ cursor: "pointer" }} onClick={() => showToast("Hourly Average: 6 Hours")}>
                <div className="adm-badge-box__top">Hourly <ArrowUpRight size={10} color="var(--adm-mint)" /></div>
                <div className="adm-badge-box__val">6 Days</div>
              </div>
              <div className="adm-badge-box" style={{ cursor: "pointer" }} onClick={() => showToast("Sick Leave: 5 Days allocated")}>
                <div className="adm-badge-box__top">Sick <ArrowUpRight size={10} color="var(--adm-mint)" /></div>
                <div className="adm-badge-box__val">5 Days</div>
              </div>
            </div>
          </div>

          {/* Column 3: Employment Status (Bar Chart) */}
          <div className="adm-card">
            <div className="adm-card__head">
              <div>
                <h3 className="adm-card__title">Employment Status</h3>
                <div style={{ fontSize: "0.78rem", color: "var(--adm-text-sub)", marginTop: "0.2rem" }}>
                  <strong style={{ color: "#fff" }}>450</strong> Active Employee
                </div>
              </div>
              <button className="adm-card__more"><MoreHorizontal size={16} /></button>
            </div>

            <div className="adm-bars-wrap">
              <div className="adm-bar-col" style={{ cursor: "pointer" }} onClick={() => showToast("Permanent: 450 Active Employees")}>
                <div className="adm-bar-val">450</div>
                <div className="adm-bar-fill" style={{ height: "85%", background: "#00D294" }} />
                <div className="adm-bar-lbl">Permanent</div>
              </div>
              <div className="adm-bar-col" style={{ cursor: "pointer" }} onClick={() => showToast("Contract: 300 Active Contractors")}>
                <div className="adm-bar-val">300</div>
                <div className="adm-bar-fill" style={{ height: "60%", background: "#1b2942" }} />
                <div className="adm-bar-lbl">Contract</div>
              </div>
              <div className="adm-bar-col" style={{ cursor: "pointer" }} onClick={() => showToast("Probation: 150 In Review")}>
                <div className="adm-bar-val">150</div>
                <div className="adm-bar-fill" style={{ height: "35%", background: "#162338" }} />
                <div className="adm-bar-lbl">Probation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Data Table */}
        <div className="adm-table-card">
          <div className="adm-table-head">
            <h3 className="adm-card__title">List Employee / Inquiries</h3>
            <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
              <div className="adm-table-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <button
                className="adm-icon-btn"
                style={{ width: 34, height: 34 }}
                title="Export CSV"
                onClick={exportDataToCSV}
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMPLOYEE ID</th>
                  <th>ROLE</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>DEPARTMENT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={row._id} style={{ position: "relative" }}>
                    <td>
                      <div className="adm-cell-user">
                        <div className="adm-cell-avatar">
                          {row.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="adm-cell-name">{row.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--adm-text-sub)" }}>
                      {row.company || `3644${idx}65346`}
                    </td>
                    <td>{row.inquiryType === "talk-to-engineer" ? "UI Mentor" : "UX Researcher"}</td>
                    <td style={{ color: "var(--adm-text-sub)" }}>{row.email || "example@gmail.com"}</td>
                    <td>
                      <span className={`adm-status-pill ${row.status === "replied" ? "adm-status-pill--replied" : "adm-status-pill--active"}`}>
                        {row.status === "new" ? "Active" : row.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--adm-text-sub)" }}>{row.createdAt.split("T")[0]}</td>
                    <td style={{ color: "#fff", fontWeight: 600 }}>Team Project</td>
                    <td style={{ position: "relative" }}>
                      <button
                        className="adm-card__more"
                        onClick={() => setActiveRowMenu(activeRowMenu === row._id ? null : row._id)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {activeRowMenu === row._id && (
                        <div style={{
                          position: "absolute", top: 35, right: 10, zIndex: 40,
                          background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10,
                          padding: "0.4rem", width: 140, boxShadow: "0 10px 25px rgba(0,0,0,0.6)"
                        }}>
                          <button
                            onClick={() => router.push(`/${ADMIN_PATH}/inquiries`)}
                            style={{ width: "100%", textAlign: "left", padding: "0.4rem 0.6rem", border: "none", background: "transparent", color: "#fff", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <Eye size={13} /> View Detail
                          </button>
                          <button
                            onClick={() => handleMarkRead(row._id)}
                            style={{ width: "100%", textAlign: "left", padding: "0.4rem 0.6rem", border: "none", background: "transparent", color: "#fff", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <Check size={13} /> Mark Read
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row._id)}
                            style={{ width: "100%", textAlign: "left", padding: "0.4rem 0.6rem", border: "none", background: "transparent", color: "#ff8a97", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setShowCalendarModal(false)}>
          <div style={{
            background: "#121B2D", border: "1px solid var(--adm-border)",
            borderRadius: 18, padding: "1.75rem", width: "90%", maxWidth: 500,
            boxShadow: "0 24px 60px rgba(0,0,0,0.7)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                <CalendarDays size={20} color="var(--adm-mint)" /> Calendar & Schedule
              </div>
              <button onClick={() => setShowCalendarModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ background: "#162338", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem", textAlign: "center", fontSize: "0.75rem", color: "var(--adm-text-sub)", fontWeight: 700, marginBottom: "0.75rem" }}>
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem", textAlign: "center" }}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    style={{
                      padding: "0.4rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
                      background: day === 11 ? "var(--adm-mint)" : "rgba(255,255,255,0.03)",
                      color: day === 11 ? "#061814" : "#fff",
                      cursor: "pointer"
                    }}
                    onClick={() => { setSelectedDate(`${day} Nov 2024`); setShowCalendarModal(false); showToast(`Date filter set to ${day} Nov 2024`); }}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
            <button
              className="adm-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setShowCalendarModal(false); setShowAddModal(true); }}
            >
              <Plus size={16} /> Add Event to Selected Date
            </button>
          </div>
        </div>
      )}

      {/* Add Task/Event Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateTask} style={{
            background: "#121B2D", border: "1px solid var(--adm-border)",
            borderRadius: 18, padding: "1.75rem", width: "90%", maxWidth: 440,
            boxShadow: "0 24px 60px rgba(0,0,0,0.7)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Add Schedule Item</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <label style={{ display: "block", marginBottom: "0.9rem" }}>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-sub)", marginBottom: "0.3rem" }}>Title</span>
              <input
                type="text"
                required
                placeholder="e.g. Design Review Sync"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 0.9rem", background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10, color: "#fff", outline: "none" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.9rem" }}>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-sub)", marginBottom: "0.3rem" }}>Subtitle / Dept</span>
              <input
                type="text"
                placeholder="e.g. Engineering Team"
                value={newTaskSub}
                onChange={e => setNewTaskSub(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 0.9rem", background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10, color: "#fff", outline: "none" }}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1.25rem" }}>
              <label>
                <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-sub)", marginBottom: "0.3rem" }}>Time</span>
                <input
                  type="text"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.9rem", background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10, color: "#fff", outline: "none" }}
                />
              </label>
              <label>
                <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-sub)", marginBottom: "0.3rem" }}>Category</span>
                <select
                  value={newTaskCat}
                  onChange={e => setNewTaskCat(e.target.value as "meetings" | "tasks" | "events")}
                  style={{ width: "100%", padding: "0.7rem 0.9rem", background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 10, color: "#fff", outline: "none" }}
                >
                  <option value="meetings">Meetings</option>
                  <option value="tasks">Tasks</option>
                  <option value="events">Events</option>
                </select>
              </label>
            </div>
            <button type="submit" className="adm-btn" style={{ width: "100%", justifyContent: "center" }}>
              <Plus size={16} /> Save to Schedule
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
