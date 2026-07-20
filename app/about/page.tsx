"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const HQ_BUILDING_PHOTO = "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1784543576/cx-machinery/about-hq-building.jpg";

export default function AboutPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.title = "About \u2014 Wenzhou Ashal Innomach Technology";
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { observer.disconnect(); };
  }, []);

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
  const responsiveCSS = "@keyframes aboutArrowBounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(10px); opacity: 1; } } @media (max-width: 768px) { .about-hero { height: 62vh !important; min-height: 420px !important; } .about-hero__sticky { position: relative !important; top: auto !important; height: 100% !important; } .about-hero__img { object-fit: contain !important; } .about-hero__eyebrow { margin-bottom: 0.5rem !important; } .about-hero__title { font-size: clamp(1.6rem,6.5vw,2.2rem) !important; } .about-section { padding-top: 1.75rem !important; padding-bottom: 1.75rem !important; padding-left: 1.25rem !important; padding-right: 1.25rem !important; } .about-section h3 { font-size: 1.5rem !important; margin-bottom: 1.25rem !important; } .about-stats { grid-template-columns: repeat(2, 1fr) !important; } .about-stats > div { padding: 0.5rem !important; } .about-story { grid-template-columns: 1fr !important; gap: 2rem !important; } .about-values { grid-template-columns: repeat(2, 1fr) !important; } .about-values > div { padding: 1.1rem 0.9rem !important; } .about-values h4 { font-size: 0.95rem !important; margin-bottom: 0.4rem !important; } .about-values p { font-size: 0.72rem !important; line-height: 1.45 !important; } .about-specs { grid-template-columns: 1fr !important; gap: 1.75rem !important; } .about-materials { grid-template-columns: repeat(2, 1fr) !important; } .about-materials > div { padding: 0.75rem 0.85rem !important; flex-direction: column !important; align-items: flex-start !important; gap: 0.15rem !important; } .about-categories { grid-template-columns: repeat(2, 1fr) !important; } .about-categories > div { padding: 1.25rem 0.9rem !important; } .about-categories img { height: 80px !important; margin-bottom: 0.75rem !important; } .about-categories h4 { font-size: 0.95rem !important; } .about-global { grid-template-columns: 1fr !important; gap: 1.5rem !important; } .about-support { grid-template-columns: 1fr !important; gap: 2rem !important; } .about-contact { grid-template-columns: 1fr !important; gap: 2rem !important; } }";

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: "<style>" + responsiveCSS + "</style>" }} />

      {/* CONTENT SECTION */}
      <div style={{ background: bg, position: "relative", zIndex: 20, overflow: "hidden" }}>

        {/* Hero — generated headquarters building photo, logo composited
            onto the building facade itself (not a CSS overlay). The photo
            is sticky: it stays pinned to the viewport while the section
            below scrolls up over it, then releases once this section's
            own height is exhausted. */}
        <section
          className="about-hero"
          style={{ position: "relative", height: "120vh" }}
        >
          <div className="about-hero__sticky" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#000" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="about-hero__img"
              src={HQ_BUILDING_PHOTO}
              alt="Ashal Innomech Technology headquarters building"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)" }} />

            <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: "clamp(1.5rem,4vw,3rem)" }}>
              <div style={{ textAlign: "left", maxWidth: "42ch", marginBottom: "clamp(1.5rem,5vw,3rem)" }}>
                <span className="about-hero__eyebrow" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "1.25rem", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>Company Profile</span>
                <h1 className="about-hero__title" style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2.3rem,5.5vw,4.5rem)", color: "#fff", lineHeight: 0.95, textShadow: "0 4px 24px rgba(0,0,0,0.65)" }}>
                  Wenzhou Ashal<br /><span style={{ color: "var(--brand-red)" }}>Innomach Technology</span>
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Company profile copy */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1.5rem" }}>Who We Are</span>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: textBody, lineHeight: 1.8, maxWidth: "60ch", marginBottom: "1.5rem" }}>Designs and manufactures blown-film lines, bag-making converters, and recycling systems for polymer film processors across six continents. Founded in 2008, we have grown from a single machine type to a full portfolio of 18+ machine families — every product designed in-house, fabricated in our 12,000 m² Wenzhou facility, and tested before it ships.</p>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: textBodyAlt, lineHeight: 1.8, maxWidth: "60ch" }}>Our customers range from single-line converters running one shift a day to multi-site groups running 24/7 on four continents. The machine has to work the same way for both.</p>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: "var(--brand-red)", padding: "clamp(2rem,4vw,3rem) clamp(1.5rem,4vw,3rem)", position: "relative", zIndex: 5 }}>
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-story">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Our Story</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>From one line to a full machinery portfolio</h3>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8, marginBottom: "1rem" }}>Ashal Innomach started with a single-layer blown-film line and a small team of mechanical engineers who had spent the previous decade on the shop floors of Wenzhou&apos;s established machinery makers. The founding premise was simple: build fewer machine types, but build them better.</p>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8 }}>Today we produce eighteen machine families across blown film, bag making, and recycling. Every product is designed in-house, fabricated in our 12,000 m² Wenzhou facility, and tested before it ships.</p>
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>How We Work</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>Four things we never compromise on</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: gridBg }} className="about-values">
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>Global Reach</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "2rem" }}>60+ Countries Across Six Continents</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: gridBg }} className="about-global">
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-support">
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
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)" }}>
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
                <Link href="/inquiries" style={{ fontFamily: "var(--ff-display)", fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#080e0d", background: "var(--brand-red)", padding: "0.85rem 2rem", textDecoration: "none", fontWeight: 700, border: "1px solid var(--brand-red)" }}>Request a Quote →</Link>
                <Link href="/products" style={{ fontFamily: "var(--ff-display)", fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", background: "transparent", padding: "0.85rem 2rem", textDecoration: "none", border: "1px solid " + (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") }}>Browse Machines</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
