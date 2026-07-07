"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { families, categories, type ProductFamily } from "@/lib/products";
import AetherBtn from "@/components/AetherBtn";

/* ─── types ─────────────────────────────────────────────────────── */
interface SelectedMachine {
  family: ProductFamily;
  modelIdx: number;
  qty: number;
  notes: string;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

/* ─── helpers ────────────────────────────────────────────────────── */
const CAT_ICONS: Record<string, JSX.Element> = {
  "film-blowing": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3"/>
      <ellipse cx="9" cy="9" rx="2.5" ry="6" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M3 9h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  "bag-making": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="6" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 6V5a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  "recycling": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 3l2.5 4H6.5L9 3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5 13l-1.5-4 3.5 2L5 13z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M13 13l1.5-4-3.5 2L13 13z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
  "printing": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="7" width="14" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="9" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 7V5.5a2 2 0 012-2h4a2 2 0 012 2V7" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

const STEPS = ["Select Machines", "Configure", "Your Details", "Review & Send"];

/* ─── sub-components ─────────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="iq-steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`iq-step${i === current ? " iq-step--active" : i < current ? " iq-step--done" : ""}`}>
          <div className="iq-step__dot">
            {i < current
              ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <span>{i + 1}</span>}
          </div>
          <span className="iq-step__label">{label}</span>
          {i < STEPS.length - 1 && <div className="iq-step__line" />}
        </div>
      ))}
    </div>
  );
}

/* Step 1 — choose families */
function Step1({ selected, onToggle }: { selected: string[]; onToggle: (slug: string) => void }) {
  const [activeCat, setActiveCat] = useState("film-blowing");
  const catFamilies = families.filter(f => f.category === activeCat);

  return (
    <div className="iq-s1">
      {/* category tabs */}
      <div className="iq-cattabs">
        {categories.map(c => (
          <button
            key={c.slug}
            className={`iq-cattab${activeCat === c.slug ? " iq-cattab--active" : ""}`}
            onClick={() => setActiveCat(c.slug)}
          >
            <span className="iq-cattab__icon">{CAT_ICONS[c.slug]}</span>
            {c.name}
          </button>
        ))}
      </div>

      {/* family cards */}
      <div className="iq-families">
        {catFamilies.map(f => {
          const on = selected.includes(f.slug);
          return (
            <button
              key={f.slug}
              className={`iq-fcard${on ? " iq-fcard--on" : ""}`}
              onClick={() => onToggle(f.slug)}
            >
              <div className="iq-fcard__check">{on && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}</div>
              <div className="iq-fcard__series">{f.series}</div>
              <div className="iq-fcard__name">{f.name}</div>
              <div className="iq-fcard__tagline">{f.tagline}</div>
              <div className="iq-fcard__models">{f.models.length} model{f.models.length > 1 ? "s" : ""}</div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="iq-sel-count">
          {selected.length} machine line{selected.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

/* Step 2 — configure each selected machine */
function Step2({ machines, onChange }: { machines: SelectedMachine[]; onChange: (idx: number, patch: Partial<SelectedMachine>) => void }) {
  return (
    <div className="iq-s2">
      {machines.map((m, i) => (
        <div key={m.family.slug} className="iq-cfg">
          <div className="iq-cfg__head">
            <span className="iq-cfg__series">{m.family.series}</span>
            <span className="iq-cfg__name">{m.family.name}</span>
          </div>

          {/* model selector */}
          <div className="iq-cfg__row">
            <label className="iq-cfg__label">Model / Size</label>
            <div className="iq-model-pills">
              {m.family.models.map((mod, mi) => (
                <button
                  key={mod}
                  className={`iq-mpill${m.modelIdx === mi ? " iq-mpill--on" : ""}`}
                  onClick={() => onChange(i, { modelIdx: mi })}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* spec preview for selected model */}
          {m.family.specs.length > 0 && (
            <div className="iq-cfg__specs">
              {m.family.specs.slice(0, 6).map(s => (
                <div key={s.label} className="iq-cfg__spec">
                  <span className="iq-cfg__spec-label">{s.label}</span>
                  <span className="iq-cfg__spec-val">{s.values[m.modelIdx] ?? s.values[0]}</span>
                </div>
              ))}
            </div>
          )}

          {/* materials */}
          {m.family.materials && (
            <div className="iq-cfg__row" style={{ marginTop: "1rem" }}>
              <label className="iq-cfg__label">Materials</label>
              <div className="iq-cfg__matval">{m.family.materials}</div>
            </div>
          )}

          {/* qty */}
          <div className="iq-cfg__row" style={{ marginTop: "1rem" }}>
            <label className="iq-cfg__label">Quantity</label>
            <div className="iq-qty">
              <button className="iq-qty__btn" onClick={() => onChange(i, { qty: Math.max(1, m.qty - 1) })}>−</button>
              <span className="iq-qty__val">{m.qty}</span>
              <button className="iq-qty__btn" onClick={() => onChange(i, { qty: m.qty + 1 })}>+</button>
            </div>
          </div>

          {/* notes */}
          <div className="iq-cfg__row" style={{ marginTop: "1rem" }}>
            <label className="iq-cfg__label">Custom requirements / notes</label>
            <textarea
              className="iq-textarea"
              rows={3}
              placeholder="e.g. corona treatment, special voltage, CE certification, colour, automation level…"
              value={m.notes}
              onChange={e => onChange(i, { notes: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Step 3 — contact details */
function Step3({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div className="iq-s3">
      <div className="iq-grid2">
        <div className="iq-field">
          <label>Full name *</label>
          <input type="text" placeholder="Your name" value={data.name} onChange={e => onChange({ name: e.target.value })} required />
        </div>
        <div className="iq-field">
          <label>Company</label>
          <input type="text" placeholder="Company name" value={data.company} onChange={e => onChange({ company: e.target.value })} />
        </div>
        <div className="iq-field">
          <label>Email *</label>
          <input type="email" placeholder="you@company.com" value={data.email} onChange={e => onChange({ email: e.target.value })} required />
        </div>
        <div className="iq-field">
          <label>Phone / WhatsApp</label>
          <input type="tel" placeholder="+1 000 000 0000" value={data.phone} onChange={e => onChange({ phone: e.target.value })} />
        </div>
        <div className="iq-field">
          <label>Country</label>
          <input type="text" placeholder="Country" value={data.country} onChange={e => onChange({ country: e.target.value })} />
        </div>
      </div>
      <div className="iq-field" style={{ marginTop: "1rem" }}>
        <label>Additional message</label>
        <textarea className="iq-textarea" rows={4} placeholder="Production targets, timeline, floor dimensions, special requirements…" value={data.message} onChange={e => onChange({ message: e.target.value })} />
      </div>
    </div>
  );
}

/* Step 4 — review */
function Step4({ machines, form }: { machines: SelectedMachine[]; form: FormData }) {
  return (
    <div className="iq-s4">
      <div className="iq-review-block">
        <div className="iq-review-title">Selected machines</div>
        {machines.map(m => (
          <div key={m.family.slug} className="iq-review-machine">
            <div className="iq-review-machine__name">{m.family.name}</div>
            <div className="iq-review-machine__meta">
              Model: <strong>{m.family.models[m.modelIdx]}</strong> · Qty: <strong>{m.qty}</strong>
            </div>
            {m.notes && <div className="iq-review-machine__notes">"{m.notes}"</div>}
          </div>
        ))}
      </div>
      <div className="iq-review-block">
        <div className="iq-review-title">Your details</div>
        <div className="iq-review-grid">
          {[["Name", form.name], ["Company", form.company], ["Email", form.email], ["Phone", form.phone], ["Country", form.country]].filter(([,v]) => v).map(([k, v]) => (
            <div key={k} className="iq-review-row">
              <span className="iq-review-key">{k}</span>
              <span className="iq-review-val">{v}</span>
            </div>
          ))}
        </div>
        {form.message && (
          <div className="iq-review-machine__notes" style={{ marginTop: "1rem" }}>"{form.message}"</div>
        )}
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
function detectSource(): string {
  if (typeof window === "undefined") return "direct";
  return sessionStorage.getItem("cx_source") ?? "direct";
}

function ContactPageInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [machines, setMachines] = useState<SelectedMachine[]>([]);
  const [form, setForm] = useState<FormData>({ name: "", company: "", email: "", phone: "", country: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [source, setSource] = useState("direct");

  useEffect(() => { setSource(detectSource()); }, []);

  // Pre-fill from ?machine=slug query param (comes from product detail page)
  useEffect(() => {
    const slug = searchParams?.get("machine");
    if (!slug) return;
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setSelectedSlugs([slug]);
    setMachines([{ family: fam, modelIdx: 0, qty: 1, notes: "" }]);
    setStep(1); // skip straight to configure
  }, [searchParams]);

  function toggleFamily(slug: string) {
    setSelectedSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }

  function goToStep2() {
    const current = new Map(machines.map(m => [m.family.slug, m]));
    const next: SelectedMachine[] = selectedSlugs.map(slug => {
      const fam = families.find(f => f.slug === slug)!;
      return current.get(slug) ?? { family: fam, modelIdx: 0, qty: 1, notes: "" };
    });
    setMachines(next);
    setStep(1);
  }

  function patchMachine(idx: number, patch: Partial<SelectedMachine>) {
    setMachines(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  }

  function canAdvance() {
    if (sending) return false;
    if (step === 0) return selectedSlugs.length > 0;
    if (step === 2) return !!form.name && !!form.email;
    return true;
  }

  async function submitInquiry() {
    setSending(true); setSendError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          country: form.country,
          message: form.message,
          machines: machines.map(m => ({
            slug: m.family.slug,
            name: m.family.name,
            series: m.family.series,
            model: m.family.models[m.modelIdx],
            qty: m.qty,
            notes: m.notes,
          })),
          source,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send inquiry");
      }
      setSent(true);
    } catch (e) {
      setSendError((e as Error).message || "Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  function advance() {
    if (step === 0) { goToStep2(); return; }
    if (step === STEPS.length - 1) { submitInquiry(); return; }
    setStep(s => s + 1);
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── page shell ── */
        .iq-page {
          position: relative; min-height: 100vh;
          padding-top: 72px; background: #0d1614; overflow: hidden;
        }
        .iq-spline {
          position: absolute; inset: 0; z-index: 0;
        }
        .iq-spline iframe { width:100%; height:100%; border:none; display:block; }
        .iq-overlay {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: radial-gradient(ellipse 90% 110% at 50% 40%, rgba(4,3,10,.5) 0%, rgba(4,3,10,.78) 100%);
        }
        .iq-body {
          position: relative; z-index: 2;
          max-width: 1100px; margin: 0 auto;
          padding: clamp(2.5rem,5vw,5rem) clamp(1.5rem,4vw,3rem) clamp(4rem,7vw,7rem);
        }

        /* ── page header ── */
        .iq-heading {
          margin-bottom: clamp(2.5rem,5vw,4rem);
        }
        .iq-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: #e11d48; margin-bottom: 1rem;
        }
        .iq-eyebrow::before { content:""; width:2rem; height:1px; background:#e11d48; }
        .iq-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.8rem,6vw,5rem);
          line-height: .93; color: #f8fafc;
          letter-spacing: -.01em; margin: 0 0 .9rem;
        }
        .iq-h1 em { font-style:normal; color:#e11d48; }
        .iq-sub {
          font-size: clamp(.875rem,1.1vw,1rem);
          color: rgba(248,250,252,0.7); line-height:1.7; max-width:52ch;
        }

        /* ── step indicator ── */
        .iq-steps {
          display: flex; align-items: center;
          gap: 0; margin-bottom: 2.5rem;
          overflow-x: auto; padding-bottom: .25rem;
          scrollbar-width: none;
        }
        .iq-steps::-webkit-scrollbar { display:none; }
        .iq-step {
          display: flex; align-items: center; gap: .6rem;
          flex-shrink: 0;
        }
        .iq-step__dot {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.04);
          display: flex; align-items:center; justify-content:center;
          font-family: var(--ff-mono); font-size: 0.7rem;
          color: rgba(248,250,252,0.65);
          flex-shrink: 0;
        }
        .iq-step--active .iq-step__dot {
          border-color: #e11d48; background: rgba(225,29,72,.15);
          color: #e11d48;
        }
        .iq-step--done .iq-step__dot {
          border-color: #e11d48; background: #e11d48;
        }
        .iq-step__label {
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,0.6); white-space: nowrap;
        }
        .iq-step--active .iq-step__label { color: #f8fafc; }
        .iq-step--done .iq-step__label { color: rgba(248,250,252,0.75); }
        .iq-step__line {
          width: 2.5rem; height: 1px;
          background: rgba(255,255,255,.1);
          flex-shrink: 0; margin: 0 .5rem;
        }

        /* ── glass card ── */
        .iq-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 1.25rem;
          backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
          padding: clamp(1.75rem,3.5vw,2.75rem);
          margin-bottom: 1.5rem;
        }

        /* ── step 1 ── */
        .iq-cattabs {
          display: flex; gap: .5rem; flex-wrap: wrap;
          margin-bottom: 1.75rem;
        }
        .iq-cattab {
          display: flex; align-items: center; gap: .5rem;
          padding: .5rem 1rem; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(248,250,252,0.7); cursor: pointer;
          white-space: nowrap;
        }
        .iq-cattab:hover { border-color: rgba(255,255,255,.2); color: rgba(248,250,252,.8); }
        .iq-cattab--active {
          background: rgba(225,29,72,.15) !important;
          border-color: rgba(225,29,72,.45) !important;
          color: #f8fafc !important;
        }
        .iq-cattab__icon { color: #e11d48; line-height:0; }

        .iq-families {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        .iq-fcard {
          position: relative; text-align: left;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 1rem;
          background: rgba(255,255,255,.03);
          padding: 1.25rem 1.25rem 1.4rem;
          cursor: pointer;
        }
        .iq-fcard:hover {
          border-color: rgba(255,255,255,.18);
          background: rgba(255,255,255,.06);
        }
        .iq-fcard--on {
          border-color: rgba(225,29,72,.5) !important;
          background: rgba(225,29,72,.1) !important;
        }
        .iq-fcard__check {
          position: absolute; top: .9rem; right: .9rem;
          width: 20px; height: 20px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.04);
          display: flex; align-items:center; justify-content:center;
        }
        .iq-fcard--on .iq-fcard__check {
          background: #e11d48; border-color: #e11d48;
        }
        .iq-fcard__series {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: .16em; text-transform: uppercase;
          color: #e11d48; margin-bottom: .4rem;
        }
        .iq-fcard__name {
          font-family: var(--ff-display); font-size: 1.05rem;
          color: #f8fafc; line-height: 1.1; margin-bottom: .5rem;
        }
        .iq-fcard__tagline {
          font-size: .8rem; color: rgba(248,250,252,0.7);
          line-height: 1.5; margin-bottom: .75rem;
        }
        .iq-fcard__models {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,0.55);
        }

        .iq-sel-count {
          margin-top: 1.25rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: #e11d48;
        }

        /* ── step 2 ── */
        .iq-cfg {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 1rem;
          background: rgba(255,255,255,.03);
          padding: 1.5rem 1.5rem 1.75rem;
          margin-bottom: 1.25rem;
        }
        .iq-cfg__head {
          display: flex; flex-direction: column; gap: .25rem;
          margin-bottom: 1.4rem;
          padding-bottom: 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .iq-cfg__series {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: .16em; text-transform: uppercase; color: #e11d48;
        }
        .iq-cfg__name {
          font-family: var(--ff-display); font-size: 1.15rem;
          color: #f8fafc; line-height: 1.1;
        }
        .iq-cfg__label {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: rgba(248,250,252,0.65); display: block; margin-bottom: .6rem;
        }
        .iq-cfg__row { margin-bottom: .5rem; }

        .iq-model-pills { display: flex; flex-wrap: wrap; gap: .5rem; }
        .iq-mpill {
          padding: .4rem .85rem; border-radius: .5rem;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .06em; color: rgba(248,250,252,0.75);
          cursor: pointer; white-space: nowrap;
        }
        .iq-mpill:hover { border-color: rgba(255,255,255,.22); color: rgba(248,250,252,.9); }
        .iq-mpill--on {
          border-color: #e11d48 !important;
          background: rgba(225,29,72,.18) !important;
          color: #f8fafc !important;
        }

        .iq-cfg__specs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: .5rem 1.5rem; margin-top: 1.1rem;
          padding: 1rem 1.1rem;
          background: rgba(0,0,0,.25);
          border-radius: .75rem;
          border: 1px solid rgba(255,255,255,.06);
        }
        @media(max-width:600px){ .iq-cfg__specs{ grid-template-columns:1fr; } }
        .iq-cfg__spec { display: flex; flex-direction: column; gap: .15rem; }
        .iq-cfg__spec-label {
          font-family: var(--ff-mono); font-size: 0.66rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,0.6);
        }
        .iq-cfg__spec-val {
          font-family: var(--ff-mono); font-size: .78rem;
          color: #f8fafc;
        }

        .iq-cfg__matval {
          font-family: var(--ff-mono); font-size: .75rem;
          color: rgba(248,250,252,0.78);
        }

        .iq-qty {
          display: inline-flex; align-items: center; gap: 0;
          border: 1px solid rgba(255,255,255,.1); border-radius: .5rem;
          overflow: hidden;
        }
        .iq-qty__btn {
          width: 36px; height: 36px;
          background: rgba(255,255,255,.05);
          color: rgba(248,250,252,0.78);
          font-size: 1.1rem; line-height:1;
          border: none; cursor: pointer;
        }
        .iq-qty__btn:hover { background: rgba(225,29,72,.15); color: #e11d48; }
        .iq-qty__val {
          min-width: 40px; text-align: center;
          font-family: var(--ff-mono); font-size: .85rem;
          color: #f8fafc; background: rgba(255,255,255,.03);
          line-height: 36px;
        }

        /* ── step 3 ── */
        .iq-grid2 {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        @media(max-width:600px){ .iq-grid2{ grid-template-columns:1fr; } }
        .iq-field { display: flex; flex-direction:column; gap: .4rem; }
        .iq-field label {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: rgba(248,250,252,0.65);
        }
        .iq-field input {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: .5rem; color: #f8fafc;
          padding: .72rem 1rem;
          font-family: var(--ff-body); font-size: .95rem;
          outline: none; width: 100%;
        }
        .iq-field input::placeholder { color: rgba(248,250,252,0.55); }
        .iq-field input:focus { border-color: rgba(225,29,72,.45); }
        .iq-textarea {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: .5rem; color: #f8fafc;
          padding: .72rem 1rem; width: 100%;
          font-family: var(--ff-body); font-size: .9rem;
          resize: vertical; outline: none;
        }
        .iq-textarea::placeholder { color: rgba(248,250,252,0.55); }
        .iq-textarea:focus { border-color: rgba(225,29,72,.45); }

        /* ── step 4 review ── */
        .iq-review-block {
          background: rgba(0,0,0,.25);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: .875rem;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.25rem;
        }
        .iq-review-title {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: #e11d48; margin-bottom: 1rem;
        }
        .iq-review-machine {
          padding: .75rem 0; border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .iq-review-machine:last-child { border-bottom: none; }
        .iq-review-machine__name {
          font-family: var(--ff-display); font-size: 1rem; color: #f8fafc; margin-bottom: .3rem;
        }
        .iq-review-machine__meta {
          font-family: var(--ff-mono); font-size: .72rem;
          color: rgba(248,250,252,0.7);
        }
        .iq-review-machine__meta strong { color: rgba(248,250,252,.8); }
        .iq-review-machine__notes {
          margin-top: .5rem; font-size: .85rem;
          color: rgba(248,250,252,0.65); font-style: italic;
        }
        .iq-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem 2rem; }
        .iq-review-row { display: flex; flex-direction: column; gap: .15rem; }
        .iq-review-key {
          font-family: var(--ff-mono); font-size: 0.66rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,0.6);
        }
        .iq-review-val { font-size: .9rem; color: #f8fafc; }

        /* ── send error ── */
        .iq-send-error {
          margin-top: 1.5rem; padding: .85rem 1.1rem;
          background: rgba(225,29,72,.12);
          border: 1px solid rgba(225,29,72,.35);
          border-radius: .625rem;
          color: #ffb4c2; font-size: .88rem; line-height: 1.5;
        }

        /* ── nav row ── */
        .iq-nav {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem;
          margin-top: 2rem;
        }
        .iq-back {
          display: flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,0.7); cursor: pointer; background: none; border: none;
        }
        .iq-back:hover { color: rgba(248,250,252,.75); }

        /* ── success ── */
        .iq-success {
          text-align: center; padding: clamp(3rem,6vw,6rem) 2rem;
        }
        .iq-success__icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(225,29,72,.15);
          border: 1.5px solid rgba(225,29,72,.4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.75rem;
        }
        .iq-success__title {
          font-family: var(--ff-display);
          font-size: clamp(2.2rem,4vw,3.5rem);
          color: #f8fafc; margin: 0 0 1rem; line-height:.95;
        }
        .iq-success__sub {
          color: rgba(248,250,252,0.7); font-size: .95rem;
          line-height: 1.7; max-width: 40ch; margin: 0 auto;
        }
      `}</style>

      <div className="iq-page">
        {/* Spline background */}
        <div className="iq-spline" aria-hidden="true">
          <iframe
            src="https://my.spline.design/retrofuturisticcircuitloop-JngSBMetOQh9Jn4XS5OxTiIc/"
            title="background"
            loading="lazy"
          />
        </div>
        <div className="iq-overlay" aria-hidden="true" />

        <div className="iq-body">
          {/* Page header */}
          <div className="iq-heading">
            <div className="iq-eyebrow">Send an inquiry</div>
            <h1 className="iq-h1">
              Build your<br /><em>custom order.</em>
            </h1>
            <p className="iq-sub">
              Select the machine lines you need, choose your model and configuration, then send — our engineers reply within 24 hours.
            </p>
          </div>

          {sent ? (
            <div className="iq-card">
              <div className="iq-success">
                <div className="iq-success__icon">
                  <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                    <path d="M2 12l8 8L26 2" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="iq-success__title">Inquiry sent.</h2>
                <p className="iq-success__sub">
                  Thank you, {form.name || "there"}. Our engineering team will review your configuration and reply to {form.email || "you"} within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />

              <div className="iq-card">
                {step === 0 && <Step1 selected={selectedSlugs} onToggle={toggleFamily} />}
                {step === 1 && <Step2 machines={machines} onChange={patchMachine} />}
                {step === 2 && <Step3 data={form} onChange={p => setForm(f => ({ ...f, ...p }))} />}
                {step === 3 && <Step4 machines={machines} form={form} />}
              </div>

              {sendError && (
                <div className="iq-send-error" role="alert">{sendError}</div>
              )}

              <div className="iq-nav">
                {step > 0
                  ? <button className="iq-back" onClick={() => setStep(s => s - 1)} disabled={sending}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Back
                    </button>
                  : <span />}

                <AetherBtn>
                  <button
                    type="button"
                    disabled={!canAdvance()}
                    style={{ opacity: canAdvance() ? 1 : 0.4, cursor: canAdvance() ? "pointer" : "default" }}
                    onClick={advance}
                  >
                    {sending
                      ? "Sending…"
                      : step === STEPS.length - 1 ? "Send inquiry →" : step === 0 ? `Configure ${selectedSlugs.length || ""} line${selectedSlugs.length !== 1 ? "s" : ""} →` : "Continue →"}
                  </button>
                </AetherBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0d1614" }} />}>
      <ContactPageInner />
    </Suspense>
  );
}
