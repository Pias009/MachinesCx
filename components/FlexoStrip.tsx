"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import { useRouter } from "@/i18n/navigation";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";

gsap.registerPlugin(useGSAP);

// model tagline ("tag") text comes from the flexoStrip.models translation
// namespace, keyed by slug — everything else here is fixed catalogue data
const FAMILY_BASE: Omit<ProductFamily, "tagline">[] = [
  { slug:"flexo-2c", category:"printing", series:"AI-2C · 2-colour", name:"AI-2C", models:["AI-2C-500"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-1.png"], specs:[
    { label:"Printing Colours",      values:["2"] },
    { label:"Max Mechanical Speed",  values:["120m/min"] },
    { label:"Registration Accuracy", values:["±0.2mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-4c", category:"printing", series:"AI-4C · 4-colour", name:"AI-4C", models:["AI-4C-800"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-2.png"], specs:[
    { label:"Printing Colours",      values:["4"] },
    { label:"Max Mechanical Speed",  values:["200m/min"] },
    { label:"Registration Accuracy", values:["±0.15mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-6c", category:"printing", series:"AI-6C · 6-colour", name:"AI-6C", models:["AI-6C-1200"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-6c-nobg.png"], specs:[
    { label:"Printing Colours",      values:["6"] },
    { label:"Max Mechanical Speed",  values:["260m/min"] },
    { label:"Registration Accuracy", values:["±0.1mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-8c", category:"printing", series:"AI-8C · 8-colour", name:"AI-8C", models:["AI-8C-1600"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-4.png"], specs:[
    { label:"Printing Colours",      values:["8"] },
    { label:"Max Mechanical Speed",  values:["350m/min"] },
    { label:"Registration Accuracy", values:["±0.1mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
];

interface FlexoModel {
  slug: string;
  label: string;
  colours: number;
  speed: string;
  reg: string;
  img: string;
  tag: string;
  hot?: boolean;
  flagship?: boolean;
}

function findSpec(family: ProductFamily, label: string): string {
  return family.specs?.find(s => s.label === label)?.values?.[0] ?? "";
}

function buildModels(list: ProductFamily[]): FlexoModel[] {
  return list.map(f => ({
    slug: f.slug,
    label: f.series.split("·")[0].trim(),
    colours: parseInt(findSpec(f, "Printing Colours")) || 2,
    speed:   (findSpec(f, "Max Mechanical Speed").match(/\d+/) || ["120"])[0],
    reg:     findSpec(f, "Registration Accuracy") || "±0.2mm",
    img:     f.images?.[0] ?? "/machines/flexo-1.png",
    tag:     f.tagline ?? "",
    hot:      f.slug === "flexo-4c",
    flagship: f.slug === "flexo-8c",
  }));
}

// count-up for the numeric half of a spec value (e.g. "260" in "260m/min")
// — plays whenever the active model changes, giving each switch a live,
// machine-reading-out feel instead of the number just appearing.
function useCountTo(target: number, active: boolean, duration = 700) {
  const [display, setDisplay] = useState(target);
  const raf = useRef<number>();
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const from = display;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active]);
  return display;
}

export default function FlexoStrip() {
  const t = useTranslations("flexoStrip");
  const modelTags = t.raw("models") as Record<string, { tag: string }>;
  const localFamilies: ProductFamily[] = FAMILY_BASE.map((f) => ({ ...f, tagline: modelTags[f.slug]?.tag ?? "" }));
  const DEFAULT_MODELS: FlexoModel[] = buildModels(localFamilies);
  const SPECS = t.raw("specs") as { label: string; value: string }[];

  const cms = useCms<{ items?: FlexoModel[] }>("flexo-strip", { items: DEFAULT_MODELS });
  const MODELS = cms.items && cms.items.length ? cms.items : DEFAULT_MODELS;
  const router = useRouter();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const SLIDE_MS = 4200;
  const model = MODELS[active];
  const speedNum = useCountTo(parseInt(model.speed) || 0, true);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive(n => (n + 1) % MODELS.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, MODELS.length]);

  const goTo = useCallback((i: number) => setActive(i), []);

  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef  = useRef<HTMLSpanElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const stripRef    = useRef<HTMLDivElement>(null);

  const revealAll = () => {
    [eyebrowRef, lineRef, stageRef, stripRef].forEach(r => {
      if (r.current) { r.current.style.opacity = "1"; r.current.style.transform = "none"; }
    });
    if (titleRef.current) titleRef.current.style.opacity = "1";
  };

  const [pluginReady, setPluginReady] = useState(false);
  const SplitTextRef = useRef<typeof import("gsap/SplitText").SplitText | null>(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all([import("gsap/ScrollTrigger"), import("gsap/SplitText")])
      .then(([{ ScrollTrigger }, { SplitText }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        SplitTextRef.current = SplitText;
        setPluginReady(true);
      })
      .catch(() => { if (!cancelled) revealAll(); });
    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  useGSAP(() => {
    if (!pluginReady) return;
    const easeExp = "expo.out";
    const revTrigger = (target: Element | null, start: string) =>
      ({ trigger: target, start, end: "bottom top", toggleActions: "play reverse play reverse" });

    const headerTl = gsap.timeline({ scrollTrigger: revTrigger(sectionRef.current, "top 85%") });
    headerTl.fromTo(eyebrowRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1, ease: easeExp }, SECTION_ELEMENT_DELAY);
    headerTl.fromTo(lineRef.current, { scaleX: 0, transformOrigin: "left center", opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.4, ease: easeExp }, SECTION_ELEMENT_DELAY + 0.2);

    if (titleRef.current && SplitTextRef.current) {
      const split = new SplitTextRef.current(titleRef.current, { type: "chars" });
      headerTl.fromTo(split.chars,
        { y: "110%", opacity: 0, rotateX: -50, transformOrigin: "0% 50% -20px" },
        { y: "0%", opacity: 1, rotateX: 0, duration: 0.9, ease: easeExp, stagger: 0.022 },
        SECTION_ELEMENT_DELAY + 0.1
      );
    }

    gsap.fromTo(stageRef.current, { y: 32, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: easeExp, delay: SECTION_ELEMENT_DELAY + 0.15,
      scrollTrigger: revTrigger(stageRef.current, "top 85%"),
    });
    gsap.fromTo(stripRef.current, { y: 36, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: easeExp, delay: SECTION_ELEMENT_DELAY,
      scrollTrigger: revTrigger(stripRef.current, "top 90%"),
    });
  }, { scope: sectionRef, dependencies: [pluginReady] });

  // ── per-switch reveal: the new photo wipes in on a diagonal clip-path,
  // and the spec readout underneath prints in top-to-bottom — a single
  // authored moment replayed every time `active` changes, not a generic
  // fade/slide. GSAP owns this one timeline; everything else on the page
  // stays inert while it plays. ──
  const photoRef = useRef<HTMLDivElement>(null);
  const specWrapRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!photoRef.current) return;
    // kill any in-flight tween on the photo before starting a new one —
    // switching quickly (fast auto-advance, or rapid clicks on the index)
    // could otherwise leave the clip-path/scale stuck mid-tween from a
    // timeline that got superseded before it finished.
    gsap.killTweensOf(photoRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(photoRef.current, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", scale: 1 });
      return;
    }
    const tl = gsap.timeline();
    tl.fromTo(photoRef.current,
      { clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" },
      { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.85, ease: "power4.inOut" },
      0
    );
    tl.fromTo(photoRef.current, { scale: 1.12 }, { scale: 1, duration: 1.1, ease: "power3.out" }, 0);
    const rows = specWrapRef.current
      ? Array.from(specWrapRef.current.querySelectorAll<HTMLElement>(".fls-readout__row"))
      : [];
    tl.fromTo(rows, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06 }, 0.3);
  }, { dependencies: [active] });

  return (
    <section ref={sectionRef} className="fls-section" style={{
      background: "var(--bg-base)",
      borderTop: "1px solid var(--line)",
      padding: "clamp(6rem,11vw,11rem) 0 clamp(5rem,9vw,9rem)",
      overflow: "hidden",
      position: "relative",
    }}>
      <style suppressHydrationWarning>{`
        .fls-title-clip { overflow: hidden; }

        /* ── stage: name-index on the left acts as both label and nav;
           the photo fills the right at near-full presentation size ── */
        .fls-stage {
          display: grid;
          grid-template-columns: minmax(220px, 30%) 1fr;
          align-items: center;
          gap: clamp(2rem, 5vw, 5rem);
        }
        .fls-stage--wide-outer {
          width: 100vw;
          max-width: 1560px;
          margin-left: 50%;
          transform: translateX(-50%);
        }

        /* ── model index: oversized type list doubles as the navigation.
           No dots, no card chrome — the names themselves are the UI. ── */
        .fls-index { display: flex; flex-direction: column; gap: 0; }
        .fls-index__btn {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: baseline;
          gap: 0.9rem;
          padding: 0.5rem 0;
          font-family: var(--ff-display);
          font-size: clamp(1.6rem, 3.2vw, 2.6rem);
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--ink-35);
          transition: color .35s ease;
        }
        .fls-index__btn:hover { color: var(--ink-60); }
        .fls-index__num {
          font-family: var(--ff-mono);
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--brand-red);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity .35s ease, transform .35s ease;
          flex-shrink: 0;
        }
        .fls-index__btn--active {
          color: var(--ink);
          font-weight: 700;
        }
        .fls-index__btn--active .fls-index__num {
          opacity: 1;
          transform: translateX(0);
        }
        /* grid-rows collapse instead of max-height: the row track itself
           (not height/max-height) is what's animated, so this stays off
           the layout-thrash path while still clipping cleanly without
           having to know the tag's rendered height up front. */
        .fls-index__tag {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows .4s cubic-bezier(0.16,1,0.3,1), opacity .3s ease;
        }
        .fls-index__tag-inner {
          overflow: hidden;
          min-height: 0;
          font-family: var(--ff-body);
          font-size: 0.85rem;
          font-weight: 400;
          letter-spacing: 0;
          color: var(--ink-60);
        }
        .fls-index__btn--active .fls-index__tag {
          grid-template-rows: 1fr;
          opacity: 1;
          margin-top: 0.15rem;
        }
        .fls-index__row { display: flex; flex-direction: column; border-bottom: 1px solid var(--line); }
        .fls-index__row:last-child { border-bottom: none; }

        .fls-index__cta {
          margin-top: 1.75rem;
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: 0.8rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brand-red);
          text-decoration: none;
          transition: gap .15s ease;
        }
        .fls-index__cta:hover { gap: .7rem; }

        /* ── photo stage ── */
        .fls-photo {
          position: relative;
          width: 100%;
          height: clamp(360px, 32vw, 520px);
          border-radius: 16px;
          overflow: hidden;
          background: #fafafa;
          cursor: pointer;
        }
        .fls-photo img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .6s cubic-bezier(0.16,1,0.3,1);
        }
        .fls-photo:hover img { transform: scale(1.04); }
        .fls-photo__badge {
          position: absolute; top: 1rem; left: 1rem; z-index: 2;
          font-family: var(--ff-mono); font-size: 0.62rem; letter-spacing: .16em;
          text-transform: uppercase; padding: .3rem .6rem; border-radius: 4px;
        }
        .fls-photo__badge--hot { background: var(--brand-red); color: #fff; }
        .fls-photo__badge--flagship { background: var(--slate, #111); color: #fff; }

        /* progress rail across the bottom of the photo — a single bar that
           fills over SLIDE_MS, then resets; a live "how long until next"
           indicator instead of static dots */
        .fls-photo__progress {
          position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
          background: rgba(255,255,255,0.35); z-index: 2;
        }
        .fls-photo__progress-bar {
          height: 100%; width: 0%;
          background: var(--brand-red);
          transform-origin: left center;
        }

        /* ── spec readout beneath the photo ── */
        .fls-readout {
          margin-top: 1.5rem;
          display: flex; flex-wrap: wrap; gap: clamp(1.75rem, 4vw, 3.5rem);
        }
        .fls-readout__row { display: flex; flex-direction: column; gap: .2rem; }
        .fls-readout__label {
          font-family: var(--ff-mono); font-size: 0.64rem; letter-spacing: .18em;
          text-transform: uppercase; color: var(--ink-35);
        }
        .fls-readout__value {
          font-family: var(--ff-display); font-size: clamp(1.6rem, 2.6vw, 2.1rem);
          color: var(--ink); line-height: 1;
        }
        .fls-readout__unit { font-family: var(--ff-body); font-size: .95rem; color: var(--ink-60); margin-left: .3rem; }

        @media (max-width: 860px) {
          .fls-stage { grid-template-columns: 1fr; }
          .fls-index__btn { font-size: clamp(1.3rem, 6vw, 1.8rem); }
        }
        @media (max-width: 640px) {
          .fls-section { padding: clamp(2.5rem,7vw,3.5rem) 0 clamp(2rem,5vw,3rem) !important; }
          .fls-header { margin-bottom: clamp(1.5rem,4vw,2.25rem) !important; }
          .fls-title-clip h2 { font-size: clamp(2rem, 9vw, 3.2rem) !important; }
          .fls-photo { height: 260px; }
          .fls-readout { gap: 1.25rem; margin-top: 1.1rem; }
          .fls-readout__value { font-size: 1.4rem; }
        }
      `}</style>

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* ── Header ── */}
        <div className="fls-header" style={{ marginBottom: "clamp(2.5rem,5vw,4rem)" }}>
          <span ref={eyebrowRef} style={{
            display: "inline-flex", alignItems: "center", gap: ".75rem",
            fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
            letterSpacing: ".22em", textTransform: "uppercase",
            color: "var(--brand-red)", marginBottom: ".75rem",
            opacity: 0,
          }}>
            <span style={{ width: "2rem", height: "1px", background: "var(--brand-red)", display: "inline-block", flexShrink: 0 }} />
            {t("eyebrow")}
          </span>

          <div className="fls-title-clip">
            <h2 ref={titleRef} data-no-anim style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(3rem,6vw,6rem)",
              color: "var(--ink)", lineHeight: .88,
              letterSpacing: ".01em", margin: 0,
              perspective: "600px",
            }}>
              {t("title")}
            </h2>
          </div>

          <div ref={lineRef} style={{
            height: "2px", width: "clamp(200px,40%,480px)",
            background: "linear-gradient(to right, var(--brand-red), rgba(225,29,72,0.15), transparent)",
            margin: ".7rem 0 .9rem", opacity: 0,
          }} />

          <span style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(1.1rem,2vw,1.65rem)",
            color: "var(--ink-60)", display: "block",
          }}>
            {t("subtitle")}
          </span>
        </div>

        {/* ── Stage: name index (nav) + photo + live spec readout ── */}
        <div className="fls-stage--wide-outer">
          <div
            ref={stageRef}
            className="fls-stage"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <nav className="fls-index" aria-label={t("title")}>
              {MODELS.map((m, i) => {
                const isActive = active === i;
                return (
                  <div className="fls-index__row" key={m.slug}>
                    <button
                      type="button"
                      className={`fls-index__btn${isActive ? " fls-index__btn--active" : ""}`}
                      onClick={() => goTo(i)}
                      aria-current={isActive}
                    >
                      <span className="fls-index__num">{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        {m.label}
                        <span className="fls-index__tag">
                          <span className="fls-index__tag-inner">{m.tag}</span>
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
              <TransitionLink href={`/products/printing/${model.slug}`} className="fls-index__cta">
                {t("viewFullSpec")}
              </TransitionLink>
            </nav>

            <div>
              <div
                className="fls-photo"
                ref={photoRef}
                role="link"
                tabIndex={0}
                aria-label={model.label}
                onClick={() => router.push(`/products/printing/${model.slug}`)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(`/products/printing/${model.slug}`); }}
              >
                {model.hot && <span className="fls-photo__badge fls-photo__badge--hot">{t("hotBadge")}</span>}
                {model.flagship && <span className="fls-photo__badge fls-photo__badge--flagship">{t("flagshipBadge")}</span>}
                <img src={model.img} alt={model.label} />
                <div className="fls-photo__progress">
                  <div
                    className="fls-photo__progress-bar"
                    key={active}
                    style={{
                      animation: paused ? "none" : `fls-progress ${SLIDE_MS}ms linear forwards`,
                    }}
                  />
                </div>
              </div>

              <div className="fls-readout" ref={specWrapRef}>
                <div className="fls-readout__row">
                  <span className="fls-readout__label">{t("speedLabel")}</span>
                  <span className="fls-readout__value">{speedNum}<span className="fls-readout__unit">m/min</span></span>
                </div>
                <div className="fls-readout__row">
                  <span className="fls-readout__label">{t("registrationLabel")}</span>
                  <span className="fls-readout__value">{model.reg}</span>
                </div>
                <div className="fls-readout__row">
                  <span className="fls-readout__label">AI · {t("colourLabel")}</span>
                  <span className="fls-readout__value">{model.colours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style suppressHydrationWarning>{`
          @keyframes fls-progress { from { width: 0%; } to { width: 100%; } }
          @media (prefers-reduced-motion: reduce) {
            .fls-photo__progress-bar { animation: none !important; width: 0 !important; }
          }
        `}</style>

        {/* ── Bottom spec strip ── */}
        <div ref={stripRef} style={{
          marginTop: "clamp(2.5rem,5vw,4rem)", padding: "1.25rem 1.5rem",
          border: "1px solid var(--line)",
          borderTop: "2px solid var(--brand-red)",
          borderRadius: "10px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem",
          opacity: 0,
        }}>
          <div style={{ display: "flex", gap: "clamp(1.5rem,3vw,3rem)", flexWrap: "wrap" }}>
            {SPECS.map(kv => (
              <div key={kv.label} style={{ display: "flex", flexDirection: "column", gap: ".2rem" }}>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.64rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-35)" }}>{kv.label}</span>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: ".65rem", letterSpacing: ".06em", color: "var(--ink-60)" }}>{kv.value}</span>
              </div>
            ))}
          </div>
          <AetherBtn><TransitionLink href="/inquiries">{t("requestSpecSheet")}</TransitionLink></AetherBtn>
        </div>
      </div>
    </section>
  );
}
