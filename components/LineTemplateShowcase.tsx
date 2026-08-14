"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { familyBySlug, familyImage, familyImages } from "@/lib/products";
import type { LineTemplate } from "@/lib/productionLineTemplates";
import { openAshaChat } from "@/components/ChatWidget";

type Tab = "overview" | "installation" | "ai";
type Mode = "overview" | "explore";

export default function LineTemplateShowcase({
  template, onUseThisLine, onBack,
}: {
  template: LineTemplate;
  onUseThisLine: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("productionLineBuilder.template");
  const [mode, setMode] = useState<Mode>("overview");
  const [activeIdx, setActiveIdx] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const [renderKey, setRenderKey] = useState(0);

  const step = template.steps[activeIdx];
  const fam = familyBySlug(step.slug);

  function goTo(i: number) {
    if (i === activeIdx) return;
    setActiveIdx(i);
    setTab("overview");
    setRenderKey((k) => k + 1); // re-triggers the render-in animation
  }

  function explore(fromIdx = 0) {
    setActiveIdx(fromIdx);
    setTab("overview");
    setRenderKey((k) => k + 1);
    setMode("explore");
  }

  function askAiAboutMachine() {
    const q = `I'm looking at the ${fam?.name ?? step.slug} (${step.stage}) as part of the "${template.name}" production line. Can you walk me through what it does and what to watch for when installing or running it?`;
    openAshaChat(q);
  }

  function askAiAboutLine() {
    const machineNames = template.steps.map((s) => familyBySlug(s.slug)?.name ?? s.slug).join(", ");
    const q = `Can you tell me about the "${template.name}" production line? It's made up of: ${machineNames}. What should I know before choosing this line?`;
    openAshaChat(q);
  }

  const specs = fam?.specs.map((s) => ({ label: s.label, value: s.values[0] })).filter((s) => s.value) ?? [];
  const installSteps = fam?.installation ?? [];

  return (
    <div className="lts">
      <style suppressHydrationWarning>{`
        .lts { display: flex; flex-direction: column; gap: clamp(1.75rem, 3.5vw, 2.5rem); }
        .lts__back {
          display: inline-flex; align-items: center; gap: .5rem; width: fit-content;
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-35); background: none; border: none; cursor: pointer;
          transition: color .15s;
        }
        .lts__back:hover { color: var(--ink); }

        .lts__intro { display: flex; flex-direction: column; gap: .6rem; }
        .lts__eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-teal);
        }
        .lts__eyebrow::before { content: ""; width: 1.75rem; height: 1px; background: var(--brand-teal); }
        .lts__title {
          font-family: var(--ff-display); font-size: clamp(1.7rem, 3.4vw, 2.5rem);
          color: var(--ink); line-height: 1.05; margin: 0;
        }
        .lts__tagline { font-size: .95rem; color: var(--ink-60); line-height: 1.6; margin: 0; max-width: 68ch; }

        /* ── OVERVIEW — the full line at a glance, grid of machine cards,
           shown before the visitor commits to exploring step by step ── */
        .lts__overview-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;
        }
        .lts__ov-card {
          position: relative; display: flex; flex-direction: column; text-align: left;
          background: var(--bg-surface); border: 1px solid var(--bg-line); border-radius: 1.1rem;
          padding: 0; cursor: pointer; overflow: hidden;
          transition: border-color .2s, transform .2s, box-shadow .2s;
        }
        .lts__ov-card:hover { border-color: var(--brand-teal); transform: translateY(-3px); box-shadow: 0 14px 34px -18px rgba(43,191,179,.3); }
        .lts__ov-card-img-wrap { position: relative; width: 100%; aspect-ratio: 4/3; background: var(--bg-raise); }
        .lts__ov-card-img { object-fit: contain; padding: 8%; }
        .lts__ov-card-num {
          position: absolute; top: .6rem; left: .6rem; z-index: 1;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--brand-teal); color: #04211e;
          font-family: var(--ff-mono); font-size: .68rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .lts__ov-card-body { padding: .9rem 1rem 1.1rem; }
        .lts__ov-card-stage {
          font-family: var(--ff-mono); font-size: .6rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-teal); display: block; margin-bottom: .25rem;
        }
        .lts__ov-card-name { font-size: .92rem; font-weight: 600; color: var(--ink); line-height: 1.3; display: block; }
        .lts__ov-card-role { font-size: .78rem; color: var(--ink-60); line-height: 1.5; margin: .35rem 0 0; }

        .lts__overview-actions { display: flex; gap: .85rem; flex-wrap: wrap; }
        .lts__explore-cta {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .9rem 1.75rem; border-radius: .75rem; border: none;
          background: var(--brand-teal); color: #04211e; cursor: pointer;
          font-family: var(--ff-display); font-size: 1rem; letter-spacing: .02em;
          box-shadow: 0 8px 20px -14px rgba(43,191,179,0);
          transition: background .15s, transform .15s var(--ease-out, ease), box-shadow .2s var(--ease-out, ease);
        }
        .lts__explore-cta:hover {
          background: var(--brand-teal-dk);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -12px rgba(43,191,179,.5);
        }
        .lts__explore-cta:active { transform: translateY(0) scale(0.97); transition-duration: .08s; }
        .lts__ai-line-btn {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .9rem 1.5rem; border-radius: .75rem;
          border: 1px solid rgba(43,191,179,.35); background: rgba(43,191,179,.06);
          color: var(--brand-teal); cursor: pointer;
          font-family: var(--ff-display); font-size: .95rem;
          transition: background .15s, border-color .15s;
        }
        .lts__ai-line-btn:hover { background: rgba(43,191,179,.12); border-color: var(--brand-teal); }

        /* ── explorable step rail — click a numbered pill to render that
           machine below, instead of dumping every step at once ── */
        .lts__rail {
          display: flex; gap: .6rem; overflow-x: auto; padding: .25rem .1rem .5rem;
          scrollbar-width: none;
        }
        .lts__rail::-webkit-scrollbar { display: none; }
        .lts__rail-line { position: relative; display: flex; align-items: center; flex: 1; min-width: 0; }
        .lts__pill {
          flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: .5rem;
          background: none; border: none; cursor: pointer; padding: .25rem .5rem;
          width: 84px;
        }
        .lts__pill-dot {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-mono); font-size: .82rem; font-weight: 700;
          background: var(--bg-surface); border: 1.5px solid var(--bg-line); color: var(--ink-35);
          transition: border-color .2s, background .2s, color .2s, transform .2s;
        }
        .lts__pill--on .lts__pill-dot {
          border-color: var(--brand-teal); background: var(--brand-teal); color: #04211e;
          transform: scale(1.08);
        }
        .lts__pill--done .lts__pill-dot { border-color: rgba(43,191,179,.4); color: var(--brand-teal); }
        .lts__pill-label {
          font-family: var(--ff-mono); font-size: .6rem; letter-spacing: .06em; text-transform: uppercase;
          color: var(--ink-35); text-align: center; line-height: 1.3;
          transition: color .2s;
        }
        .lts__pill--on .lts__pill-label { color: var(--ink); }
        .lts__rail-connector {
          flex: 1; height: 2px; background: var(--bg-line); margin: 0 -.25rem;
          position: relative; top: -14px;
        }
        .lts__rail-connector--done { background: var(--brand-teal); }

        /* ── stage — the single active machine, animated in on change ── */
        .lts__stage {
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1.5rem, 3vw, 2.5rem);
          align-items: start;
          animation: lts-render .45s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes lts-render {
          from { opacity: 0; transform: translateY(14px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 800px) { .lts__stage { grid-template-columns: 1fr; } }

        .lts__stage-img-wrap {
          position: relative; aspect-ratio: 4/3; border-radius: 1.25rem; overflow: hidden;
          background: var(--bg-surface); border: 1px solid var(--bg-line);
        }
        .lts__stage-img { object-fit: contain; padding: 8%; }
        .lts__stage-badge {
          position: absolute; top: .85rem; left: .85rem; z-index: 1;
          display: inline-flex; align-items: center; gap: .4rem;
          font-family: var(--ff-mono); font-size: .6rem; letter-spacing: .12em; text-transform: uppercase;
          color: #fff; background: rgba(4,10,10,.6);
          -webkit-backdrop-filter: blur(4px);
                  backdrop-filter: blur(4px);
          padding: .3rem .6rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.15);
        }
        .lts__stage-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-teal); }

        .lts__stage-stage { font-family: var(--ff-mono); font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; color: var(--brand-teal); }
        .lts__stage-name { font-family: var(--ff-display); font-size: 1.4rem; color: var(--ink); line-height: 1.15; margin: .3rem 0 .6rem; }
        .lts__stage-role { font-size: .88rem; color: var(--ink-60); line-height: 1.65; margin: 0 0 1.25rem; }

        .lts__tabs { display: flex; gap: .4rem; border-bottom: 1px solid var(--bg-line); margin-bottom: 1rem; }
        .lts__tab {
          padding: .55rem .1rem; margin-right: 1rem;
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .08em; text-transform: uppercase;
          color: var(--ink-35); background: none; border: none; border-bottom: 2px solid transparent;
          cursor: pointer; transition: color .15s, border-color .15s;
        }
        .lts__tab:hover { color: var(--ink); }
        .lts__tab--on { color: var(--brand-teal); border-color: var(--brand-teal); }
        .lts__tab--ai { color: var(--brand-teal); }

        .lts__specs { display: flex; flex-direction: column; gap: .6rem; }
        .lts__spec-row { display: flex; justify-content: space-between; gap: 1rem; padding: .45rem 0; border-bottom: 1px solid var(--bg-line); }
        .lts__spec-label { font-size: .78rem; color: var(--ink-60); }
        .lts__spec-val { font-family: var(--ff-mono); font-size: .82rem; font-weight: 600; color: var(--ink); text-align: right; }

        .lts__install { display: flex; flex-direction: column; gap: .85rem; }
        .lts__install-item { display: flex; gap: .85rem; align-items: flex-start; }
        .lts__install-num {
          flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
          background: rgba(43,191,179,.1); border: 1px solid rgba(43,191,179,.3); color: var(--brand-teal);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-mono); font-size: .68rem; font-weight: 700;
        }
        .lts__install-body { min-width: 0; }
        .lts__install-title { font-size: .88rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: .2rem; }
        .lts__install-detail { font-size: .8rem; color: var(--ink-60); line-height: 1.6; margin: 0; }
        .lts__install-empty { font-size: .82rem; color: var(--ink-35); }

        .lts__ai {
          display: flex; flex-direction: column; align-items: flex-start; gap: .85rem;
          background: rgba(43,191,179,.06); border: 1px solid rgba(43,191,179,.18);
          border-radius: 1rem; padding: 1.25rem;
        }
        .lts__ai p { margin: 0; font-size: .85rem; color: var(--ink-60); line-height: 1.6; max-width: 46ch; }
        .lts__ai-btn {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .7rem 1.25rem; border-radius: .7rem; border: none;
          background: var(--brand-teal); color: #04211e; cursor: pointer;
          font-family: var(--ff-display); font-size: .9rem; transition: background .15s;
        }
        .lts__ai-btn:hover { background: var(--brand-teal-dk); }

        .lts__nav { display: flex; justify-content: space-between; gap: 1rem; }
        .lts__nav-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .65rem 1rem; border-radius: .65rem; border: 1px solid var(--bg-line);
          background: none; color: var(--ink-60); cursor: pointer; font-size: .82rem;
          transition: border-color .15s, color .15s;
        }
        .lts__nav-btn:hover:not(:disabled) { border-color: var(--brand-teal); color: var(--brand-teal); }
        .lts__nav-btn:disabled { opacity: .35; cursor: default; }
        .lts__exit-explore {
          display: inline-flex; align-items: center; gap: .5rem; width: fit-content;
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-35); background: none; border: none; cursor: pointer;
          transition: color .15s;
        }
        .lts__exit-explore:hover { color: var(--ink); }

        .lts__why { display: flex; flex-direction: column; gap: .65rem; }
        .lts__why-item { display: flex; gap: .7rem; align-items: flex-start; font-size: .85rem; color: var(--ink-60); line-height: 1.6; }
        .lts__why-item svg { flex-shrink: 0; color: var(--brand-teal); margin-top: .2rem; }
        .lts__section-label {
          display: flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .66rem; letter-spacing: .12em; text-transform: uppercase;
          color: var(--ink-35); margin-bottom: 1rem;
        }
        .lts__section-label::before { content: ""; flex: 0 0 20px; height: 1px; background: var(--bg-line); }

        .lts__cta {
          padding: .9rem 1.75rem; border-radius: .75rem; border: none;
          background: var(--brand-teal); color: #04211e; cursor: pointer;
          font-family: var(--ff-display); font-size: 1rem; letter-spacing: .02em;
          width: fit-content;
          box-shadow: 0 8px 20px -14px rgba(43,191,179,0);
          transition: background .15s, transform .15s var(--ease-out, ease), box-shadow .2s var(--ease-out, ease);
        }
        .lts__cta:hover {
          background: var(--brand-teal-dk);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -12px rgba(43,191,179,.5);
        }
        .lts__cta:active { transform: translateY(0) scale(0.97); transition-duration: .08s; }
        @media (prefers-reduced-motion: reduce) { .lts__cta, .lts__explore-cta { transform: none !important; } }
      `}</style>

      <button type="button" className="lts__back" onClick={mode === "explore" ? () => setMode("overview") : onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {mode === "explore" ? t("backToOverview") : t("backToHub")}
      </button>

      <div className="lts__intro">
        <div className="lts__eyebrow">{t("eyebrow")}</div>
        <h1 className="lts__title">{template.name}</h1>
        <p className="lts__tagline">{template.tagline}</p>
      </div>

      {mode === "overview" && (
        <>
          {/* full line, every machine, at a glance */}
          <div>
            <div className="lts__section-label">{t("stepsLabel")}</div>
            <div className="lts__overview-grid">
              {template.steps.map((s, i) => {
                const f = familyBySlug(s.slug);
                return (
                  <button key={`${s.slug}-${i}`} type="button" className="lts__ov-card" onClick={() => explore(i)}>
                    <div className="lts__ov-card-img-wrap">
                      <span className="lts__ov-card-num">{i + 1}</span>
                      {f && <Image src={familyImage(f)} alt={f.name} fill sizes="220px" className="lts__ov-card-img" />}
                    </div>
                    <div className="lts__ov-card-body">
                      <span className="lts__ov-card-stage">{s.stage}</span>
                      <span className="lts__ov-card-name">{f?.name ?? s.slug}</span>
                      <p className="lts__ov-card-role">{s.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lts__overview-actions">
            <button type="button" className="lts__explore-cta" onClick={() => explore(0)}>
              {t("exploreCta")}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="lts__ai-line-btn" onClick={askAiAboutLine}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.5 6.8c0-.9.9-1.5 1.8-1.5s1.8.6 1.8 1.4c0 1-1.3 1.1-1.6 1.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7.5" cy="10.6" r=".6" fill="currentColor" />
              </svg>
              {t("aiHelpLineCta")}
            </button>
          </div>

          <div>
            <div className="lts__section-label">{t("whyBestLabel")}</div>
            <div className="lts__why">
              {template.whyBest.map((reason, i) => (
                <div key={i} className="lts__why-item">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="lts__cta" onClick={onUseThisLine} style={{ alignSelf: "center" }}>
            {t("useThisLineCta")}
          </button>
        </>
      )}

      {mode === "explore" && (
        <>
          {/* explorable rail — click a step to render it below */}
          <div className="lts__rail">
            {template.steps.map((s, i) => (
              <div key={`${s.slug}-${i}`} className="lts__rail-line">
                <button
                  type="button"
                  className={`lts__pill${i === activeIdx ? " lts__pill--on" : i < activeIdx ? " lts__pill--done" : ""}`}
                  onClick={() => goTo(i)}
                >
                  <span className="lts__pill-dot">{i < activeIdx ? "✓" : i + 1}</span>
                  <span className="lts__pill-label">{s.stage}</span>
                </button>
                {i < template.steps.length - 1 && (
                  <span className={`lts__rail-connector${i < activeIdx ? " lts__rail-connector--done" : ""}`} />
                )}
              </div>
            ))}
          </div>

          {/* stage — only the active machine renders here */}
          <div key={renderKey} className="lts__stage">
            <div className="lts__stage-img-wrap">
              <span className="lts__stage-badge"><span className="lts__stage-badge-dot" />{t("setupLabel", { num: String(activeIdx + 1).padStart(2, "0"), total: String(template.steps.length).padStart(2, "0") })}</span>
              {fam && <Image src={familyImages(fam)[0]} alt={fam.name} fill sizes="(max-width: 800px) 90vw, 480px" className="lts__stage-img" />}
            </div>

            <div>
              <span className="lts__stage-stage">{step.stage}</span>
              <h2 className="lts__stage-name">{fam?.name ?? step.slug}</h2>
              <p className="lts__stage-role">{step.role}</p>

              <div className="lts__tabs" role="tablist">
                <button type="button" role="tab" className={`lts__tab${tab === "overview" ? " lts__tab--on" : ""}`} onClick={() => setTab("overview")}>{t("tabOverview")}</button>
                <button type="button" role="tab" className={`lts__tab${tab === "installation" ? " lts__tab--on" : ""}`} onClick={() => setTab("installation")}>{t("tabInstallation")}</button>
                <button type="button" role="tab" className={`lts__tab lts__tab--ai${tab === "ai" ? " lts__tab--on" : ""}`} onClick={() => setTab("ai")}>{t("tabAskAi")}</button>
              </div>

              {tab === "overview" && (
                <div className="lts__specs">
                  {specs.slice(0, 6).map((s) => (
                    <div key={s.label} className="lts__spec-row">
                      <span className="lts__spec-label">{s.label}</span>
                      <span className="lts__spec-val">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "installation" && (
                <div className="lts__install">
                  {installSteps.length === 0 && <p className="lts__install-empty">{t("noInstallGuide")}</p>}
                  {installSteps.map((step2, i) => (
                    <div key={i} className="lts__install-item">
                      <span className="lts__install-num">{i + 1}</span>
                      <div className="lts__install-body">
                        <span className="lts__install-title">{step2.title}</span>
                        <p className="lts__install-detail">{step2.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "ai" && (
                <div className="lts__ai">
                  <p>{t("aiHelpDesc", { name: fam?.name ?? step.slug })}</p>
                  <button type="button" className="lts__ai-btn" onClick={askAiAboutMachine}>
                    {t("aiHelpCta")}
                  </button>
                </div>
              )}

              <div className="lts__nav" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="lts__nav-btn" disabled={activeIdx === 0} onClick={() => goTo(activeIdx - 1)}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t("prevStep")}
                </button>
                <button type="button" className="lts__nav-btn" disabled={activeIdx === template.steps.length - 1} onClick={() => goTo(activeIdx + 1)}>
                  {t("nextStep")}
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          </div>

          <button type="button" className="lts__cta" onClick={onUseThisLine} style={{ alignSelf: "center" }}>
            {t("useThisLineCta")}
          </button>
        </>
      )}
    </div>
  );
}
