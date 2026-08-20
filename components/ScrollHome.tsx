"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import AetherBtn from "@/components/AetherBtn";
import { useCms } from "@/lib/useCms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

// Machine card slugs shown at the bottom of §3 — display names come from
// the scrollHome.cards translation namespace, keyed by slug
const CARD_SLUGS = [
  "t-pro-heatseal",
  "f-pro-bottomseal",
  "rgb-rollbag",
  "rb-vegetable",
  "abcde-2200",
  "abc-multilayer-large",
  "s-wide",
  "cx-pelletizing",
] as const;

type Spec = { label: string; value: string };
type Feature = { head: string; body: string };

type ProductDetail = {
  specs: Spec[];
  features: Feature[];
};

// Machine is fixed top:0 left:0. GSAP drives x/y only — no CSS centering.
// §1 → 75vw × 50vh  |  §2 → 25vw × 50vh  |  §3 → 50vw × 50vh

export default function ScrollHome() {
  const t = useTranslations("scrollHome");

  // live CMS content (admin panel, English-only) overrides the translated
  // fallback below when the admin has edited this section
  const cmsBags = useCms<{ items: ({ slug: string } & ProductDetail)[] }>("scrollhome-bags", { items: [] });
  const defaultProductData = t.raw("products") as Record<string, ProductDetail>;
  const PRODUCT_DATA: Record<string, ProductDetail> =
    cmsBags.items && cmsBags.items.length
      ? Object.fromEntries(cmsBags.items.map(({ slug, ...rest }) => [slug, rest]))
      : defaultProductData;
  const CARDS = CARD_SLUGS.map((slug) => ({ slug, name: t(`cards.${slug}`) }));
  const machineRef   = useRef<HTMLDivElement>(null);
  const sec1Ref      = useRef<HTMLElement>(null);
  const sec1AnchorRef = useRef<HTMLDivElement>(null);
  const sec2Ref      = useRef<HTMLDivElement>(null);
  const sec2TextRef  = useRef<HTMLDivElement>(null);
  const sec2AnchorRef = useRef<HTMLDivElement>(null);
  const sec3Ref      = useRef<HTMLDivElement>(null);
  const sec3LeftRef  = useRef<HTMLDivElement>(null);
  const sec3RightRef = useRef<HTMLDivElement>(null);
  const sec3CenterRef = useRef<HTMLDivElement>(null);
  const sec3CarouselImgRef = useRef<HTMLDivElement>(null);
  const cardStripRef = useRef<HTMLDivElement>(null);
  const cardRowRef   = useRef<HTMLDivElement>(null);
  const heroNameRef  = useRef<HTMLDivElement>(null);
  const hotHeadingRef = useRef<HTMLHeadingElement>(null);

  // Selected product for §3 content
  const [selectedProduct, setSelectedProduct] = useState<string>("t-pro-heatseal");

  // ScrollTrigger is a separate plugin bundle — load it lazily since this
  // pinned scroll choreography isn't needed until the user actually scrolls,
  // then hand off to useGSAP once it's ready. ScrollTrigger itself is kept
  // in a ref (not just registered) since the body below calls .create(),
  // .refresh() and .addEventListener() on it directly by name.
  const [pluginReady, setPluginReady] = useState(false);
  const ScrollTriggerRef = useRef<typeof import("gsap/ScrollTrigger").ScrollTrigger | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTriggerRef.current = ScrollTrigger;
      setPluginReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useGSAP(() => {
    if (!pluginReady || !ScrollTriggerRef.current) return;
    const ScrollTrigger = ScrollTriggerRef.current;

    const m  = machineRef.current;
    const s2 = sec2Ref.current;
    const s3 = sec3Ref.current;
    if (!m || !s2 || !s3) return;

        const xAt = (pct: number) => window.innerWidth  * pct - m.offsetWidth  / 2;
        const yAt = (pct: number) => window.innerHeight * pct - m.offsetHeight / 2;
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        gsap.set(m, {
          x: () => xAt(isMobile ? 0.5 : 0.75),
          y: () => yAt(0.58),
          rotateY: 0, scale: 1,
          opacity: 0,
          visibility: "hidden",
          transformPerspective: 1800,
          transformOrigin: "center center",
        });

        // Show the machine as soon as §1 is on screen — desktop waits
        // until HeroSplash has fully scrolled off (sec1 top hits the
        // viewport top); mobile shows it as soon as its anchor starts
        // entering from the bottom ("top 90%") — the SAME element and
        // threshold the position-hold trigger below starts from, so
        // opacity and position always engage together. (Using sec1Ref
        // itself here instead would fire earlier, since the anchor sits
        // further down the section below the heading/copy/buttons —
        // opacity would turn on a beat before position was set, flashing
        // the machine at its stale page-load default spot.)
        ScrollTrigger.create({
          trigger: isMobile ? sec1AnchorRef.current : sec1Ref.current,
          start: isMobile ? "top 90%" : "top top",
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

        if (isMobile) {
          // ── Mobile: same traveling machine as desktop, no side columns
          // to fly between though — §1/§2/§3 are stacked full-width.
          // Each section gets a small invisible "stage" (.sh-machine-anchor
          // for §1/§2, .sh-3col-center for §3 — same element desktop uses)
          // and the machine's x/y continuously track that anchor's live
          // getBoundingClientRect(), mirroring desktop's exact two-trigger
          // range structure (tl1's range, then the §2→§3 range) plus one
          // extra "hold" trigger covering §1 itself (desktop doesn't need
          // this — the machine starts the whole sequence already inside
          // §1's own column, it doesn't need a trigger to get there first).
          const a1 = sec1AnchorRef.current;
          const a2 = sec2AnchorRef.current;
          const a3 = sec3CenterRef.current;

          // Fill each anchor's reserved box instead of floating in it —
          // #hero-machine-0's CSS width was an independent viewport-%
          // value only loosely tuned to match .sh-machine-anchor's own
          // (100%, max-width:340px) sizing, so it landed well under the
          // anchor's actual width and left a visible unfilled margin all
          // around it. Sizing directly off the anchor's own live rect
          // guarantees a real fit, and stays correct if the anchor's CSS
          // ever changes without the two needing to be kept in sync by hand.
          const FILL = 0.92;
          const sizeToAnchor = (el: HTMLElement | null) => {
            if (!el) return;
            const w = el.getBoundingClientRect().width * FILL;
            if (w > 0) gsap.set(m, { width: w });
          };
          const anchorX = (el: HTMLElement | null) => {
            if (!el) return xAt(0.5);
            const rect = el.getBoundingClientRect();
            return rect.left + rect.width / 2 - m.offsetWidth / 2;
          };
          // Nudged up from dead-center within the anchor box (toward the
          // text above it) — sitting exactly centered read as floating in
          // its blank space rather than belonging to the section.
          const ANCHOR_Y_LIFT = 6;
          const anchorY = (el: HTMLElement | null) => {
            if (!el) return yAt(0.58);
            const rect = el.getBoundingClientRect();
            return rect.top + rect.height / 2 - m.offsetHeight / 2 - ANCHOR_Y_LIFT;
          };

          // Guard against implausible single-frame position jumps. Every
          // legitimate update here — hold tracking a slowly-scrolling
          // anchor, or a scrub-smoothed travel interpolation — moves the
          // machine a few px at a time, never hundreds of px in one call.
          // getBoundingClientRect() reads occasionally came back with a
          // wildly wrong value for a single frame (observed: a live
          // anchor mid-hold jumping from y≈266 to y≈2331 between two
          // consecutive onUpdate calls with no matching scroll delta) —
          // root cause not fully pinned down, but rejecting a jump no
          // real scroll gesture could produce is correct either way.
          let lastGoodY: number | null = null;
          const setMachinePos = (x: number, y: number) => {
            if (lastGoodY !== null && Math.abs(y - lastGoodY) > 600) return;
            lastGoodY = y;
            gsap.set(m, { x, y });
          };

          // Hold-then-travel, chained with zero gaps: each phase's start
          // is exactly the previous phase's end (same technique desktop
          // uses for its §2→§3 trigger) so there's never a moment where
          // nothing is tracking the machine's position. While an anchor
          // is prominently on screen (from first appearing down to its
          // top having scrolled up to just 5% from the viewport top —
          // "the blank space [is] 5% hidden by scroll") the machine sits
          // at that anchor's live position; only after that does it
          // travel toward the next one.
          //
          // The travel phase ends at SETTLE ("top 55%" — comfortably
          // inside the viewport, not just barely peeking in) rather than
          // "top 90%": at 90% only the very top edge of the next anchor
          // has appeared, so its *center* (what anchorY actually targets)
          // is still below the fold. Handing off to "hold" right then
          // held the machine off-screen until scrolling caught up.
          // SETTLE is reused as both the travel-end and the next hold's
          // own start so the two stay perfectly chained either way.
          const SETTLE = "top 55%";

          if (a1) {
            ScrollTrigger.create({
              trigger: a1, start: "top 90%", end: "top 5%",
              onUpdate: () => {
                sizeToAnchor(a1);
                setMachinePos(anchorX(a1), anchorY(a1));
              },
            });
          }

          const travelThenHold = (from: HTMLElement, to: HTMLElement) => {
            // `from`'s live position must be frozen at the moment travel
            // starts, not re-read every frame: it's a normal element that
            // keeps scrolling further past the top of the screen for the
            // rest of the trigger's range, so its y grows increasingly
            // (unboundedly) negative. Interpolating against that *live*
            // value meant even a small early-progress weighting on an
            // already-huge-negative number dragged the result far
            // off-screen — which is exactly what was happening. `to` stays
            // live since it only ever converges toward a sane on-screen
            // spot as you scroll toward it, never diverges.
            let start: { x: number; y: number } | null = null;
            const captureStart = () => { start = { x: anchorX(from), y: anchorY(from) }; };
            ScrollTrigger.create({
              trigger: from, start: "top 5%",
              endTrigger: to, end: SETTLE,
              scrub: 0.6,
              onEnter: captureStart,
              onEnterBack: captureStart,
              onUpdate: (self) => {
                if (!start) captureStart();
                sizeToAnchor(self.progress < 0.5 ? from : to);
                setMachinePos(
                  gsap.utils.interpolate(start!.x, anchorX(to), self.progress),
                  gsap.utils.interpolate(start!.y, anchorY(to), self.progress),
                );
              },
            });
            ScrollTrigger.create({
              trigger: to, start: SETTLE, end: "top 5%",
              onUpdate: () => {
                sizeToAnchor(to);
                setMachinePos(anchorX(to), anchorY(to));
              },
            });
          };

          if (a1 && a2) travelThenHold(a1, a2);
          if (a2 && a3) travelThenHold(a2, a3);

          // §3's mobile carousel (.sh-mob-carousel) has its own real image
          // right at the top of §3 — let the flying machine fade out
          // before it arrives instead of flying on top of it and visibly
          // overlapping mid-transit, then reveal the carousel image after.
          // Both triggers use pure "top X%" viewport-percentage thresholds
          // tied directly to the carousel image itself — not "top
          // bottom+=Npx" pixel offsets against a *different* element
          // (§3's section, or even just measuring from §3's own top):
          // that arithmetic effectively subtracts one viewport height,
          // and §2 here is barely taller than one viewport, so any such
          // offset resolved to a scroll position back inside §2 — fading
          // the machine out (or revealing the carousel) far earlier than
          // intended. A percentage of the carousel image's own position
          // has no such dependency on how tall the previous section is.
          if (sec3CarouselImgRef.current) {
            const carouselImg = sec3CarouselImgRef.current;
            gsap.set(carouselImg, { opacity: 0 });
            ScrollTrigger.create({
              trigger: carouselImg,
              start: "top 85%",
              onEnter: () => gsap.to(m, { opacity: 0, duration: 0.3, ease: "power2.in" }),
              onLeaveBack: () => gsap.to(m, { opacity: 1, duration: 0.3, ease: "power2.out" }),
            });
            ScrollTrigger.create({
              trigger: carouselImg,
              start: "top 60%",
              onEnter: () => gsap.to(carouselImg, { opacity: 1, duration: 0.35, ease: "power2.out" }),
              onLeaveBack: () => gsap.to(carouselImg, { opacity: 0, duration: 0.2, ease: "power2.in" }),
            });
          }
        } else {
          // ── §1 → §2 : right col → left col + flip ──────────────────────
          // The flip lifts up in scale/z through the quarter-turn (deepest
          // at 90°, where the machine is edge-on and would otherwise read
          // as a flat width-collapse) then settles back down — sells the
          // turn as a real 3D object rotating through depth, not a 2D
          // card flip.
          const tl1 = gsap.timeline({ paused: true });

          tl1.to(m, { x: () => xAt(0.25), duration: 0.60, ease: "power2.inOut" }, 0);
          tl1.to(m, { rotateY: 90,  scale: 1.08, z: 60,  duration: 0.18, ease: "power3.in"  }, 0.60);
          tl1.to(m, { rotateY: 180, scale: 1,    z: 0,   duration: 0.15, ease: "power3.out" }, 0.78);

          ScrollTrigger.create({
            trigger: s2, start: "top bottom+=100", end: "center center",
            animation: tl1, scrub: 1.2, invalidateOnRefresh: true,
          });

          // ── §2 → §3 : left col → center, no flip ────────────────────────
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
        }

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

        // ── Hero company name: plain fade-up on the whole line, replays
        // every time it scrolls into view (both scrolling down into §1
        // and back up) — previously a per-letter skewed rise ──
        if (heroNameRef.current) {
          const heroLine = heroNameRef.current;
          gsap.set(heroLine, { opacity: 0, y: 24 });

          const playHeroName = () => {
            gsap.to(heroLine, {
              opacity: 1, y: 0,
              duration: 0.6,
              ease: "power2.out",
              overwrite: true,
            });
          };
          const resetHeroName = () => {
            gsap.to(heroLine, {
              opacity: 0, y: 24,
              duration: 0.35,
              ease: "power2.in",
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

    // Scrubbed triggers above recompute self.progress from GSAP's own
    // scroll-event sampling — a fast jump (anchor link, scrollbar
    // drag, browser back/forward, bfcache restore) can land inside
    // §2/§3 without enough intermediate samples, leaving the machine
    // image's x/y stuck at whatever an earlier trigger last set until
    // the user scrolls again. ScrollTrigger.update() replays the last
    // *cached* progress and doesn't fix this; only refresh() re-derives
    // progress from the real scroll position. Do that once the jump
    // settles (ScrollTrigger's own scrollEnd event fires regardless of
    // cause) so the machine never renders stuck mid-flight.
    const resync = () => ScrollTrigger.refresh();
    ScrollTrigger.addEventListener("scrollEnd", resync);
    // useGSAP's context only auto-reverts GSAP-tracked animations/triggers —
    // this raw ScrollTrigger static listener needs its own explicit cleanup.
    return () => { ScrollTrigger.removeEventListener("scrollEnd", resync); };
  }, { dependencies: [pluginReady] });

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
  // Which feature cards are expanded, per-card (independent, not accordion).
  // Reset on every machine switch so a card expanded for one machine doesn't
  // stay open when its features array (different heads) loads in.
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const toggleFeature = (head: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(head)) next.delete(head); else next.add(head);
      return next;
    });
  };
  const mobilePrev = () => {
    const idx = (mobileIdx - 1 + CARDS.length) % CARDS.length;
    setMobileIdx(idx);
    setSelectedProduct(CARDS[idx].slug);
    setExpandedFeatures(new Set());
  };
  const mobileNext = () => {
    const idx = (mobileIdx + 1) % CARDS.length;
    setMobileIdx(idx);
    setSelectedProduct(CARDS[idx].slug);
    setExpandedFeatures(new Set());
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
            const WORDS = t.raw("heroWords") as string[];
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
            {t("hero1.titleLine1")}<br />
            <span style={{ color: "var(--brand-red)" }}>{t("hero1.titleLine2")}</span>
          </h1>

          <p style={{
            fontFamily: "var(--ff-body)", fontSize: "1.08rem", fontWeight: 400,
            color: "rgba(255,255,255,0.75)", maxWidth: "44ch", marginTop: "1.5rem",
            lineHeight: 1.72, letterSpacing: "0.01em",
          }}>
            {t("hero1.desc")}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
            <AetherBtn><TransitionLink href="/products/bag-making">
              {t("hero1.ctaPrimary")}
            </TransitionLink></AetherBtn>
            <TransitionLink href="/inquiries" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              fontFamily: "var(--ff-mono)", fontSize: "0.78rem", letterSpacing: "0.08em",
              textTransform: "uppercase", padding: "0.85rem 1.5rem",
              border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.78)",
              transition: "border-color 0.2s, color 0.2s",
              textDecoration: "none",
            }}>
              {t("hero1.ctaSecondary")}
            </TransitionLink>
          </div>
          {/* Machine anchor — mobile only, invisible. Reserves the spot
              the flying #hero-machine-0 rests at for this section (see
              the mobile branch in useGSAP above). */}
          <div ref={sec1AnchorRef} className="sh-machine-anchor" aria-hidden="true" />
        </div>

        <div className="sh-spacer" style={{ width: "50%" }} />
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
            {t("hero2.titleLine1")}<br />
            <span style={{ color: "var(--brand-teal)" }}>{t("hero2.titleLine2")}</span>
          </h2>

          <p style={{
            fontFamily: "var(--ff-body)", fontSize: "1.05rem", fontWeight: 400,
            color: "rgba(255,255,255,0.75)", maxWidth: "42ch", lineHeight: 1.75,
            letterSpacing: "0.01em", marginBottom: "2rem",
          }}>
            {t("hero2.desc")}
          </p>

          {/* Inline spec list — no hero-metric grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "2rem" }}>
            {[
              { label: t("hero2.specs.output"),    value: t("hero2.specs.outputVal") },
              { label: t("hero2.specs.filmWidth"), value: t("hero2.specs.filmWidthVal") },
              { label: t("hero2.specs.lanes"),     value: t("hero2.specs.lanesVal") },
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
            {t("hero2.cta")}
          </TransitionLink></AetherBtn>

          {/* Machine anchor — mobile only, same purpose as §1's. */}
          <div ref={sec2AnchorRef} className="sh-machine-anchor" aria-hidden="true" />
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
          <div ref={sec3CarouselImgRef} style={{
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
            <button onClick={mobilePrev} aria-label={t("hot.prevAria")} style={{
              width: 44, height: 44, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.14)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
              {String(mobileIdx + 1).padStart(2,"0")} / {String(CARDS.length).padStart(2,"0")}
            </span>
            <button onClick={mobileNext} aria-label={t("hot.nextAria")} style={{
              width: 44, height: 44, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.14)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
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
                onClick={() => { setMobileIdx(i); setSelectedProduct(card.slug); setExpandedFeatures(new Set()); }}
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
            }}>{t("hot.hotMachine")}</div>
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

            {/* Features — 2-col grid, each card independently expandable */}
            <div>
              <p style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.64rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "var(--brand-teal)", marginBottom: "0.75rem",
              }}>{t("hot.keyFeatures")}</p>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "0.6rem", marginBottom: "1.5rem",
              }}>
                {(PRODUCT_DATA[mobileCard.slug]?.features ?? []).map(f => {
                  const isOpen = expandedFeatures.has(f.head);
                  return (
                    <button
                      key={f.head}
                      type="button"
                      onClick={() => toggleFeature(f.head)}
                      aria-expanded={isOpen}
                      style={{
                        gridColumn: isOpen ? "1 / -1" : undefined,
                        minHeight: 44,
                        textAlign: "left",
                        padding: "0.65rem 0.75rem",
                        background: isOpen ? "rgba(43,191,179,0.06)" : "rgba(255,255,255,0.03)",
                        border: isOpen ? "1px solid rgba(43,191,179,0.28)" : "1px solid rgba(255,255,255,0.07)",
                        borderRadius: ".6rem",
                        cursor: "pointer",
                        transition: "background 0.2s, border-color 0.2s, grid-column 0.2s",
                        display: "flex", flexDirection: "column",
                      }}
                    >
                      <span style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem",
                      }}>
                        <span style={{
                          fontFamily: "var(--ff-display)", fontSize: "0.86rem",
                          color: "rgba(255,255,255,0.9)",
                        }}>{f.head}</span>
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          aria-hidden="true"
                          style={{
                            flexShrink: 0, color: "var(--brand-teal)",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                      {isOpen && (
                        <span style={{
                          fontFamily: "var(--ff-body)", fontSize: "0.76rem",
                          color: "rgba(255,255,255,0.7)", lineHeight: 1.6,
                          display: "block", marginTop: "0.4rem",
                        }}>{f.body}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <AetherBtn><TransitionLink href="/products/bag-making">
                {t("hot.cta")}
              </TransitionLink></AetherBtn>
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
          <span data-hot-word style={{ display: "inline-block" }}>{t("hot.wordHot")}</span>{" "}
          <span data-hot-word style={{ display: "inline-block", color: "var(--brand-red)" }}>{t("hot.wordMachines")}</span>
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
            }}>{t("hot.specifications")}</p>

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
          <div ref={sec3CenterRef} className="sh-3col-center" style={{ width: "40%", alignSelf: "stretch" }} />

          {/* RIGHT — key features */}
          <div ref={sec3RightRef} className="sh-sec" style={{ width: "30%" }}>
            <p style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--brand-teal)", marginBottom: "1.75rem",
            }}>{t("hot.keyFeatures")}</p>

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
                {t("hot.cta")}
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
          padding: "2rem 0 2.5rem",
        }}>
          <button aria-label={t("hot.scrollLeftAria")} onClick={() => slideCards(-1)} className="sh-slide-arrow sh-slide-arrow--left">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button aria-label={t("hot.scrollRightAria")} onClick={() => slideCards(1)} className="sh-slide-arrow sh-slide-arrow--right">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          {/* edge fades signal there's more to scroll past the visible cards */}
          <div className="sh-strip-fade sh-strip-fade--left" aria-hidden="true" />
          <div className="sh-strip-fade sh-strip-fade--right" aria-hidden="true" />

          <div ref={cardRowRef} className="sh-card-row" style={{ padding: "0.5rem clamp(1.25rem, 3vw, 2.5rem) 0.75rem" }}>
            {CARDS.map((card, i) => {
              const active = selectedProduct === card.slug;
              return (
                <button
                  key={card.slug}
                  data-card-index={i}
                  data-active={active || undefined}
                  onClick={() => handleCardClick(card.slug)}
                  className="sh-card"
                  aria-pressed={active}
                >
                  <div className="sh-card__photo">
                    <Image
                      src={`/machines/${card.slug}.png`}
                      alt={card.name}
                      fill
                      sizes="(max-width: 700px) 45vw, 22vw"
                      className="sh-card__img"
                    />
                  </div>
                  <span className="sh-card__name">{card.name}</span>
                  <span className="sh-card__bar" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <style suppressHydrationWarning>{`
        .sh-card-strip::-webkit-scrollbar { display: none; }

        /* ── card row + edge fades ── */
        .sh-card-row {
          display: flex; gap: 1.25rem;
          overflow-x: auto; scrollbar-width: none;
        }
        .sh-card-row::-webkit-scrollbar { display: none; }
        .sh-strip-fade {
          position: absolute; top: 0; bottom: 0; width: clamp(1.5rem, 5vw, 4rem);
          z-index: 3; pointer-events: none;
        }
        .sh-strip-fade--left  { left: 0;  background: linear-gradient(90deg, var(--bg-base), transparent); }
        .sh-strip-fade--right { right: 0; background: linear-gradient(270deg, var(--bg-base), transparent); }

        /* ── machine card ── */
        .sh-card {
          flex-shrink: 0;
          width: clamp(220px, 20vw, 280px);
          display: flex; flex-direction: column; gap: 0.85rem;
          padding: 0.85rem 0.85rem 1rem;
          background: rgba(255,255,255,0.03);
          -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-sat));
                  backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-sat));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s, background 0.2s, transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .sh-card:hover {
          border-color: rgba(43,191,179,0.35);
          background: rgba(255,255,255,0.06);
          transform: translateY(-4px);
          box-shadow: 0 16px 32px -16px rgba(0,0,0,0.6), inset 0 1px 0 var(--glass-highlight);
        }
        .sh-card:focus-visible {
          outline: 2px solid var(--brand-teal); outline-offset: 2px;
        }
        .sh-card[data-active] {
          border-color: rgba(43,191,179,0.5);
          background: rgba(43,191,179,0.05);
        }
        .sh-card__photo {
          position: relative;
          width: 100%; aspect-ratio: 16/10;
          background: rgba(255,255,255,0.04);
          border-radius: 8px;
          overflow: hidden;
        }
        .sh-card__img {
          object-fit: contain; padding: 9%;
          filter: drop-shadow(0 10px 16px rgba(0,0,0,0.55));
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .sh-card:hover .sh-card__img { transform: scale(1.04); }
        .sh-card__name {
          font-family: var(--ff-display); font-size: 1.05rem;
          letter-spacing: 0.02em; line-height: 1.25;
          color: rgba(255,255,255,0.5);
          transition: color 0.2s;
        }
        .sh-card[data-active] .sh-card__name,
        .sh-card:hover .sh-card__name { color: #fff; }
        .sh-card__bar {
          display: block; height: 2px; width: 100%;
          background: var(--brand-teal);
          transform: scaleX(0); transform-origin: left center;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .sh-card[data-active] .sh-card__bar { transform: scaleX(1); }

        .sh-slide-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.78);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 5;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .sh-slide-arrow:hover {
          background: var(--brand-teal); color: #04211e; border-color: var(--brand-teal);
        }
        .sh-slide-arrow--left  { left: clamp(0.25rem, 1.5vw, 1.25rem); }
        .sh-slide-arrow--right { right: clamp(0.25rem, 1.5vw, 1.25rem); }
        @media (prefers-reduced-motion: reduce) {
          .sh-card, .sh-card__img, .sh-card__bar { transition: none; }
        }

        /* ── ScrollHome mobile ──────────────────────────────────────────
           Most mobile layout rules for this component (stacking, spacer
           collapse, §3 carousel swap, #hero-machine-0 sizing) live in
           app/globals.css next to the rest of the .sh-* mobile block —
           see the comment there. Only the bits unique to this file's own
           style tag stay here. */
        @media (max-width: 768px) {
          .sh-sec h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }
          .sh-sec h2 { font-size: clamp(1.7rem, 8vw, 2.8rem) !important; }
          .sh-sec p  { font-size: 0.88rem !important; max-width: 100% !important; }
          .sh-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* mobile carousel — hidden on desktop, shown on mobile */
        .sh-mob-carousel { display: none; }
        @media (max-width: 768px) {
          /* Show the dedicated mobile carousel */
          .sh-mob-carousel { display: block; }
          /* Hide the desktop card strip + arrow controls */
          .sh-card-strip-wrap { display: none !important; }
          /* Hide the 3-col spec/feature layout (mobile carousel handles it) */
          .sh-3col { display: none !important; }
          .sh-hot-head { display: none !important; }
        }
        @media (max-width: 480px) {
          .sh-sec { padding: 1rem !important; }
          .sh-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .sh-section { padding: 4rem 0 2rem !important; }
        }
      `}</style>
    </>
  );
}
