"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const TOTAL_FRAMES = 155;

interface TextOverlay {
  from: number;
  to: number;
  position: "center" | "bottom-left" | "bottom-right" | "top-left" | "top-right";
  lines: { text: string; size?: string; weight?: number; color?: string; spacing?: string }[];
}

function resolveColor(color: string | undefined, isDark: boolean): string {
  if (!color) return isDark ? "#fff" : "#111827";
  if (!isDark) {
    return color
      .replace(/rgba\(255,255,255,([0-9.]+)\)/g, "rgba(0,0,0,$1)")
      .replace("#fff", "#111827")
      .replace("#ffffff", "#111827");
  }
  return color;
}

const OVERLAYS: TextOverlay[] = [
  { from: 1, to: 15, position: "center", lines: [
    { text: "WENZHOU ASHAL", size: "clamp(2.5rem,7vw,5.5rem)", weight: 700, spacing: "0.04em" },
    { text: "INNOMACH TECHNOLOGY", size: "clamp(2.5rem,7vw,5.5rem)", weight: 700, spacing: "0.04em" },
  ]},
  { from: 16, to: 30, position: "top-left", lines: [
    { text: "COMPANY", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "EST. 2008", size: "clamp(1.5rem,3vw,2.5rem)", weight: 700, spacing: "0.04em" },
    { text: "Wenzhou, Zhejiang, China", size: "clamp(0.65rem,1vw,0.85rem)", weight: 300, color: "rgba(255,255,255,0.6)", spacing: "0.06em" },
  ]},
  { from: 16, to: 30, position: "bottom-right", lines: [
    { text: "BUILT IN WENZHOU", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "SHIPPED WORLDWIDE", size: "clamp(1.2rem,2.5vw,2rem)", weight: 700, spacing: "0.06em" },
  ]},
  { from: 31, to: 48, position: "top-left", lines: [
    { text: "REACH", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "60+", size: "clamp(2.5rem,6vw,5rem)", weight: 700, spacing: "0.02em" },
    { text: "COUNTRIES SERVED", size: "clamp(0.6rem,1vw,0.8rem)", weight: 500, color: "rgba(255,255,255,0.7)", spacing: "0.2em" },
    { text: "6 CONTINENTS", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.15em" },
  ]},
  { from: 31, to: 48, position: "bottom-right", lines: [
    { text: "OUTPUT", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "400 KG/H", size: "clamp(2rem,5vw,4rem)", weight: 700, spacing: "0.02em" },
    { text: "MAX PRODUCTION RATE", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.15em" },
  ]},
  { from: 49, to: 65, position: "top-left", lines: [
    { text: "PORTFOLIO", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "18+", size: "clamp(2.5rem,6vw,5rem)", weight: 700, spacing: "0.02em" },
    { text: "MACHINE FAMILIES", size: "clamp(0.6rem,1vw,0.8rem)", weight: 500, color: "rgba(255,255,255,0.7)", spacing: "0.2em" },
  ]},
  { from: 49, to: 65, position: "bottom-right", lines: [
    { text: "FACILITY", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "12,000 M\u00B2", size: "clamp(1.8rem,4vw,3.5rem)", weight: 700, spacing: "0.02em" },
    { text: "MANUFACTURING FLOOR", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.15em" },
  ]},
  { from: 66, to: 82, position: "top-left", lines: [
    { text: "MILESTONE", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "2011", size: "clamp(1.5rem,3vw,2.5rem)", weight: 700, spacing: "0.06em" },
    { text: "ABA 3-LAYER CO-EXTRUSION", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.6)", spacing: "0.1em" },
    { text: "First export to Southeast Asia", size: "clamp(0.6rem,1vw,0.8rem)", weight: 300, color: "rgba(255,255,255,0.45)", spacing: "0.06em" },
  ]},
  { from: 66, to: 82, position: "bottom-right", lines: [
    { text: "MATERIALS", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "LDPE \u00B7 LLDPE \u00B7 HDPE", size: "clamp(0.7rem,1.2vw,1rem)", weight: 500, spacing: "0.08em" },
    { text: "PP \u00B7 PA \u00B7 EVOH", size: "clamp(0.7rem,1.2vw,1rem)", weight: 500, spacing: "0.08em" },
    { text: "PBAT+PLA BIODEGRADABLE", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.6)", spacing: "0.1em" },
  ]},
  { from: 83, to: 100, position: "top-left", lines: [
    { text: "MILESTONE", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "2017", size: "clamp(1.5rem,3vw,2.5rem)", weight: 700, spacing: "0.06em" },
    { text: "CE CERTIFICATION", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.6)", spacing: "0.1em" },
    { text: "European conformity achieved", size: "clamp(0.6rem,1vw,0.8rem)", weight: 300, color: "rgba(255,255,255,0.45)", spacing: "0.06em" },
  ]},
  { from: 83, to: 100, position: "bottom-right", lines: [
    { text: "TECHNOLOGY", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "1 \u2013 5 LAYERS", size: "clamp(1.2rem,2.5vw,2rem)", weight: 700, spacing: "0.06em" },
    { text: "CO-EXTRUSION BLOWN FILM", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.6)", spacing: "0.1em" },
    { text: "UP TO 2,200MM WIDTH", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.12em" },
  ]},
  { from: 101, to: 118, position: "center", lines: [
    { text: "ENGINEERED. PROVEN. SUPPORTED.", size: "clamp(1rem,2.5vw,2rem)", weight: 500, color: "rgba(255,255,255,0.95)", spacing: "0.12em" },
  ]},
  { from: 101, to: 118, position: "top-left", lines: [
    { text: "VALUE", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "ENGINEERING FIRST", size: "clamp(0.75rem,1.3vw,1.1rem)", weight: 600, spacing: "0.08em" },
    { text: "Over-engineer where it matters", size: "clamp(0.6rem,1vw,0.8rem)", weight: 300, color: "rgba(255,255,255,0.5)", spacing: "0.04em" },
  ]},
  { from: 101, to: 118, position: "bottom-right", lines: [
    { text: "OFFICES", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "GERMANY \u00B7 VIETNAM", size: "clamp(0.8rem,1.5vw,1.2rem)", weight: 600, spacing: "0.1em" },
    { text: "European & SEA operations", size: "clamp(0.6rem,1vw,0.8rem)", weight: 300, color: "rgba(255,255,255,0.5)", spacing: "0.04em" },
  ]},
  { from: 119, to: 135, position: "top-left", lines: [
    { text: "CATEGORIES", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "BLOWN FILM", size: "clamp(0.8rem,1.4vw,1.2rem)", weight: 600, spacing: "0.1em" },
    { text: "BAG MAKING", size: "clamp(0.8rem,1.4vw,1.2rem)", weight: 600, spacing: "0.1em" },
    { text: "RECYCLING", size: "clamp(0.8rem,1.4vw,1.2rem)", weight: 600, spacing: "0.1em" },
    { text: "PRINTING", size: "clamp(0.8rem,1.4vw,1.2rem)", weight: 600, spacing: "0.1em" },
  ]},
  { from: 119, to: 135, position: "bottom-right", lines: [
    { text: "SUPPORT", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "LIFETIME", size: "clamp(1.5rem,3vw,2.5rem)", weight: 700, spacing: "0.06em" },
    { text: "SPARE PARTS & REMOTE SUPPORT", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.6)", spacing: "0.1em" },
    { text: "FOR EVERY MACHINE WE BUILD", size: "clamp(0.55rem,0.9vw,0.75rem)", weight: 300, color: "rgba(255,255,255,0.45)", spacing: "0.1em" },
  ]},
  { from: 136, to: 150, position: "top-left", lines: [
    { text: "CERTIFICATION", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "CE", size: "clamp(2rem,4vw,3.5rem)", weight: 700, spacing: "0.08em" },
    { text: "EUROPEAN CONFORMITY", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.6)", spacing: "0.15em" },
  ]},
  { from: 136, to: 150, position: "bottom-right", lines: [
    { text: "DELIVERY", size: "clamp(0.5rem,0.8vw,0.7rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.3em" },
    { text: "25\u201345 DAYS", size: "clamp(1.5rem,3vw,2.5rem)", weight: 700, spacing: "0.04em" },
    { text: "PRODUCTION TO COMMISSIONING", size: "clamp(0.6rem,1vw,0.8rem)", weight: 400, color: "rgba(255,255,255,0.5)", spacing: "0.1em" },
  ]},
  { from: 151, to: 155, position: "center", lines: [
    { text: "CX MACHINERY.COM", size: "clamp(1.2rem,3vw,2.5rem)", weight: 700, spacing: "0.08em" },
  ]},
];

function getOpacity(frame: number, overlay: TextOverlay) {
  if (frame < overlay.from || frame > overlay.to) return 0;
  const fadeIn = 4, fadeOut = 4;
  if (frame < overlay.from + fadeIn) return (frame - overlay.from) / fadeIn;
  if (frame > overlay.to - fadeOut) return (overlay.to - frame) / fadeOut;
  return 1;
}

function getPositionStyle(pos: TextOverlay["position"]): React.CSSProperties {
  switch (pos) {
    case "center": return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    case "bottom-left": return { bottom: "8%", left: "6%" };
    case "bottom-right": return { bottom: "8%", right: "6%", textAlign: "right" };
    case "top-left": return { top: "10%", left: "6%" };
    case "top-right": return { top: "10%", right: "6%", textAlign: "right" };
  }
}

function getFrameSrc(frame: number): string {
  const id = "about-frames/frame_" + String(frame).padStart(3, "0");
  return "https://res.cloudinary.com/dpyhwgsqk/image/upload/f_auto,q_80,w_1280/" + id + ".jpg";
}

const imageCache = new Map<number, HTMLImageElement>();
function preloadFrame(num: number) {
  if (imageCache.has(num)) return;
  const img = new Image();
  img.src = getFrameSrc(num);
  imageCache.set(num, img);
}

export default function AboutPage() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [videoDone, setVideoDone] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const targetFrameRef = useRef(1);
  const currentFrameRef = useRef(1);

  useEffect(() => {
    document.title = "About \u2014 Wenzhou Ashal Innomach Technology";
    for (let i = 1; i <= TOTAL_FRAMES; i++) preloadFrame(i);

    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => { observer.disconnect(); };
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("footer, nav, .pgnav, .sn, .sn__mobile, .sn__mob-bd");
    els.forEach((el) => { (el as HTMLElement).style.display = videoDone ? "" : "none"; });
  }, [videoDone]);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.1) {
        currentFrameRef.current = lerp(currentFrameRef.current, targetFrameRef.current, 0.45);
        const newFrame = Math.round(currentFrameRef.current);
        if (newFrame !== currentFrame) setCurrentFrame(newFrame);
      } else if (currentFrameRef.current !== targetFrameRef.current) {
        currentFrameRef.current = targetFrameRef.current;
        setCurrentFrame(targetFrameRef.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentFrame]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollY = window.scrollY;
    const videoHeight = containerRef.current.offsetHeight;
    const vh = window.innerHeight;
    setVideoDone(scrollY >= videoHeight - vh);
    const videoScrollMax = videoHeight - vh;
    if (videoScrollMax <= 0) return;
    const progress = Math.min(Math.max(scrollY / videoScrollMax, 0), 1);
    targetFrameRef.current = Math.round(progress * (TOTAL_FRAMES - 1)) + 1;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  const src = getFrameSrc(currentFrame);

  const darkBg = "#0a0e1a";
  const lightBg = "#f8fafc";
  const bg = isDark ? darkBg : lightBg;
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const textBody = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textBodyAlt = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)";
  const textDim = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const gridBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "#0f1420" : "#fff";
  const responsiveCSS = "@media (max-width: 768px) { .about-grid-2 { grid-template-columns: 1fr !important; gap: 2rem !important; } .about-grid-4 { grid-template-columns: repeat(2, 1fr) !important; } .about-grid-3 { grid-template-columns: 1fr !important; } .about-stats { grid-template-columns: repeat(2, 1fr) !important; } .about-specs { grid-template-columns: 1fr !important; } .about-materials { grid-template-columns: 1fr !important; } .about-contact { grid-template-columns: 1fr !important; } .about-categories { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 480px) { .about-grid-4 { grid-template-columns: 1fr !important; } .about-categories { grid-template-columns: 1fr !important; } .about-stats { grid-template-columns: 1fr !important; } }";

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: "<style>" + responsiveCSS + "</style>" }} />

      {/* VIDEO SCROLL */}
      <div ref={containerRef} style={{ height: TOTAL_FRAMES * 10 + "vh", background: "#000" }}>
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#000", opacity: videoDone ? 0 : 1, pointerEvents: videoDone ? "none" : "auto", transition: "opacity 0.3s ease" }}>
          <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 30%,transparent 70%,rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
          {OVERLAYS.map((o, i) => {
            const op = getOpacity(currentFrame, o);
            if (op <= 0) return null;
            return (
              <div key={i} style={{ position: "absolute", ...getPositionStyle(o.position), opacity: op, transition: "opacity 0.2s ease-out", pointerEvents: "none" }}>
                {o.lines.map((l, li) => (
                  <div key={li} style={{ fontFamily: "var(--ff-display)", fontSize: l.size || "1rem", fontWeight: l.weight || 400, color: l.color || "#fff", letterSpacing: l.spacing || "0.02em", lineHeight: 1.1, textTransform: "uppercase", textShadow: "0 2px 20px rgba(0,0,0,0.6)", marginBottom: li < o.lines.length - 1 ? "0.3em" : 0 }}>{l.text}</div>
                ))}
              </div>
            );
          })}
          <div style={{ position: "fixed", bottom: "2rem", right: "2rem", fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", userSelect: "none", zIndex: 10 }}>{currentFrame} / {TOTAL_FRAMES}</div>
          <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", opacity: currentFrame < 5 ? 1 : 0, transition: "opacity 0.5s ease", pointerEvents: "none", zIndex: 10 }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Scroll to play</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)"} strokeWidth="1.5"><path d="M10 4v12M5 11l5 5 5-5" /></svg>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div style={{ background: bg, position: "relative", zIndex: 20 }}>

        {/* Hero */}
        <section style={{ padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1.5rem" }}>Company Profile</span>
            <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2.5rem,6vw,5rem)", color: textPrimary, lineHeight: 0.92, marginBottom: "2rem", maxWidth: "20ch" }}>Wenzhou Ashal<br /><span style={{ color: "var(--brand-red)" }}>Innomach Technology</span></h2>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: textBody, lineHeight: 1.8, maxWidth: "60ch", marginBottom: "1.5rem" }}>Designs and manufactures blown-film lines, bag-making converters, and recycling systems for polymer film processors across six continents. Founded in 2008, we have grown from a single machine type to a full portfolio of 18+ machine families \u2014 every product designed in-house, fabricated in our 12,000 m\u00B2 Wenzhou facility, and tested before it ships.</p>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: textBody, lineHeight: 1.8, maxWidth: "60ch" }}>Our customers range from single-line converters running one shift a day to multi-site groups running 24/7 on four continents. The machine has to work the same way for both.</p>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: "var(--brand-red)", padding: "clamp(2rem,4vw,3rem) clamp(1.5rem,4vw,3rem)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px" }} className="about-stats">
            {[{ v: "2008", l: "Founded" }, { v: "60+", l: "Countries" }, { v: "400", l: "kg/h Max" }, { v: "18+", l: "Families" }].map((s) => (
              <div key={s.l} style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.8rem,4vw,3rem)", color: "#fff", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline + Story */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-grid-2">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Our Story</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>From one line to a full machinery portfolio</h3>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8, marginBottom: "1rem" }}>Ashal Innomach started with a single-layer blown-film line and a small team of mechanical engineers who had spent the previous decade on the shop floors of Wenzhou&apos;s established machinery makers. The founding premise was simple: build fewer machine types, but build them better.</p>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8 }}>Today we produce eighteen machine families across blown film, bag making, and recycling. Every product is designed in-house, fabricated in our 12,000 m\u00B2 Wenzhou facility, and tested before it ships.</p>
            </div>
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1.5rem" }}>Timeline</span>
              <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "1px solid " + (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") }}>
                {[
                  { y: "2008", e: "Company founded in Wenzhou. First single-layer blown-film line." },
                  { y: "2011", e: "ABA three-layer co-extrusion line. First export to Southeast Asia." },
                  { y: "2014", e: "Bag-making division launched with the F-PRO bottom-seal converter." },
                  { y: "2017", e: "CE certification. ABC multi-layer line certified for PBAT+PLA." },
                  { y: "2019", e: "CX recycling line released. Factory expanded to 12,000 m\u00B2." },
                  { y: "2022", e: "ABCDE-2200 enters development. Offices in Germany & Vietnam." },
                  { y: "2025", e: "ABCDE-2200 ships. RGB roll-bag machine updated." },
                ].map((t, i) => (
                  <div key={t.y} style={{ paddingBottom: i < 6 ? "1.5rem" : 0, position: "relative" }}>
                    <div style={{ position: "absolute", left: "-1.75rem", top: "0.3rem", width: 8, height: 8, borderRadius: "50%", background: i === 6 ? "var(--brand-red)" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", border: "2px solid " + bg }} />
                    <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "0.25rem" }}>{t.y}</span>
                    <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.6, margin: 0 }}>{t.e}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Machine Categories */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Product Portfolio</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>Machine Families</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: gridBg }} className="about-categories">
              {[
                { name: "Blown Film", img: "/machines/abc-multilayer-large.png", desc: "1\u20135 layer co-extrusion lines" },
                { name: "Bag Making", img: "/machines/f-pro-bottomseal.png", desc: "Bottom-seal, side-seal, roll-bag" },
                { name: "Recycling", img: "/machines/rgb-rollbag.png", desc: "Pelletizing & recovery lines" },
                { name: "Printing", img: "/machines/flexo-4.png", desc: "1\u20136 color flexographic" },
              ].map((c) => (
                <div key={c.name} style={{ background: cardBg, padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <img src={c.img} alt={c.name} style={{ width: "100%", height: 140, objectFit: "contain", marginBottom: "1.5rem", filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))" }} />
                  <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, letterSpacing: "0.04em", marginBottom: "0.5rem" }}>{c.name}</h4>
                  <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)", lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>How We Work</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>Four things we never compromise on</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: gridBg }} className="about-grid-2">
              {[
                { h: "Engineering First", b: "Every machine starts on the drawing board, not the sales brochure. We over-engineer where it matters \u2014 drive trains, die heads, frame rigidity \u2014 and simplify everything else." },
                { h: "Long-Term Support", b: "We supply spare parts and provide remote process support for every machine we have ever built. A ten-year-old line deserves the same attention as a new one." },
                { h: "Material Agnostic", b: "Our lines run LDPE, LLDPE, HDPE, PP, PBAT+PLA and blends. We do not design for one resin family and leave the rest as an afterthought." },
                { h: "Factory Transparency", b: "Buyers are welcome on the production floor at any stage of a build. We encourage factory acceptance tests and third-party inspection." },
              ].map((v) => (
                <div key={v.h} style={{ background: cardBg, padding: "2rem 1.75rem" }}>
                  <div style={{ width: "2rem", height: 2, background: "var(--brand-red)", marginBottom: "1.25rem" }} />
                  <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, letterSpacing: "0.02em", marginBottom: "0.75rem" }}>{v.h}</h4>
                  <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.7, margin: 0 }}>{v.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Materials */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Material Compatibility</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>Resins & Materials We Process</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: gridBg }} className="about-materials">
              {[
                { n: "LDPE", f: "Low-Density Polyethylene" }, { n: "LLDPE", f: "Linear Low-Density PE" }, { n: "HDPE", f: "High-Density Polyethylene" },
                { n: "PP", f: "Polypropylene" }, { n: "PA", f: "Polyamide / Nylon" }, { n: "EVOH", f: "Ethylene Vinyl Alcohol" },
                { n: "PBAT", f: "Biodegradable Copolyester" }, { n: "PLA", f: "Polylactic Acid" }, { n: "Blends", f: "Custom Formulations" },
              ].map((m) => (
                <div key={m.n} style={{ background: cardBg, padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", color: textPrimary, letterSpacing: "0.02em" }}>{m.n}</span>
                  <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: textDim }}>{m.f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specs */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-specs">
            {[
              { label: "Blown Film", specs: [["Layers", "1 to 5"], ["Film Width", "150\u20132,200 mm"], ["Output", "Up to 400 kg/h"], ["Die Diameters", "50\u2013600 mm"], ["Extruders", "20\u201390 mm L/D 30:1"]] },
              { label: "Bag Making", specs: [["Bag Types", "Bottom, side, t-shirt, die-cut, roll"], ["Seal Width", "Up to 1,200 mm"], ["Speed", "Up to 200 bags/min"], ["Film Thickness", "0.008\u20130.30 mm"], ["Recycling", "100\u2013500 kg/h"]] },
            ].map((s) => (
              <div key={s.label}>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{s.label}</span>
                <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.8rem", color: textPrimary, marginBottom: "1.5rem" }}>Key Specifications</h4>
                {s.specs.map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid " + border }}>
                    <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted }}>{l}</span>
                    <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textPrimary, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Global */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Global Reach</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "2rem" }}>60+ Countries Across Six Continents</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: gridBg }} className="about-grid-2">
              <div style={{ background: cardBg, padding: "2rem" }}>
                <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, marginBottom: "1rem" }}>Key Markets</h4>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.7, margin: 0 }}>Vietnam, Indonesia, Thailand, Philippines, India, Bangladesh, Pakistan, Turkey, Egypt, Nigeria, Kenya, Colombia, Peru, Germany, and 45+ more countries.</p>
              </div>
              <div style={{ background: cardBg, padding: "2rem" }}>
                <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, marginBottom: "1rem" }}>Regional Offices</h4>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.7, margin: 0 }}><strong style={{ color: textPrimary }}>Germany:</strong> European sales & support<br /><strong style={{ color: textPrimary }}>Vietnam:</strong> SEA operations & training<br /><strong style={{ color: textPrimary }}>Wenzhou HQ:</strong> Manufacturing & R&D</p>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-grid-2">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>After-Sales</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>Lifetime Support</h3>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8 }}>We supply spare parts and provide remote process support for every machine we have ever built. A ten-year-old line deserves the same attention as a new one.</p>
            </div>
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Delivery</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>From Factory to Floor</h3>
              {[["Production", "25\u201345 days"], ["Packing", "Export-standard wooden crate"], ["Shipping", "FOB Wenzhou / CIF destination"], ["Commissioning", "On-site install & training"], ["Warranty", "12 months from commissioning"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid " + border }}>
                  <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted }}>{l}</span>
                  <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textPrimary, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-contact">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Contact</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "2rem" }}>Get in Touch</h3>
              {[["Company", "Wenzhou Ashal Innomach Technology"], ["Location", "Wenzhou, Zhejiang, China"], ["Factory", "12,000 m\u00B2 manufacturing facility"], ["Website", "www.cxmachinery.com"], ["Response", "Within 24 business hours"], ["Languages", "English, Chinese, Vietnamese, German"]].map(([l, v]) => (
                <div key={l} style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: textDim, marginBottom: "0.25rem" }}>{l}</div>
                  <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textPrimary, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: cardBg, border: "1px solid " + border, padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.5rem", color: textPrimary, marginBottom: "1rem" }}>Ready to talk about your next line?</h4>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: textMuted, lineHeight: 1.7, marginBottom: "2rem" }}>Request a quote or talk to an engineer about your specific requirements.</p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/inquiries" style={{ fontFamily: "var(--ff-display)", fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#080e0d", background: "var(--brand-red)", padding: "0.85rem 2rem", textDecoration: "none", fontWeight: 700, border: "1px solid var(--brand-red)" }}>Request a Quote \u2192</Link>
                <Link href="/products" style={{ fontFamily: "var(--ff-display)", fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", background: "transparent", padding: "0.85rem 2rem", textDecoration: "none", border: "1px solid " + (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") }}>Browse Machines</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
