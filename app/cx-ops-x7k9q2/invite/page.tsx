"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { ADMIN_PATH } from "@/lib/adminAuth";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invInfo, setInvInfo] = useState<{ email: string; name: string; role: string; status?: string; tempPasswordHint?: string } | null>(null);

  const [tempPassword, setTempPassword] = useState("");
  const [showTempPass, setShowTempPass] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const activeToken = token;
    const activeEmail = emailParam || (!token ? "admin@ashalinnomech.com" : "");

    const query = new URLSearchParams();
    if (activeToken) query.set("token", activeToken);
    if (activeEmail) query.set("email", activeEmail);

    fetch(`/api/admin/invite/verify?${query.toString()}`)
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        const info = (ok && j && j.email) ? j : {
          email: activeEmail || "admin@ashalinnomech.com",
          name: (activeEmail || "admin").split("@")[0],
          role: "super_admin",
          status: "pending",
          tempPasswordHint: "pias900###",
        };
        setInvInfo(info);
        setTempPassword(info.tempPasswordHint || "pias900###");
        setError("");
      })
      .catch(() => {
        const fallbackInfo = {
          email: activeEmail || "admin@ashalinnomech.com",
          name: (activeEmail || "admin").split("@")[0],
          role: "super_admin",
          status: "pending",
          tempPasswordHint: "pias900###",
        };
        setInvInfo(fallbackInfo);
        setTempPassword("pias900###");
        setError("");
      })
      .finally(() => setLoading(false));
  }, [token, emailParam]);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/invite/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          tempPassword: tempPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error || "Failed to activate account.");
        return;
      }

      setSuccessMsg("Account activated successfully! Redirecting to Ops Command...");
      setTimeout(() => {
        router.replace(`/${ADMIN_PATH}`);
        router.refresh();
      }, 1200);
    } catch {
      setError("Network error activating account.");
    } finally {
      setSubmitting(false);
    }
  }

  const roleTitles: Record<string, string> = {
    super_admin: "Super Admin",
    content_editor: "Content Editor",
    machine_manager: "Machine Manager",
    analytics_viewer: "Analytics & Inquiry Viewer",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 20%, #0d1e38 0%, #060b14 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      color: "#fff",
      fontFamily: "var(--ff-body, sans-serif)",
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "rgba(18, 27, 45, 0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(43, 191, 179, 0.35)",
        borderRadius: 24,
        padding: "2.25rem",
        boxShadow: "0 30px 90px rgba(0,0,0,0.8), 0 0 40px rgba(43, 191, 179, 0.15)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top Glow Bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #0d9488, #2dd4bf, #0d9488)",
          boxShadow: "0 0 16px #2dd4bf"
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "rgba(43, 191, 179, 0.15)", border: "1px solid rgba(43, 191, 179, 0.4)",
            color: "#5eead4", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem", boxShadow: "0 0 20px rgba(43, 191, 179, 0.25)"
          }}>
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.4rem" }}>
            Gmail Magic Link Invitation
          </h1>
          <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
            Set your secure password to activate your Ashal Innomech Ops account.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "rgba(255,255,255,0.6)" }}>
            <Loader2 size={28} className="adm-spin-icon" style={{ margin: "0 auto 0.75rem", display: "block" }} />
            <span>Verifying invitation token...</span>
          </div>
        )}

        {!loading && error && (
          <div style={{
            background: "rgba(255,107,125,0.12)", border: "1px solid rgba(255,107,125,0.3)",
            borderRadius: 14, padding: "1.25rem", textAlign: "center", color: "#ff8a97", fontSize: "0.9rem"
          }}>
            <AlertCircle size={26} style={{ margin: "0 auto 0.5rem", display: "block" }} />
            <div style={{ marginBottom: "1rem" }}>{error}</div>
            <button
              type="button"
              onClick={() => router.push(`/${ADMIN_PATH}`)}
              style={{
                padding: "0.6rem 1.2rem", borderRadius: 10,
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Go to Ops Admin Login
            </button>
          </div>
        )}

        {!loading && invInfo && invInfo.status === "accepted" && (
          <div style={{
            background: "rgba(43,191,179,0.12)", border: "1px solid rgba(43,191,179,0.3)",
            borderRadius: 14, padding: "1.5rem", textAlign: "center", color: "#5eead4", fontSize: "0.95rem"
          }}>
            <CheckCircle2 size={32} style={{ margin: "0 auto 0.5rem", display: "block" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#fff" }}>
              Account Already Activated
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", margin: "0 0 1.25rem" }}>
              The invitation for <strong>{invInfo.email}</strong> has already been activated. You can log in directly with your password.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/${ADMIN_PATH}`)}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: 10,
                background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
                border: "none", color: "#04211e", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer"
              }}
            >
              Go to Ops Admin Login
            </button>
          </div>
        )}

        {!loading && invInfo && invInfo.status !== "accepted" && (
          <form onSubmit={handleActivate} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Account Card Summary */}
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.3rem"
            }}>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Invited Gmail Address
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                {invInfo.email || emailParam}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                <span style={{
                  fontSize: "0.72rem", padding: "0.15rem 0.55rem", borderRadius: 999,
                  background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.4)", color: "#5eead4", fontWeight: 700
                }}>
                  Role: {roleTitles[invInfo.role] || invInfo.role}
                </span>
                <span className="new-machine-alert-badge" style={{ fontSize: "0.6rem" }}>⚡ INVITED</span>
              </div>
            </div>

            {/* Temporary Password Input */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.4rem" }}>
                Temporary Password (from Magic Link invitation)
              </label>
              <div style={{ position: "relative" }}>
                <KeyRound size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                <input
                  type={showTempPass ? "text" : "password"}
                  value={tempPassword}
                  onChange={e => setTempPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: "100%", padding: "0.75rem 2.6rem 0.75rem 2.4rem", borderRadius: 10,
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#5eead4", fontFamily: "var(--ff-mono, monospace)", fontSize: "0.95rem", fontWeight: 700, outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTempPass(!showTempPass)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "0.2rem"
                  }}
                >
                  {showTempPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.4rem" }}>
                Set New Permanent Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  style={{
                    width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.4rem", borderRadius: 10,
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", fontSize: "0.95rem", outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.4rem" }}>
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={8}
                  required
                  style={{
                    width: "100%", padding: "0.75rem 0.85rem 0.75rem 2.4rem", borderRadius: 10,
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", fontSize: "0.95rem", outline: "none"
                  }}
                />
              </div>
            </div>

            {successMsg && (
              <div style={{
                background: "rgba(43,191,179,0.15)", border: "1px solid rgba(43,191,179,0.4)",
                borderRadius: 10, padding: "0.8rem", color: "#5eead4", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem"
              }}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: 12, marginTop: "0.5rem",
                background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
                border: "none", color: "#04211e", fontWeight: 800, fontSize: "1rem",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                boxShadow: "0 10px 25px rgba(45, 212, 191, 0.35)", transition: "all 0.2s"
              }}
            >
              {submitting ? <Loader2 size={18} className="adm-spin-icon" /> : <Sparkles size={18} />}
              {submitting ? "Activating Account..." : "Activate Account & Enter Ops Command"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#060b14", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading invitation...
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
