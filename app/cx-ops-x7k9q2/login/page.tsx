"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2, Shield
} from "lucide-react";
import { ADMIN_PATH } from "@/lib/adminAuth";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");
    setBusy(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccessMsg(`Authenticated as ${j.user?.name || "Admin"}! Redirecting…`);
        setTimeout(() => {
          router.replace(`/${ADMIN_PATH}`);
          router.refresh();
        }, 400);
        return;
      }
      setErr(j.error ?? "Login failed. Check your credentials.");
    } catch {
      setErr("Network error during sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#040911",
        position: "relative",
        overflow: "hidden",
        padding: "1.5rem",
        fontFamily: "var(--ff-body, system-ui, sans-serif)",
      }}
    >
      {/* Dynamic Animated Ambient Glow Background */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-20%",
          left: "25%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 229, 163, 0.25) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "20%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, transparent 75%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      {/* Cyber Grid Background Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Central Login Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(12, 20, 36, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 24,
          border: "1px solid rgba(43, 191, 179, 0.3)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(43, 191, 179, 0.15)",
          padding: "2.5rem 2.25rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Top Glow Bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #0d9488, #2dd4bf, #0d9488)",
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          boxShadow: "0 0 16px #2dd4bf"
        }} />

        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(43, 191, 179, 0.15)",
              border: "1px solid rgba(43, 191, 179, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5eead4",
              boxShadow: "0 0 20px rgba(43, 191, 179, 0.25)",
              margin: "0 auto 1rem",
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#fff", letterSpacing: "0.02em", marginBottom: "0.25rem" }}>
            <span style={{ color: "#ef4444", marginRight: "0.25em" }}>ASHAL</span>
            INNOMECH
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.08em" }}>
            OPS COMMAND CONSOLE — ADMIN AUTHENTICATION
          </div>
        </div>

        {/* Main Sign-In Form */}
        <form onSubmit={submit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "0.45rem" }}>
              Admin Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="email"
                required
                autoComplete="off"
                placeholder="admin@ashalinnomech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.6rem",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "0.45rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 2.8rem 0.85rem 2.6rem",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  padding: "0.2rem",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                style={{
                  fontSize: "0.85rem",
                  color: "#ff8a97",
                  background: "rgba(255,107,125,0.12)",
                  border: "1px solid rgba(255,107,125,0.3)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Lock size={15} />
                {err}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="status"
                style={{
                  fontSize: "0.85rem",
                  color: "#5eead4",
                  background: "rgba(43,191,179,0.14)",
                  border: "1px solid rgba(43,191,179,0.35)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <CheckCircle2 size={16} />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Submit Button */}
          <motion.button
            type="submit"
            disabled={busy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              padding: "0.95rem",
              borderRadius: 12,
              background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
              border: "none",
              color: "#04211e",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 8px 24px rgba(45, 212, 191, 0.35)",
              marginTop: "0.4rem",
              transition: "all 0.2s ease",
            }}
          >
            {busy ? (
              <Loader2 size={18} className="adm-spin-icon" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <ArrowRight size={18} />
            )}
            {busy ? "Authenticating Admin…" : "Sign In to Ops Command"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
