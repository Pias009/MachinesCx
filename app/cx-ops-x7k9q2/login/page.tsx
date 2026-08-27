"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, Sparkles,
  Layers, Cpu, LineChart, FileCode, CheckCircle2, UserCheck, Shield
} from "lucide-react";
import { ADMIN_PATH } from "@/lib/adminAuth";
import { AdminRole } from "@/lib/adminRoles";

interface QuickRolePreset {
  role: AdminRole;
  title: string;
  badgeColor: string;
  email: string;
  pass: string;
  icon: any;
  desc: string;
}

const ROLE_PRESETS: QuickRolePreset[] = [
  {
    role: "super_admin",
    title: "Super Admin",
    badgeColor: "#00E5A3",
    email: "admin@ashalinnomech.com",
    pass: "pias900###",
    icon: ShieldCheck,
    desc: "Full system & security control",
  },
  {
    role: "content_editor",
    title: "Content Editor",
    badgeColor: "#3b82f6",
    email: "editor@ashalinnomech.com",
    pass: "editor123",
    icon: FileCode,
    desc: "CMS content & product specs",
  },
  {
    role: "machine_manager",
    title: "Machine Manager",
    badgeColor: "#f5c451",
    email: "machine@ashalinnomech.com",
    pass: "machine123",
    icon: Cpu,
    desc: "Catalogue & technical models",
  },
  {
    role: "analytics_viewer",
    title: "Analytics Viewer",
    badgeColor: "#a855f7",
    email: "analytics@ashalinnomech.com",
    pass: "viewer123",
    icon: LineChart,
    desc: "Telemetry & inquiry pipeline",
  },
];

export default function AdminLogin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"quick_role" | "custom">("quick_role");
  const [selectedRole, setSelectedRole] = useState<AdminRole>("super_admin");
  const [email, setEmail] = useState("admin@ashalinnomech.com");
  const [password, setPassword] = useState("pias900###");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const selectPreset = (preset: QuickRolePreset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.pass);
    setErr("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");
    setBusy(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim(), role: selectedRole }),
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

  const activePreset = ROLE_PRESETS.find((r) => r.role === selectedRole) || ROLE_PRESETS[0];

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
          background: `radial-gradient(circle, ${activePreset.badgeColor}33 0%, transparent 70%)`,
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
          background: "radial-gradient(circle, rgba(0, 229, 163, 0.2) 0%, transparent 75%)",
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
          maxWidth: 480,
          background: "rgba(12, 20, 36, 0.78)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5)",
          padding: "2.5rem 2.25rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: `${activePreset.badgeColor}1c`,
                border: `1px solid ${activePreset.badgeColor}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activePreset.badgeColor,
                boxShadow: `0 0 20px ${activePreset.badgeColor}33`,
                transition: "all 0.3s ease",
              }}
            >
              {<activePreset.icon size={22} />}
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#fff", letterSpacing: "0.02em", lineHeight: 1.1 }}>
                <span style={{ color: "#ef4444", marginRight: "0.2em" }}>ASHAL</span>
                INNOMECH
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.08em" }}>
                OPS COMMAND CONSOLE
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.68rem",
              padding: "0.2rem 0.6rem",
              borderRadius: 20,
              background: `${activePreset.badgeColor}1a`,
              color: activePreset.badgeColor,
              border: `1px solid ${activePreset.badgeColor}3d`,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: activePreset.badgeColor }} />
            {activePreset.title.toUpperCase()}
          </span>
        </div>

        {/* Tab Switcher: Quick Role Access vs Custom Credentials */}
        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.35)",
            padding: "4px",
            borderRadius: 14,
            marginBottom: "1.5rem",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("quick_role")}
            style={{
              flex: 1,
              padding: "0.55rem 0.8rem",
              borderRadius: 10,
              border: "none",
              background: activeTab === "quick_role" ? "rgba(255,255,255,0.12)" : "transparent",
              color: activeTab === "quick_role" ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.2s ease",
            }}
          >
            <Sparkles size={14} color={activeTab === "quick_role" ? activePreset.badgeColor : "currentColor"} />
            Role Based Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            style={{
              flex: 1,
              padding: "0.55rem 0.8rem",
              borderRadius: 10,
              border: "none",
              background: activeTab === "custom" ? "rgba(255,255,255,0.12)" : "transparent",
              color: activeTab === "custom" ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.2s ease",
            }}
          >
            <Shield size={14} />
            Custom Login
          </button>
        </div>

        {/* Dynamic Role Cards Selector (Visible in Quick Role mode) */}
        {activeTab === "quick_role" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.65rem" }}>
              Select Admin Role Account
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {ROLE_PRESETS.map((preset) => {
                const isSelected = selectedRole === preset.role;
                const IconComponent = preset.icon;
                return (
                  <motion.button
                    key={preset.role}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectPreset(preset)}
                    style={{
                      padding: "0.75rem 0.85rem",
                      borderRadius: 12,
                      border: `1px solid ${isSelected ? preset.badgeColor : "rgba(255,255,255,0.08)"}`,
                      background: isSelected ? `${preset.badgeColor}18` : "rgba(255,255,255,0.03)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                      boxShadow: isSelected ? `0 0 16px ${preset.badgeColor}22` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          color: isSelected ? "#fff" : "rgba(255,255,255,0.8)",
                        }}
                      >
                        {preset.title}
                      </span>
                      <IconComponent size={15} color={preset.badgeColor} />
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>
                      {preset.desc}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Sign-In Form */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "0.4rem" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.6rem",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#fff",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "0.4rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 2.8rem 0.85rem 2.6rem",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.14)",
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
              background: activePreset.badgeColor,
              border: "none",
              color: "#04211e",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: `0 8px 24px ${activePreset.badgeColor}40`,
              marginTop: "0.4rem",
              transition: "background 0.3s ease",
            }}
          >
            {busy ? (
              <Loader2 size={18} className="adm-spin-icon" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <ArrowRight size={18} />
            )}
            {busy ? "Authenticating Account…" : `Sign In as ${activePreset.title}`}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
