"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_PATH } from "@/lib/adminAuth";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.replace(`/${ADMIN_PATH}`);
        router.refresh();
        return;
      }
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Login failed");
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.1rem", borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", fontFamily: "var(--ff-body)", fontSize: "1rem",
    outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#000", padding: "1.5rem",
    }}>
      <form onSubmit={submit} style={{
        width: "100%", maxWidth: 400,
        background: "#000", borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "2.5rem 2.25rem",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔐</div>
        <h1 style={{
          fontFamily: "var(--ff-display)", fontSize: "2rem", color: "#fff",
          margin: "0 0 0.5rem", lineHeight: 1.1,
        }}>
          Admin sign in
        </h1>
        <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", margin: "0 0 1.75rem", lineHeight: 1.5 }}>
          Enter your details to manage the site's content.
        </p>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", fontFamily: "var(--ff-body)", fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.45rem" }}>Email</span>
          <input style={input} type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: "block", marginBottom: "1.5rem" }}>
          <span style={{ display: "block", fontFamily: "var(--ff-body)", fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.45rem" }}>Password</span>
          <input style={input} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>

        {err && (
          <div role="alert" style={{
            fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: "#ff8a97",
            background: "rgba(255,107,125,0.1)", borderRadius: 10,
            padding: "0.75rem 1rem", marginBottom: "1.25rem",
          }}>
            {err}
          </div>
        )}

        <button type="submit" disabled={busy} style={{
          width: "100%", padding: "1rem", borderRadius: 10,
          background: "var(--brand-teal)", color: "#04211e",
          border: "none", cursor: busy ? "wait" : "pointer",
          fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 700,
          opacity: busy ? 0.7 : 1,
        }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
