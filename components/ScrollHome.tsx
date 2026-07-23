"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import AetherBtn from "@/components/AetherBtn";
import { useCms } from "@/lib/useCms";

// Machine cards shown at the bottom of §3
const CARDS = [
  { slug: "t-pro-heatseal",    name: "T-PRO · Heat-seal converter"     },
  { slug: "f-pro-bottomseal",  name: "F-PRO · Bottom-seal converter"   },
  { slug: "rgb-rollbag",       name: "RGB · Roll-bag machine"          },
  { slug: "rb-vegetable",      name: "RB · Vest-bag machine"           },
  { slug: "abcde-2200",        name: "ABCDE-2200 · 5-layer co-ex line" },
  { slug: "abc-multilayer-large", name: "ABC · Multi-layer blown film"  },
  { slug: "s-wide",            name: "S · Single-layer wide"           },
  { slug: "cx-pelletizing",    name: "CX · Recycling pelletizer"       },
];

type Spec = { label: string; value: string };
type Feature = { head: string; body: string };

type ProductDetail = {
  specs: Spec[];
  features: Feature[];
};

const DEFAULT_PRODUCT_DATA: Record<string, ProductDetail> = {
  "t-pro-heatseal": {
    specs: [
      { label: "Series",     value: "T-PRO"               },
      { label: "Type",       value: "Heat-seal converter"  },
      { label: "Film width", value: "750 – 1150 mm"       },
      { label: "Speed",      value: "600 pcs / min"       },
      { label: "Lanes",      value: "Up to 6"             },
      { label: "Material",   value: "PE · PBAT+PLA"       },
      { label: "Drive",      value: "Servo + frequency"   },
    ],
    features: [
      { head: "Multi-lane",          body: "Up to 6 lanes for high-volume simultaneous output." },
      { head: "Biodegradable ready", body: "Compatible with PBAT+PLA blends out of the box."    },
      { head: "Servo precision",     body: "±0.5 mm sealing repeat accuracy across all lanes."  },
      { head: "Fast changeover",     body: "Tool-free width adjustment in under 15 minutes."    },
    ],
  },
  "f-pro-bottomseal": {
    specs: [
      { label: "Series",     value: "F-PRO"               },
      { label: "Type",       value: "Bottom-seal converter" },
      { label: "Film width", value: "600 – 1000 mm"       },
      { label: "Speed",      value: "280 pcs / min"       },
      { label: "Lanes",      value: "Up to 4"             },
      { label: "Material",   value: "PE · PP"             },
      { label: "Drive",      value: "Servo driven"        },
    ],
    features: [
      { head: "Bottom seal",       body: "Continuous bottom-seal for flat bags with precision tension control." },
      { head: "Compact footprint", body: "Space-saving design for medium-volume production lines."             },
      { head: "Easy operation",    body: "Touchscreen HMI with recipe memory for quick batch switching."      },
      { head: "Low maintenance",   body: "Fewer moving parts with sealed bearing assemblies throughout."       },
    ],
  },
  "rgb-rollbag": {
    specs: [
      { label: "Series",     value: "RGB"                 },
      { label: "Type",       value: "Roll-bag machine"     },
      { label: "Film width", value: "500 – 900 mm"        },
      { label: "Speed",      value: "200 pcs / min"       },
      { label: "Lanes",      value: "Up to 3"             },
      { label: "Material",   value: "PE · LDPE"           },
      { label: "Drive",      value: "Inverter + servo"    },
    ],
    features: [
      { head: "Roll format",       body: "Produces perforated roll bags for automatic dispensing systems."    },
      { head: "Perforation unit",  body: "Integrated blade perforation with adjustable pitch and depth."      },
      { head: "Winding system",    body: "Automatic roll winding with tension control for uniform rolls."     },
      { head: "Quick sizing",      body: "Motorized width adjustment with digital position readout."          },
    ],
  },
  "rb-vegetable": {
    specs: [
      { label: "Series",     value: "RB"                  },
      { label: "Type",       value: "Vest-bag machine"     },
      { label: "Film width", value: "800 – 1200 mm"       },
      { label: "Speed",      value: "250 pcs / min"       },
      { label: "Lanes",      value: "Up to 4"             },
      { label: "Material",   value: "HDPE · MDPE"         },
      { label: "Drive",      value: "Full servo"          },
    ],
    features: [
      { head: "T-shirt bags",      body: "Designed for vest/T-shirt bags with reinforced die-cut handles."   },
      { head: "Die-cut unit",      body: "Integrated punch module for consistent handle cutouts."             },
      { head: "Stacking conveyor", body: "Automated counting and stacking for pack-ready output."            },
      { head: "High throughput",   body: "Up to 250 bags per minute with multi-lane parallel processing."    },
    ],
  },
  "abcde-2200": {
    specs: [
      { label: "Series",     value: "ABCDE-2200"           },
      { label: "Type",       value: "5-layer co-ex line"   },
      { label: "Film width", value: "2200 mm max"          },
      { label: "Output",     value: "350 kg / h"           },
      { label: "Layers",     value: "5"                    },
      { label: "Material",   value: "PE · PP · PA · EVOH" },
      { label: "Drive",      value: "AC vector"            },
    ],
    features: [
      { head: "Multi-layer",       body: "5-layer co-extrusion for advanced barrier and seal properties."    },
      { head: "High output",       body: "350 kg/h throughput with internal bubble cooling system."          },
      { head: "Web width",         body: "2200 mm lay-flat for large-format film applications."             },
      { head: "Precision gauging", body: "Online thickness measurement with closed-loop auto adjustment."    },
    ],
  },
  "abc-multilayer-large": {
    specs: [
      { label: "Series",     value: "ABC"                 },
      { label: "Type",       value: "Multi-layer blown film" },
      { label: "Film width", value: "1800 mm max"          },
      { label: "Output",     value: "280 kg / h"           },
      { label: "Layers",     value: "3"                    },
      { label: "Material",   value: "PE · PP"              },
      { label: "Drive",      value: "AC vector"            },
    ],
    features: [
      { head: "3-layer co-ex",     body: "High-performance 3-layer blown film for general packaging."        },
      { head: "Energy efficient",  body: "Low-energy IBC design with optimized air ring technology."         },
      { head: "Consistent gauge",  body: "Auto-profiled die gap for uniform film thickness across the web."  },
      { head: "User-friendly",     body: "Recipe-based controls with touch panel and data logging."           },
    ],
  },
  "s-wide": {
    specs: [
      { label: "Series",     value: "S"                   },
      { label: "Type",       value: "Single-layer wide"    },
      { label: "Film width", value: "2500 mm max"          },
      { label: "Output",     value: "200 kg / h"           },
      { label: "Layers",     value: "1"                    },
      { label: "Material",   value: "LDPE · LLDPE"         },
      { label: "Drive",      value: "AC inverter"          },
    ],
    features: [
      { head: "Ultra-wide",        body: "2500 mm lay-flat width for industrial film applications."          },
      { head: "Simple operation",  body: "Single-layer extrusion with minimal operator training required."   },
      { head: "Low investment",    body: "Cost-effective solution for high-volume commodity film production." },
      { head: "Flexible output",   body: "Runs LDPE and LLDPE with quick resin changeover."                 },
    ],
  },
  "cx-pelletizing": {
    specs: [
      { label: "Series",     value: "CX"                  },
      { label: "Type",       value: "Recycling pelletizer" },
      { label: "Output",     value: "150 – 300 kg / h"     },
      { label: "Material",   value: "PE · PP · Pet"        },
      { label: "Pellet size", value: "3 – 4 mm"            },
      { label: "Power",      value: "75 – 160 kW"          },
      { label: "Drive",      value: "AC vector + servo"    },
    ],
    features: [
      { head: "Closed-loop",       body: "Converts post-industrial waste into high-quality reusable pellets."  },
      { head: "Integrated cutter", body: "Hot-face die-face cutting with underwater pelletizing system."      },
      { head: "Filtration",        body: "Continuous melt filtration with automatic screen changer."          },
      { head: "Energy recovery",   body: "Integrated heat recovery system reduces total power consumption."   },
    ],
  },
};

// Machine is fixed top:0 left:0. GSAP drives x/y only — no CSS centering.
// §1 → 75vw × 50vh  |  §2 → 25vw × 50vh  |  §3 → 50vw × 50vh

export default function ScrollHome() {
  // live CMS content (admin panel) with hardcoded fallback
  const cmsBags = useCms<{ items: ({ slug: string } & ProductDetail)[] }>("scrollhome-bags", { items: [] });
  const PRODUCT_DATA: Record<string, ProductDetail> =
    cmsBags.items && cmsBags.items.length
      ? Object.fromEntries(cmsBags.items.map(({ slug, ...rest }) => [slug, rest]))
      : DEFAULT_PRODUCT_DATA;
  const machineRef   = useRef<HTMLDivElement>(null);
  const sec1Ref      = useRef<HTMLElement>(null);
  const sec2Ref      = useRef<HTMLDivElement>(null);
  const sec2TextRef  = useRef<HTMLDivElement>(null);
  const sec3Ref      = useRef<HTMLDivElement>(null);
  const sec3LeftRef  = useRef<HTMLDivElement>(null);
  const sec3RightRef = useRef<HTMLDivElement>(null);
  const sec3CenterRef = useRef<HTMLDivElement>(null);
  const cardStripRef = useRef<HTMLDivElement>(null);
  const cardRowRef   = useRef<HTMLDivElement>(null);
  const heroNameRef  = useRef<HTMLDivElement>(null);
  const hotHeadingRef = useRef<HTMLHeadingElement>(null);

  // Selected product for §3 content
  const [selectedProduct, setSelectedProduct] = useState<string>("t-pro-heatseal");

  useEffect(() => {
    let ctx: { revert?: () => void } = {};

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const m  = machineRef.current;
        const s2 = sec2Ref.current;
        const s3 = sec3Ref.current;
        if (!m || !s2 || !s3) return;

        const xAt = (pct: number) => window.innerWidth  * pct - m.offsetWidth  / 2;
        const yAt = (pct: number) => window.innerHeight * pct - m.offsetHeight / 2;

        gsap.set(m, {
          x: () => xAt(0.75),
          y: () => yAt(0.58),
          rotateY: 0, scale: 1,
          opacity: 0,
          visibility: "hidden",
          transformPerspective: 1800,
          transformOrigin: "center center",
        });

        // Show machine only when HeroSplash has fully scrolled off —
        // trigger fires when sec1 top hits the top of the viewport
        ScrollTrigger.create({
          trigger: sec1Ref.current,
          start: "top top",
          onEnter: () => {
            gsap.set(m, { visibility: "visible" });
            gsap.to(m, { opacity: 1, duration: 0.4, ease: "power2.out" });
          },
          onLeaveBack: () => {
            gsap.to(m, { opacity: 0, duration: 0.25, ease: "power2.in",
              onComplete: () => gsap.set(m, { visibility: "hidden" }) });
          },
        });

        gsap.set(sec2TextRef.current,  { opacity: 1, y: 0 });
        gsap.set(sec3LeftRef.current,  { opacity: 1, x: 0 });
        gsap.set(sec3RightRef.current, { opacity: 1, x:  0 });

        // ── §1 → §2 : right col → left col + flip ────────────────────────
        const tl1 = gsap.timeline({ paused: true });

        tl1.to(m, { x: () => xAt(0.25), duration: 0.60, ease: "power2.inOut" }, 0);
        tl1.to(m, { rotateY: 90,  duration: 0.18, ease: "power3.in"  }, 0.60);
        tl1.to(m, { rotateY: 180, duration: 0.15, ease: "power3.out" }, 0.78);

        ScrollTrigger.create({
          trigger: s2, start: "top bottom+=100", end: "center center",
          animation: tl1, scrub: 1.2, invalidateOnRefresh: true,
        });

        // ── §2 → §3 : left col → center, no flip ─────────────────────────
        // x (horizontal handoff) and y (settle into the column box) are
        // driven by ONE trigger spanning the whole section so there is no
        // seam between separate triggers — a seam at "center center" broke
        // continuity on reverse/upward scroll (onUpdate from the other
        // trigger simply never fired again once you crossed back over it).
        //
        // y is interpolated FROM the §1/§2 resting position (yAt(0.58))
        // TOWARD the column-center target, keyed on the same progress as x.
        // Previously y was hard-set to the column target with no link back
        // to the resting position, so scrolling back up out of §3 left the
        // machine stuck at its last §3 value instead of returning upward.
        const center = sec3CenterRef.current;

        const colCenterY = () => {
          if (!center) return yAt(0.58);
          const rect = center.getBoundingClientRect();
          const half = m.offsetHeight / 2;
          const colCenter = rect.top + rect.height / 2;
          const minY = rect.top + half;
          const maxY = rect.bottom - half;
          return Math.min(Math.max(colCenter, minY), maxY) - half;
        };

        // Starts at s2 "center center" — i.e. exactly where tl1 above ends —
        // not at s3's own "top bottom", which fires while §2 is still the
        // section on screen and was fighting tl1 for control of x/y.
        ScrollTrigger.create({
          trigger: s2,
          start: "center center",
          endTrigger: s3,
          end: "bottom top",
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // x/y settle in over the first portion of the range, then hold
            const settleProgress = Math.min(self.progress / 0.2, 1);
            gsap.set(m, {
              x: gsap.utils.interpolate(xAt(0.25), xAt(0.50), settleProgress),
              y: gsap.utils.interpolate(yAt(0.58), colCenterY(), settleProgress),
            });
          },
        });

        // ── Card strip: reveal right → left as it scrolls into view ──────
        const cards = cardStripRef.current
          ? Array.from(cardStripRef.current.querySelectorAll<HTMLElement>("[data-card-index]"))
          : [];

        if (cards.length) {
          gsap.set(cards, { opacity: 0, x: 60 });
          const reversedCards = [...cards].reverse();

          ScrollTrigger.create({
            trigger: cardStripRef.current,
            start: "top bottom-=80",
            onEnter: () => {
              gsap.to(reversedCards, {
                opacity: 1, x: 0,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.08,
                overwrite: true,
              });
            },
            onLeaveBack: () => {
              gsap.to(reversedCards, {
                opacity: 0, x: 60,
                duration: 0.4,
                ease: "power2.in",
                stagger: 0.04,
                overwrite: true,
              });
            },
          });
        }

        // ── Hero company name: letter rise, replays every time it
        // scrolls into view (both scrolling down into §1 and back up) ──
        const heroLetters = heroNameRef.current
          ? Array.from(heroNameRef.current.querySelectorAll<HTMLElement>("[data-letter]"))
          : [];

        if (heroLetters.length) {
          gsap.set(heroLetters, { opacity: 0, y: "110%", skewY: 6 });

          const playHeroName = () => {
            gsap.to(heroLetters, {
              opacity: 1, y: "0%", skewY: 0,
              duration: 0.6,
              ease: "expo.out",
              stagger: 0.028,
              overwrite: true,
            });
          };
          const resetHeroName = () => {
            gsap.to(heroLetters, {
              opacity: 0, y: "110%", skewY: 6,
              duration: 0.35,
              ease: "power2.in",
              stagger: 0.012,
              overwrite: true,
            });
          };

          ScrollTrigger.create({
            trigger: heroNameRef.current,
            start: "top bottom",
            end: "bottom top",
            onEnter: playHeroName,
            onEnterBack: playHeroName,
            onLeave: resetHeroName,
            onLeaveBack: resetHeroName,
          });
        }

        // ── "Hot Machines" heading: word reveal, replays on scroll
        // into view (both directions) ──────────────────────────────────
        const hotWords = hotHeadingRef.current
          ? Array.from(hotHeadingRef.current.querySelectorAll<HTMLElement>("[data-hot-word]"))
          : [];

        if (hotWords.length) {
          gsap.set(hotWords, { opacity: 0, y: 36 });

          const playHotHeading = () => {
            gsap.to(hotWords, {
              opacity: 1, y: 0,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.12,
              overwrite: true,
            });
          };
          const resetHotHeading = () => {
            gsap.to(hotWords, {
              opacity: 0, y: 36,
              duration: 0.3,
              ease: "power2.in",
              stagger: 0.06,
              overwrite: true,
            });
          };

          ScrollTrigger.create({
            trigger: hotHeadingRef.current,
            start: "top bottom-=60",
            end: "bottom top",
            onEnter: playHotHeading,
            onEnterBack: playHotHeading,
            onLeave: resetHotHeading,
            onLeaveBack: resetHotHeading,
          });
        }

      });
    })();

    return () => { ctx.revert?.(); };
  }, []);

  // ── Card click: update §3 content with selected product ──────────
  const handleCardClick = (slug: string) => {
    setSelectedProduct(slug);
    setMobileIdx(CARDS.findIndex(c => c.slug === slug));
  };

  // ── Slider arrows: scroll the card row left/right ─────────────────
  const slideCards = (dir: -1 | 1) => {
    const row = cardRowRef.current;
    if (!row) return;
    row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  };

  // ── Mobile machine navigator ──────────────────────────────────────
  const [mobileIdx, setMobileIdx] = useState(0);
  const mobilePrev = () => {
    const idx = (mobileIdx - 1 + CARDS.length) % CARDS.length;
    setMobileIdx(idx);
    setSelectedProduct(CARDS[idx].slug);
  };
  const mobileNext = () => {
    const idx = (mobileIdx + 1) % CARDS.length;
    setMobileIdx(idx);
    setSelectedProduct(CARDS[idx].slug);
  };
  const mobileCard = CARDS[mobileIdx];

  return (
    <>
      {/* ── Persistent machine — top:0 left:0, GSAP drives all x/y ── */}
      <div
        ref={machineRef}
        id="hero-machine-0"
        style={{
          position: "fixed", top: 0, left: 0,
          width: "clamp(200px, 35vw, 600px)",
          zIndex: 50, pointerEvents: "none",
          visibility: "hidden",
        }}
      >
        <Image
          src={`/machines/${selectedProduct}.png`}
          alt={CARDS.find(c => c.slug === selectedProduct)?.name ?? ""}
          width={600}
          height={600}
          priority
          style={{ width: "100%", height: "auto", objectFit: "contain",
            filter: "drop-shadow(0 24px 56px rgba(0,0,0,0.65))" }}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          §1 HERO — text left | machine right
      ══════════════════════════════════════════════════ */}
      <section ref={sec1Ref} className="sh-section sh-full" style={{
        position: "relative",
        display: "flex", alignItems: "center",
        background: "var(--bg-base)", overflow: "hidden",
      }}>
        <div className="sh-sec" style={{
          width: "50%",
          padding: "0 clamp(1.25rem, 5vw, 4rem) 0 clamp(2.5rem, 8vw, 6rem)",
          paddingTop: "80px", zIndex: 2,
        }}>

          {/* ── Company name — letter rise, replays on scroll into view ── */}
          {(() => {
            const WORDS = ["WENZHOU", "ASHAL", "INNOMACH", "TECHNOLOGY"];
            return (
              <div ref={heroNameRef} style={{ marginBottom: "2rem" }}>
                <div style={{
                  fontFamily: "var(--ff-display)",
                  fontSize: "clamp(1.5rem, 3.4vw, 2.8rem)",
                  letterSpacing: "0.06em",
                  lineHeight: 1.05,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  columnGap: "0.3em",
                  rowGap: "0.05em",
                }}>
                  {WORDS.map((word, wi) => {
                    const isAccent = wi === 1; // "ASHAL" in molten
                    return (
                      <span key={wi} style={{ display: "inline-flex", overflow: "hidden" }}>
                        {word.split("").map((ch, ci) => (
                          <span key={ci} data-letter style={{
                            display: "inline-block",
                            color: isAccent ? "var(--brand-red)" : "rgba(255,255,255,0.9)",
                          }}>{ch}</span>
                        ))}
                      </span>
                    );
                  })}
                </div>
                <div style={{
                  height: "1px",
                  background: "linear-gradient(to right, var(--molten), rgba(225,29,72,0.18), transparent)",
                  marginTop: "0.55rem",
                }} />
              </div>
            );
          })()}

          <h1 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(3rem, 9vw, 7rem)",
            lineHeight: 0.92, color: "#fff",
          }}>
            Film to bag<br />
            <span style={{ color: "var(--brand-red)" }}>at 300/min.</span>
          </h1>

          <p style={{
            fontFamily: "var(--ff-body)", fontSize: "1.08rem", fontWeight: 400,
            color: "rgba(255,255,255,0.75)", maxWidth: "44ch", marginTop: "1.5rem",
            lineHeight: 1.72, letterSpacing: "0.01em",
          }}>
            Multi-lane heat-seal and bottom-seal converters for PE and biodegradable PBAT+PLA film.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
            <AetherBtn><TransitionLink href="/products/bag-making">
              Bag making lines →
            </TransitionLink></AetherBtn>
            <TransitionLink href="/inquiries" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              fontFamily: "var(--ff-mono)", fontSize: "0.78rem", letterSpacing: "0.08em",
              textTransform: "uppercase", padding: "0.85rem 1.5rem",
              border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.78)",
              transition: "border-color 0.2s, color 0.2s",
              textDecoration: "none",
            }}>
              Request a quote
            </TransitionLink>
          </div>
          {/* Machine image — mobile only */}
          <Image
            src="/machines/t-pro-heatseal.png"
            alt="T-PRO Heat-seal converter"
            className="sh-machine-mobile"
            width={320}
            height={320}
            style={{
              display: "none",
              width: "100%", maxWidth: "320px",
              height: "auto",
              margin: "2rem auto 0",
              filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div className="sh-spacer" style={{ width: "50%" }} />

        <div className="scroll-hint" style={{ zIndex: 10 }}>
          <div className="scroll-hint__line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          §2 — machine left | spec data right
      ══════════════════════════════════════════════════ */}
      <section ref={sec2Ref} className="sh-section sh-full" style={{
        position: "relative",
        display: "flex", alignItems: "center",
        background: "var(--bg-base)",
        borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
      }}>
        <div className="sh-spacer" style={{ width: "50%", flexShrink: 0 }} />

        <div ref={sec2TextRef} className="sh-sec sh-sec2-text"
          style={{ width: "50%", padding: "0 clamp(1.25rem, 5vw, 4rem)" }}>

          <h2 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            color: "#fff", lineHeight: 0.94, marginBottom: "1.5rem",
          }}>
            Every bag type.<br />
            <span style={{ color: "var(--brand-teal)" }}>One machine.</span>
          </h2>

          <p style={{
            fontFamily: "var(--ff-body)", fontSize: "1.05rem", fontWeight: 400,
            color: "rgba(255,255,255,0.75)", maxWidth: "42ch", lineHeight: 1.75,
            letterSpacing: "0.01em", marginBottom: "2rem",
          }}>
            Heat-seal flat bags, bottom-seal bags and roll bags — all from the
            same platform. Up to 6 lanes, 600 pieces per minute.
          </p>

          {/* Inline spec list — no hero-metric grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "2rem" }}>
            {[
              { label: "Output",    value: "600 pcs / min" },
              { label: "Film width", value: "750 – 1150 mm" },
              { label: "Lanes",     value: "Up to 6"        },
            ].map((s) => (
              <div key={s.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}>
                <span style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.65)",
                }}>{s.label}</span>
                <span style={{
                  fontFamily: "var(--ff-display)", fontSize: "1.05rem",
                  color: "rgba(255,255,255,0.88)",
                }}>{s.value}</span>
              </div>
            ))}
          </div>

          <AetherBtn><TransitionLink href="/products/bag-making">
            Full spec table →
          </TransitionLink></AetherBtn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          §3 — specs left | machine center | features right
               + machine card strip at bottom
      ══════════════════════════════════════════════════ */}
      <section ref={sec3Ref} className="sh-section" style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        background: "var(--bg-base)",
        borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
      }}>
        {/* ── MOBILE-ONLY machine carousel ── */}
        <div className="sh-mob-carousel">

          {/* 1. Main image + left/right arrows */}
          <div style={{
            position: "relative", width: "100%",
            background: "rgba(255,255,255,0.03)",
            display: "flex", alignItems: "center", justifyContent: "center",
            aspectRatio: "16/9", overflow: "hidden",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "1rem",
          }}>
            <Image
              src={`/machines/${mobileCard.slug}.png`}
              alt={mobileCard.name}
              fill
              sizes="90vw"
              style={{
                width: "85%", height: "100%",
                margin: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.65))",
                transition: "opacity 0.25s ease",
              }}
            />
          </div>

          {/* Nav row — prev/next below image */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.5rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <button onClick={mobilePrev} aria-label="Previous machine" style={{
              width: 36, height: 36, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.14)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
              {String(mobileIdx + 1).padStart(2,"0")} / {String(CARDS.length).padStart(2,"0")}
            </span>
            <button onClick={mobileNext} aria-label="Next machine" style={{
              width: 36, height: 36, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.14)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* 2. Product thumbnail list — scrollable row right below image */}
          <div style={{
            display: "flex", gap: "0",
            overflowX: "auto", scrollbarWidth: "none",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {CARDS.map((card, i) => (
              <button
                key={card.slug}
                onClick={() => { setMobileIdx(i); setSelectedProduct(card.slug); }}
                style={{
                  flexShrink: 0, width: "25%", minWidth: 80,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "0.3rem",
                  padding: "0.75rem 0.4rem",
                  background: i === mobileIdx ? "rgba(43,191,179,0.08)" : "rgba(255,255,255,0.02)",
                  borderBottom: i === mobileIdx ? "2px solid var(--brand-teal)" : "2px solid transparent",
                  cursor: "pointer", transition: "background 0.18s",
                }}
              >
                <Image
                  src={`/machines/${card.slug}.png`}
                  alt={card.name}
                  width={48}
                  height={36}
                  style={{ objectFit: "contain",
                    opacity: i === mobileIdx ? 1 : 0.45,
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
                    transition: "opacity 0.18s",
                  }}
                />
                <span style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.62rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: i === mobileIdx ? "var(--brand-teal)" : "rgba(255,255,255,0.3)",
                  textAlign: "center", lineHeight: 1.3,
                  transition: "color 0.18s",
                }}>
                  {card.name.split("·")[0].trim()}
                </span>
              </button>
            ))}
          </div>

          {/* 3. Name + specs + features */}
          <div style={{ padding: "1.25rem 1.25rem 2rem" }}>
            {/* Name */}
            <div style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.64rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--brand-teal)", marginBottom: "0.3rem",
            }}>Hot Machine</div>
            <div style={{
              fontFamily: "var(--ff-display)", fontSize: "clamp(1.5rem, 6vw, 2rem)",
              color: "#fff", lineHeight: 1.1, marginBottom: "1.25rem",
            }}>
              {mobileCard.name}
            </div>

            {/* Specs */}
            <div style={{ marginBottom: "1.5rem" }}>
              {(PRODUCT_DATA[mobileCard.slug]?.specs ?? []).map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>{row.label}</span>
                  <span style={{ fontFamily: "var(--ff-display)", fontSize: "0.88rem", color: "rgba(255,255,255,0.88)" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Features */}
            <div>
              {(PRODUCT_DATA[mobileCard.slug]?.features ?? []).map(f => (
                <div key={f.head} style={{
                  marginBottom: "0.75rem",
                  padding: "0.65rem 0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <span style={{ fontFamily: "var(--ff-display)", fontSize: "0.92rem", color: "rgba(255,255,255,0.9)", display: "block" }}>{f.head}</span>
                  <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.76rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, display: "block", marginTop: "0.15rem" }}>{f.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* section heading */}
        <h1 ref={hotHeadingRef} className="sh-hot-head" style={{
          fontFamily: "var(--ff-display)",
          fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
          letterSpacing: "0.01em",
          lineHeight: 1,
          color: "#fff",
          textAlign: "center",
          marginTop: "clamp(2rem, 5vw, 3.5rem)",
          overflow: "hidden",
          width: "100%",
        }}>
          <span data-hot-word style={{ display: "inline-block" }}>Hot</span>{" "}
          <span data-hot-word style={{ display: "inline-block", color: "var(--brand-red)" }}>Machines</span>
        </h1>

        {/* top content row */}
        <div className="sh-3col" style={{
          flex: 1, display: "flex", alignItems: "flex-start",
          padding: "4rem clamp(1.25rem, 3vw, 2.5rem) 0",
        }}>
          {/* LEFT — specifications */}
          <div ref={sec3LeftRef} className="sh-sec" style={{ width: "30%" }}>
            <p style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--brand-teal)", marginBottom: "1.75rem",
            }}>Specifications</p>

            {(PRODUCT_DATA[selectedProduct]?.specs ?? []).map((row) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline", gap: "0.5rem",
                padding: "0.65rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}>
                <span style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.65)", flexShrink: 0,
                }}>{row.label}</span>
                <span style={{
                  fontFamily: "var(--ff-display)", fontSize: "0.95rem",
                  color: "rgba(255,255,255,0.88)", textAlign: "right",
                }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* CENTER — machine floats here (fixed) */}
          <div ref={sec3CenterRef} className="sh-spacer" style={{ width: "40%", alignSelf: "stretch" }} />

          {/* RIGHT — key features */}
          <div ref={sec3RightRef} className="sh-sec" style={{ width: "30%" }}>
            <p style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--brand-teal)", marginBottom: "1.75rem",
            }}>Key features</p>

            {(PRODUCT_DATA[selectedProduct]?.features ?? []).map((f) => (
              <div key={f.head} style={{
                marginBottom: "1.5rem",
                padding: "0.85rem 1rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <span style={{
                  fontFamily: "var(--ff-display)", fontSize: "1rem",
                  color: "rgba(255,255,255,0.9)", display: "block",
                }}>{f.head}</span>
                <span style={{
                  fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 400,
                  color: "rgba(255,255,255,0.7)", lineHeight: 1.65,
                  display: "block", marginTop: "0.25rem",
                }}>{f.body}</span>
              </div>
            ))}

            <div style={{ marginTop: "2rem" }}>
              <AetherBtn><TransitionLink href="/products/bag-making">
                Full spec table →
              </TransitionLink></AetherBtn>
            </div>
          </div>
        </div>

        {/* ── Machine card strip ── */}
        <div ref={cardStripRef} className="sh-card-strip-wrap" style={{
          position: "relative",
          marginTop: "clamp(3rem, 14vh, 8rem)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "var(--bg-base)",
          padding: "2rem clamp(1.25rem, 3vw, 2.5rem) 2.5rem",
        }}>
          <button aria-label="Scroll machines left" onClick={() => slideCards(-1)} className="sh-slide-arrow sh-slide-arrow--left">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button aria-label="Scroll machines right" onClick={() => slideCards(1)} className="sh-slide-arrow sh-slide-arrow--right">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          <div ref={cardRowRef} style={{
            display: "flex", gap: "1.25rem",
            overflowX: "auto", scrollbarWidth: "none", paddingBottom: "0.5rem",
          }}>
            {CARDS.map((card, i) => (
              <button
                key={card.slug}
                data-card-index={i}
                onClick={() => handleCardClick(card.slug)}
                style={{
                  flexShrink: 0,
                  width: "clamp(220px, 20vw, 280px)",
                  display: "flex", flexDirection: "column", gap: "0.75rem",
                  padding: "1.25rem 1.25rem 1.5rem",
                  background: selectedProduct === card.slug
                    ? "rgba(225,29,72,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: selectedProduct === card.slug
                    ? "1px solid var(--brand-red)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderTop: selectedProduct === card.slug
                    ? "2px solid var(--brand-red)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 0,
                  cursor: "pointer",
                  transition: "background 0.22s, border-color 0.22s",
                }}
                onMouseEnter={(e) => {
                  if (selectedProduct !== card.slug) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProduct !== card.slug) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }}
              >
                <div style={{
                  position: "relative",
                  width: "100%", aspectRatio: "16/10",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  <Image
                    src={`/machines/${card.slug}.png`}
                    alt={card.name}
                    fill
                    sizes="(max-width: 700px) 45vw, 22vw"
                    style={{
                      width: "82%", height: "82%", margin: "auto",
                      objectFit: "contain",
                      filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.55))",
                    }}
                  />
                </div>
                <span style={{
                  fontFamily: "var(--ff-display)", fontSize: "1.05rem",
                  letterSpacing: "0.02em",
                  color: selectedProduct === card.slug ? "#fff" : "rgba(255,255,255,0.45)",
                  lineHeight: 1.25, textAlign: "left",
                  transition: "color 0.2s",
                }}>
                  {card.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <style suppressHydrationWarning>{`
        .sh-card-strip::-webkit-scrollbar { display: none; }
        .sh-slide-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 42px; height: 42px; border-radius: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.78);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 5;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .sh-slide-arrow:hover {
          background: var(--brand-red); color: #fff; border-color: var(--brand-red);
        }
        .sh-slide-arrow--left  { left: clamp(0.25rem, 1.5vw, 1.25rem); }
        .sh-slide-arrow--right { right: clamp(0.25rem, 1.5vw, 1.25rem); }
        @media (max-width: 768px) {
          .sh-slide-arrow { width: 34px; height: 34px; }
        }

        /* ── ScrollHome mobile — all sections visible ── */
        @media (max-width: 768px) {
          .scroll-hint { display: none !important; }
          .sh-machine-mobile { display: block !important; }
          .sh-sec h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }
          .sh-sec h2 { font-size: clamp(1.7rem, 8vw, 2.8rem) !important; }
          .sh-sec p  { font-size: 0.88rem !important; max-width: 100% !important; }
          .sh-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sh-mob-carousel { display: block !important; }
          .sh-card-strip-wrap { display: none !important; }
        }

        /* mobile carousel — hidden on desktop */
        .sh-mob-carousel { display: none; }
        @media (max-width: 480px) {
          .sh-sec { padding: 1rem !important; }
          .sh-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .sh-section { padding: 4rem 0 2rem !important; }
        }
      `}</style>
    </>
  );
}
