"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const DURATION = 800;

export default function LoadingScreen() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [gone,    setGone]    = useState(false);
  const [pct,     setPct]     = useState(0);
  const [label,   setLabel]   = useState("Wenzhou Ashal Innomech Technology Co., Ltd.");

  useEffect(() => { setMounted(true); }, []);

  // Smooth progress — slow cubic ease
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min((Date.now() - start) / DURATION, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(ease * 100));
      if (p >= 1) clearInterval(iv);
    }, 16); // ~60fps
    return () => clearInterval(iv);
  }, []);

  // Exit — fade + scale down
  useEffect(() => {
    const t = setTimeout(() => {
      setLabel("Ready");
      const el = rootRef.current;
      if (el) {
        el.style.transition = "opacity 0.3s cubic-bezier(0.4,0,0.2,1)";
        el.style.opacity    = "0";
        el.style.pointerEvents = "none";
      }
      setTimeout(() => setGone(true), 320);
    }, DURATION + 200);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  if (!mounted) return (
    <div data-loading-screen style={{ position: "fixed", inset: 0, zIndex: 9499, background: "#080e0d" }} />
  );

  return (
    <>
      <style suppressHydrationWarning>{`
        /* --- entrance: slow float up from 32px, fade in --- */
        @keyframes ls-rise {
          from { opacity: 0; transform: translateY(32px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }
        /* --- rules: draw from center outward --- */
        @keyframes ls-rule {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        /* --- logo: scale up from tiny + fade --- */
        @keyframes ls-logo {
          from { opacity: 0; transform: scale(0.72); filter: blur(8px); }
          to   { opacity: 1; transform: scale(1);    filter: blur(0);   }
        }
        /* --- rings: fade in independently --- */
        @keyframes ls-ring-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1);   }
        }
        /* --- corner brackets slide in from corners --- */
        @keyframes ls-bracket-tl { from { opacity:0; transform: translate(-8px,-8px); } to { opacity:1; transform: none; } }
        @keyframes ls-bracket-tr { from { opacity:0; transform: translate( 8px,-8px); } to { opacity:1; transform: none; } }
        @keyframes ls-bracket-bl { from { opacity:0; transform: translate(-8px, 8px); } to { opacity:1; transform: none; } }
        @keyframes ls-bracket-br { from { opacity:0; transform: translate( 8px, 8px); } to { opacity:1; transform: none; } }
        /* --- status bar slides up --- */
        @keyframes ls-bar-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        /* --- ambient loops --- */
        @keyframes ls-spin   { to { transform: rotate(360deg);  } }
        @keyframes ls-rspin  { to { transform: rotate(-360deg); } }
        @keyframes ls-breath { 0%,100%{ transform:scale(1);     } 50%{ transform:scale(1.03); } }
        @keyframes ls-glow   { 0%,100%{ box-shadow:0 0 22px 5px rgba(225,29,72,.18); }
                               50%{     box-shadow:0 0 44px 12px rgba(225,29,72,.38); } }
        @keyframes ls-pulse  { 0%,100%{ opacity:1; } 50%{ opacity:0.25; } }

        /* ease used for all entrance keyframes */
        .ls-ease { animation-timing-function: cubic-bezier(0.22,1,0.36,1); animation-fill-mode: both; }
      `}</style>

      <div
        ref={rootRef}
        data-loading-screen
        style={{
          position: "fixed", inset: 0, zIndex: 9499,
          background: "#080e0d", overflow: "hidden",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "clamp(1.4rem,3vw,2.4rem)",
          fontFamily: "var(--ff-mono, monospace)",
        }}
      >
        {/* Scanlines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity: 0.035,
          backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 3px)",
        }} />

        {/* Logo — 0.9s duration, 0.1s delay */}
        <div
          className="ls-ease"
          style={{
            position: "relative", flexShrink: 0, zIndex: 2,
            animation: "ls-logo 0.9s 0.1s both cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Outer ring */}
          <div
            className="ls-ease"
            style={{
              position: "absolute", inset: "-18px", borderRadius: "50%",
              border: "1px solid rgba(43,191,179,0.12)",
              animation: "ls-ring-in 1.2s 0.5s both cubic-bezier(0.22,1,0.36,1), ls-rspin 22s linear infinite",
            }}
          />
          {/* Inner ring */}
          <div
            className="ls-ease"
            style={{
              position: "absolute", inset: "-9px", borderRadius: "50%",
              border: "1px solid rgba(43,191,179,0.3)",
              animation: "ls-ring-in 1.2s 0.7s both cubic-bezier(0.22,1,0.36,1), ls-spin 11s linear infinite",
            }}
          />
          <div style={{
            position: "relative",
            width: "clamp(100px,13vw,150px)", height: "clamp(100px,13vw,150px)",
            borderRadius: "50%", overflow: "hidden",
            animation: "ls-breath 4s 1s ease-in-out infinite, ls-glow 4s 1s ease-in-out infinite",
          }}>
            <Image src="/logo.jpeg" alt="" fill sizes="150px" priority style={{ objectFit: "cover" }} />
          </div>
        </div>

        {/* Brand — staggered children, base delay 0.55s */}
        <div style={{ textAlign: "center", zIndex: 2 }}>
          {/* Top rule */}
          <div style={{
            width: "clamp(180px,28vw,380px)", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(225,29,72,0.5),transparent)",
            transformOrigin: "center", marginBottom: "0.8rem",
            animation: "ls-rule 1.1s 0.55s cubic-bezier(0.22,1,0.36,1) both",
          }} />

          {/* Main name */}
          <div
            style={{
              fontFamily: "var(--ff-display, sans-serif)",
              fontSize: "clamp(1.2rem,2.8vw,2.4rem)",
              letterSpacing: "0.06em", color: "#fff", lineHeight: 1.05,
              animation: "ls-rise 1.0s 0.75s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            Wenzhou Ashal Innomech
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: "clamp(0.66rem,0.9vw,0.72rem)",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(225,29,72,0.7)", marginTop: "0.3rem",
            animation: "ls-rise 1.0s 0.95s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            Technology Co., Ltd.
          </div>

          {/* Bottom rule */}
          <div style={{
            width: "clamp(180px,28vw,380px)", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(225,29,72,0.5),transparent)",
            transformOrigin: "center", marginTop: "0.8rem",
            animation: "ls-rule 1.1s 1.15s cubic-bezier(0.22,1,0.36,1) both",
          }} />

          {/* Tagline */}
          <div style={{
            fontSize: "clamp(0.62rem,0.6vw,0.64rem)",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)", marginTop: "0.5rem",
            animation: "ls-rise 1.0s 1.4s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            Film Blowing · Bag Making · Recycling · Flexo Print
          </div>
        </div>

        {/* Progress bar — appears last at 1.7s */}
        <div style={{
          width: "clamp(200px,26vw,360px)", zIndex: 2,
          animation: "ls-rise 1.0s 1.7s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.45rem" }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>
              {pct < 100 ? "Initialising" : label}
            </span>
            <span style={{
              fontFamily: "var(--ff-display, sans-serif)",
              fontSize: "clamp(1rem,2vw,1.7rem)", letterSpacing: "-0.02em", lineHeight: 1,
              color: pct === 100 ? "#4ade80" : "#2bbfb3", transition: "color 0.6s",
            }}>
              {String(pct).padStart(3, "0")}<span style={{ fontSize: "0.4em", opacity: 0.4, marginLeft: 2 }}>%</span>
            </span>
          </div>
          <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.07)", position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0, transformOrigin: "left center",
              transform: `scaleX(${pct / 100})`,
              background: pct === 100 ? "#4ade80" : "linear-gradient(90deg,rgba(140,31,110,0.6),#2bbfb3)",
              transition: "transform 0.08s linear, background 0.6s",
            }} />
            {pct > 1 && pct < 100 && (
              <div style={{
                position: "absolute", top: "50%", left: `calc(${pct}% - 3px)`,
                width: 6, height: 6, borderRadius: "50%", background: "#2bbfb3",
                boxShadow: "0 0 8px 3px rgba(225,29,72,0.7)",
                transform: "translateY(-50%)", transition: "left 0.08s linear",
              }} />
            )}
          </div>
        </div>

        {/* Corner brackets — each slides in from its own corner, staggered */}
        {([
          { top: 14,    left: 14,    borderTop: "1px solid rgba(225,29,72,0.4)",    borderLeft:   "1px solid rgba(225,29,72,0.4)",   anim: "ls-bracket-tl" },
          { top: 14,    right: 14,   borderTop: "1px solid rgba(225,29,72,0.4)",    borderRight:  "1px solid rgba(225,29,72,0.4)",   anim: "ls-bracket-tr" },
          { bottom: 14, left: 14,    borderBottom: "1px solid rgba(225,29,72,0.4)", borderLeft:   "1px solid rgba(225,29,72,0.4)",   anim: "ls-bracket-bl" },
          { bottom: 14, right: 14,   borderBottom: "1px solid rgba(225,29,72,0.4)", borderRight:  "1px solid rgba(225,29,72,0.4)",   anim: "ls-bracket-br" },
        ]).map(({ anim, ...s }, i) => (
          <div
            key={i}
            style={{
              position: "absolute", width: 18, height: 18, zIndex: 20,
              animation: `${anim} 1.0s ${0.3 + i * 0.12}s cubic-bezier(0.22,1,0.36,1) both`,
              ...s as React.CSSProperties,
            }}
          />
        ))}

        {/* Bottom status bar — slides up from bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 32,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(1.5rem,4vw,3rem)", zIndex: 10,
          animation: "ls-bar-up 1.0s 2.0s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)" }}>
            Wenzhou · China · Est. 2008
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: pct === 100 ? "#4ade80" : "#2bbfb3", transition: "background 0.6s",
              animation: "ls-pulse 1.4s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)" }}>
              {pct === 100 ? "Ready" : "Loading"}
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
