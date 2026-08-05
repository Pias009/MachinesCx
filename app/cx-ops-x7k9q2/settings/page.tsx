"use client";
import { useEffect, useState } from "react";
import { KeyRound, Mail, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AdminShell from "../AdminShell";

const input: React.CSSProperties = {
  width: "100%", padding: "0.85rem 1rem", borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontFamily: "var(--ff-body)", fontSize: "0.95rem",
  outline: "none",
};
const label: React.CSSProperties = {
  display: "block", fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 600,
  color: "rgba(255,255,255,0.75)", marginBottom: "0.4rem",
};

function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  const ok = kind === "ok";
  return (
    <div role={ok ? "status" : "alert"} className="adm-rise" style={{
      display: "flex", alignItems: "flex-start", gap: "0.6rem",
      fontFamily: "var(--ff-body)", fontSize: "0.88rem",
      color: ok ? "#6fe3b4" : "#ff8a97",
      background: ok ? "rgba(43,191,179,0.1)" : "rgba(255,107,125,0.1)",
      borderRadius: 10, padding: "0.75rem 1rem", marginTop: "1rem", lineHeight: 1.5,
    }}>
      {ok ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
      <span>{children}</span>
    </div>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) { setMsg({ kind: "error", text: "New password and confirmation don't match" }); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg({ kind: "error", text: j.error ?? "Couldn't change password" }); return; }
      setMsg({ kind: "ok", text: "Password updated." });
      setCurrent(""); setNext(""); setConfirm("");
    } catch {
      setMsg({ kind: "error", text: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="adm-panel adm-rise" style={{ padding: "1.75rem", maxWidth: 440 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.25rem" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(43,191,179,0.13)", color: "var(--brand-teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <KeyRound size={18} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", color: "#fff" }}>Change password</div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Requires your current password</div>
        </div>
      </div>

      <label style={{ display: "block", marginBottom: "0.9rem" }}>
        <span style={label}>Current password</span>
        <input style={input} type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} required />
      </label>
      <label style={{ display: "block", marginBottom: "0.9rem" }}>
        <span style={label}>New password</span>
        <input style={input} type="password" autoComplete="new-password" minLength={10} value={next} onChange={e => setNext(e.target.value)} required />
      </label>
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={label}>Confirm new password</span>
        <input style={input} type="password" autoComplete="new-password" minLength={10} value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </label>

      <button type="submit" disabled={busy} className="adm-btn" style={{ width: "100%", justifyContent: "center" }}>
        {busy ? <Loader2 size={16} className="adm-spin-icon" /> : <ShieldCheck size={16} />}
        {busy ? "Updating…" : "Update password"}
      </button>

      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    </form>
  );
}

function EmailCard() {
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/email").then(r => r.json()).then(j => setCurrentEmail(j.email ?? null)).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newEmail }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg({ kind: "error", text: j.error ?? "Couldn't start the email change" }); return; }
      setMsg({ kind: "ok", text: `Confirmation link sent to ${newEmail}. The sign-in email won't change until you open that link.` });
      setPassword(""); setNewEmail("");
    } catch {
      setMsg({ kind: "error", text: "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="adm-panel adm-rise" style={{ padding: "1.75rem", maxWidth: 440 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.25rem" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(43,191,179,0.13)", color: "var(--brand-teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Mail size={18} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", color: "#fff" }}>Change admin email</div>
          <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            {currentEmail ? <>Currently <strong style={{ color: "rgba(255,255,255,0.75)" }}>{currentEmail}</strong></> : "Loading current email…"}
          </div>
        </div>
      </div>

      <label style={{ display: "block", marginBottom: "0.9rem" }}>
        <span style={label}>Current password</span>
        <input style={input} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={label}>New email address</span>
        <input style={input} type="email" autoComplete="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
      </label>

      <button type="submit" disabled={busy} className="adm-btn" style={{ width: "100%", justifyContent: "center" }}>
        {busy ? <Loader2 size={16} className="adm-spin-icon" /> : <Mail size={16} />}
        {busy ? "Sending…" : "Send confirmation link"}
      </button>

      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    </form>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <div className="adm-page-head adm-rise">
        <div className="adm-page-head__eyebrow">
          <ShieldCheck size={13} />
          Account security
        </div>
        <h1 className="adm-page-head__title">Settings</h1>
        <p className="adm-page-head__sub">
          There is one admin account for this site. Changing the password takes effect immediately;
          changing the email requires confirming a link sent to the new address first, so the account
          can never be handed to an address you don&apos;t control by mistake.
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
        <PasswordCard />
        <EmailCard />
      </div>
    </AdminShell>
  );
}
