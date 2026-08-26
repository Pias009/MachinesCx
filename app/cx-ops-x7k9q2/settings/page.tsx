"use client";

import { useEffect, useState } from "react";
import {
  KeyRound, Mail, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
  UserPlus, Users, Copy, Lock, RefreshCw, Trash2, Eye, EyeOff, ShieldAlert, Sparkles, ExternalLink
} from "lucide-react";
import AdminShell from "../AdminShell";
import { AdminRole, AdminUser, MagicLinkInvitation, SecurityAuditItem } from "@/lib/adminRoles";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem", borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#fff", fontFamily: "var(--ff-body)", fontSize: "0.92rem",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--ff-body)", fontSize: "0.82rem", fontWeight: 600,
  color: "rgba(255,255,255,0.75)", marginBottom: "0.35rem",
};

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

function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  const ok = kind === "ok";
  return (
    <div role={ok ? "status" : "alert"} className="adm-rise" style={{
      display: "flex", alignItems: "flex-start", gap: "0.6rem",
      fontFamily: "var(--ff-body)", fontSize: "0.88rem",
      color: ok ? "#6fe3b4" : "#ff8a97",
      background: ok ? "rgba(43,191,179,0.12)" : "rgba(255,107,125,0.12)",
      border: ok ? "1px solid rgba(43,191,179,0.3)" : "1px solid rgba(255,107,125,0.3)",
      borderRadius: 10, padding: "0.75rem 1rem", marginTop: "1rem", lineHeight: 1.5,
    }}>
      {ok ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
      <span>{children}</span>
    </div>
  );
}

// ── 1. GMAIL MAGIC LINK INVITATION CARD ──────────────────────────────────────
function GmailMagicLinkCard({ onInviteSuccess }: { onInviteSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("content_editor");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [generatedLinkData, setGeneratedLinkData] = useState<{ magicLink: string; tempPassword: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedOnlyLink, setCopiedOnlyLink] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setGeneratedLinkData(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", email: email.trim(), name: name.trim(), role }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ kind: "error", text: j.error || "Failed to generate magic link" });
        return;
      }

      setGeneratedLinkData({
        magicLink: j.magicLink,
        tempPassword: j.tempPassword,
        email: email.trim(),
      });
      setMsg({ kind: "ok", text: `Gmail Magic Link & temporary password created for ${email}` });
      setEmail("");
      setName("");
      onInviteSuccess();
    } catch {
      setMsg({ kind: "error", text: "Network error generating invitation" });
    } finally {
      setBusy(false);
    }
  }

  function copyToClipboard() {
    if (!generatedLinkData) return;
    const fullText = `Ashal Innomech Ops Invitation:\nMagic Link: ${generatedLinkData.magicLink}\nTemporary Password: ${generatedLinkData.tempPassword}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyLinkOnly() {
    if (!generatedLinkData) return;
    navigator.clipboard.writeText(generatedLinkData.magicLink);
    setCopiedOnlyLink(true);
    setTimeout(() => setCopiedOnlyLink(false), 2000);
  }

  const [showLinkPass, setShowLinkPass] = useState(false);

  return (
    <form onSubmit={submit} className="adm-panel adm-rise" style={{ padding: "1.75rem", flex: 1, minWidth: 320 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(13,148,136,0.18)", color: "#5eead4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <UserPlus size={20} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.15rem", color: "#fff", fontWeight: 700 }}>
            Gmail Magic Link Invitation
          </div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            Generates a magic link with a temporary password for new team members
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "0.35rem" }}>
            Gmail / Member Email Address
          </label>
          <input
            type="email"
            required
            placeholder="member@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", outline: "none", fontSize: "0.9rem"
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "0.35rem" }}>
            Full Name / Label (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Sarah Content Manager"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", outline: "none", fontSize: "0.9rem"
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "0.35rem" }}>
            Assigned CMS Role
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
            style={{
              width: "100%", padding: "0.65rem 0.85rem", borderRadius: 10,
              background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", outline: "none", fontSize: "0.9rem"
            }}
          >
            <option value="content_editor">Content Editor (Manage Products & Specs)</option>
            <option value="machine_manager">Machine Manager (Catalogue & Models)</option>
            <option value="analytics_viewer">Analytics Viewer (Read-only Telemetry)</option>
            <option value="super_admin">Super Admin (Full Platform Control)</option>
          </select>
        </div>

        <button type="submit" disabled={busy} className="adm-btn" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
          {busy ? <Loader2 size={16} className="adm-spin-icon" /> : <Sparkles size={16} />}
          {busy ? "Generating Magic Link..." : "Create Gmail Magic Link & Temp Pass"}
        </button>
      </div>

      {generatedLinkData && (
        <div style={{
          marginTop: "1.25rem", padding: "1.1rem", borderRadius: 12,
          background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.3)",
          display: "flex", flexDirection: "column", gap: "0.6rem"
        }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#5eead4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ⚡ Magic Link Ready to Send
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", wordBreak: "break-all" }}>
            <strong>Magic Link:</strong> <a href={generatedLinkData.magicLink} target="_blank" rel="noopener noreferrer" style={{ color: "#5eead4", fontFamily: "var(--ff-mono)", textDecoration: "underline" }}>{generatedLinkData.magicLink}</a>
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <strong>Temporary Password:</strong>
            <span style={{ color: "#f5c451", fontFamily: "var(--ff-mono)", fontWeight: 700 }}>
              {showLinkPass ? generatedLinkData.tempPassword : "••••••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setShowLinkPass(!showLinkPass)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "0 0.2rem" }}
            >
              {showLinkPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
            <button
              type="button"
              onClick={copyLinkOnly}
              style={{
                padding: "0.5rem 0.85rem", borderRadius: 8, background: "#0d9488", border: "none",
                color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "0.4rem"
              }}
            >
              {copiedOnlyLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copiedOnlyLink ? "URL Copied!" : "Copy Link URL Only"}
            </button>
            <a
              href={generatedLinkData.magicLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.5rem 0.85rem", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "0.4rem"
              }}
            >
              <ExternalLink size={14} /> Open Invitation Page
            </a>
          </div>
        </div>
      )}

      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    </form>
  );
}

// ── 2. TEAM MEMBERS & ROLE MANAGEMENT TABLE ──────────────────────────────────
function UserRoleManagementTable({ users, invitations, onRefresh }: { users: AdminUser[]; invitations: MagicLinkInvitation[]; onRefresh: () => void }) {
  const [editingTempPassUser, setEditingTempPassUser] = useState<AdminUser | null>(null);
  const [newTempPass, setNewTempPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [tempPassResult, setTempPassResult] = useState<string | null>(null);
  const [revealedPasses, setRevealedPasses] = useState<Record<string, boolean>>({});
  const [showModalPass, setShowModalPass] = useState(false);
  const [showResultPass, setShowResultPass] = useState(false);

  async function handleRoleChange(userId: string, newRole: AdminRole) {
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_role", userId, newRole }),
      });
      if (res.ok) onRefresh();
    } catch {
      alert("Failed to update role");
    }
  }

  async function handleRevoke(userId: string, email: string) {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_user", userId, email }),
      });
      if (res.ok) onRefresh();
      else {
        const j = await res.json();
        alert(j.error || "Failed to revoke user");
      }
    } catch {
      alert("Failed to revoke user");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTempPassUser) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_temp_password",
          userId: editingTempPassUser.id,
          newTempPassword: newTempPass.trim(),
        }),
      });
      const j = await res.json();
      if (res.ok) {
        setTempPassResult(j.tempPassword);
        onRefresh();
      } else {
        alert(j.error || "Failed to reset password");
      }
    } catch {
      alert("Failed to reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-panel adm-rise" style={{ padding: "1.75rem", flex: 2, minWidth: 420 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.18)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.15rem", color: "#fff", fontWeight: 700 }}>
              Team Roles & Access Control
            </div>
            <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
              Manage member roles, temporary passwords, and active permissions
            </div>
          </div>
        </div>
        <button type="button" onClick={onRefresh} style={{ background: "none", border: "none", color: "var(--brand-teal)", cursor: "pointer" }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <th style={{ padding: "0.75rem 0.5rem" }}>Member / Gmail</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>System Role</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "0.85rem 0.5rem" }}>
                  <div style={{ fontWeight: 700, color: "#fff" }}>{u.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--ff-mono)" }}>{u.email}</div>
                  {u.tempPassword && (
                    <div style={{ fontSize: "0.72rem", color: "#f5c451", fontFamily: "var(--ff-mono)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>Temp Pass: {revealedPasses[u.id] ? u.tempPassword : "••••••••••••"}</span>
                      <button
                        type="button"
                        onClick={() => setRevealedPasses(p => ({ ...p, [u.id]: !p[u.id] }))}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0 }}
                      >
                        {revealedPasses[u.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  )}
                </td>
                <td style={{ padding: "0.85rem 0.5rem" }}>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as AdminRole)}
                    style={{
                      padding: "0.35rem 0.6rem", borderRadius: 8,
                      background: "rgba(0,0,0,0.3)", border: `1px solid ${roleBadgeColors[u.role]}`,
                      color: roleBadgeColors[u.role], fontWeight: 700, fontSize: "0.8rem", outline: "none"
                    }}
                  >
                    <option value="super_admin" style={{ background: "#09090b", color: "#fff" }}>Super Admin</option>
                    <option value="content_editor" style={{ background: "#09090b", color: "#fff" }}>Content Editor</option>
                    <option value="machine_manager" style={{ background: "#09090b", color: "#fff" }}>Machine Manager</option>
                    <option value="analytics_viewer" style={{ background: "#09090b", color: "#fff" }}>Analytics Viewer</option>
                  </select>
                </td>
                <td style={{ padding: "0.85rem 0.5rem" }}>
                  {u.status === "active" ? (
                    <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: 999, background: "rgba(43,191,179,0.15)", color: "#5eead4", border: "1px solid rgba(43,191,179,0.3)", fontWeight: 700 }}>
                      ● Active
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: 999, background: "rgba(245,196,81,0.15)", color: "#f5c451", border: "1px solid rgba(245,196,81,0.3)", fontWeight: 700 }}>
                      ⚡ Invited
                    </span>
                  )}
                </td>
                <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => { setEditingTempPassUser(u); setNewTempPass(""); setTempPassResult(null); }}
                      title="Reset temporary password"
                      style={{ padding: "0.35rem 0.6rem", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", fontSize: "0.78rem" }}
                    >
                      <KeyRound size={14} />
                    </button>
                    {u.role !== "super_admin" && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(u.id, u.email)}
                        title="Revoke access"
                        style={{ padding: "0.35rem 0.6rem", borderRadius: 6, background: "rgba(255,107,125,0.15)", border: "1px solid rgba(255,107,125,0.3)", color: "#ff8a97", cursor: "pointer", fontSize: "0.78rem" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      {editingTempPassUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem"
        }} onClick={() => setEditingTempPassUser(null)}>
          <div style={{
            background: "#121b2d", border: "1px solid var(--adm-border)",
            borderRadius: 20, padding: "1.75rem", maxWidth: 440, width: "100%",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8)"
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: "#fff", margin: "0 0 0.5rem" }}>
              Reset Password for {editingTempPassUser.name}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", margin: "0 0 1.25rem" }}>
              Set a new password or generate a temporary password for <strong>{editingTempPassUser.email}</strong>.
            </p>

            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <span style={labelStyle}>New Password / Temp Password</span>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    type={showModalPass ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={newTempPass}
                    onChange={e => setNewTempPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPass(!showModalPass)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "0.2rem"
                    }}
                  >
                    {showModalPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tempPassResult && (
                <div style={{ padding: "0.75rem", borderRadius: 10, background: "rgba(43,191,179,0.15)", border: "1px solid rgba(43,191,179,0.3)", color: "#5eead4", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong>Password Reset Successful!</strong><br />
                    New Password: <code style={{ fontFamily: "var(--ff-mono)", fontWeight: 700 }}>{showResultPass ? tempPassResult : "••••••••••••"}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResultPass(!showResultPass)}
                    style={{ background: "none", border: "none", color: "#5eead4", cursor: "pointer", padding: "0.25rem" }}
                  >
                    {showResultPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setEditingTempPassUser(null)} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", cursor: "pointer" }}>
                  Done
                </button>
                <button type="submit" disabled={busy} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "var(--brand-teal)", border: "none", color: "#04211e", fontWeight: 700, cursor: "pointer" }}>
                  {busy ? "Resetting..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 3. SECURITY AUDIT LOG ──────────────────────────────────────────────────
function SecurityAuditLogTable({ auditLog }: { auditLog: SecurityAuditItem[] }) {
  return (
    <div className="adm-panel adm-rise" style={{ padding: "1.75rem", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(168,85,247,0.18)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.15rem", color: "#fff", fontWeight: 700 }}>
            Security Audit Trail
          </div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            Real-time record of admin invitations, role changes, and system events
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <th style={{ padding: "0.6rem 0.5rem" }}>Timestamp</th>
              <th style={{ padding: "0.6rem 0.5rem" }}>Actor</th>
              <th style={{ padding: "0.6rem 0.5rem" }}>Security Event</th>
              <th style={{ padding: "0.6rem 0.5rem" }}>Event Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.65rem 0.5rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--ff-mono)", fontSize: "0.75rem" }}>
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 700, color: "#fff" }}>
                  {item.actor}
                </td>
                <td style={{ padding: "0.65rem 0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#5eead4", fontWeight: 700, fontFamily: "var(--ff-mono)" }}>
                    {item.action}
                  </span>
                </td>
                <td style={{ padding: "0.65rem 0.5rem", color: "rgba(255,255,255,0.75)" }}>
                  {item.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MAIN ADMIN SETTINGS & PRIVACY PAGE ───────────────────────────────────────
export default function AdminSettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<MagicLinkInvitation[]>([]);
  const [auditLog, setAuditLog] = useState<SecurityAuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  function loadRolesData() {
    fetch("/api/admin/roles")
      .then(r => r.json())
      .then(j => {
        if (Array.isArray(j.users)) setUsers(j.users);
        if (Array.isArray(j.invitations)) setInvitations(j.invitations);
        if (Array.isArray(j.auditLog)) setAuditLog(j.auditLog);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRolesData();
  }, []);

  return (
    <AdminShell>
      <div className="adm-page-head adm-rise">
        <div className="adm-page-head__eyebrow">
          <ShieldCheck size={13} />
          Privacy, Access Control & Security
        </div>
        <h1 className="adm-page-head__title">Admin Roles & Permissions</h1>
        <p className="adm-page-head__sub">
          Manage member access, create Gmail Magic Link invitations with temporary passwords,
          update role privileges, and inspect the real-time security audit log.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", marginTop: "1.5rem" }}>
        {/* Top Grid: Invitation Generator + User Role Table */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <GmailMagicLinkCard onInviteSuccess={loadRolesData} />
          <UserRoleManagementTable users={users} invitations={invitations} onRefresh={loadRolesData} />
        </div>

        {/* Security Audit Log */}
        <SecurityAuditLogTable auditLog={auditLog} />
      </div>
    </AdminShell>
  );
}
