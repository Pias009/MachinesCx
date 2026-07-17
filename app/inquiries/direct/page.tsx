"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { families, categories, familyImages, type ProductFamily } from "@/lib/products";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";

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

/* ─── constants ──────────────────────────────────────────────────── */
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

const STEPS = ["Select Machine", "Details", "Review"];

/* ─── step indicator ────────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="dq-steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`dq-step${i === current ? " dq-step--active" : i < current ? " dq-step--done" : ""}`}>
          <div className="dq-step__dot">
            {i < current
              ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <span>{i + 1}</span>}
          </div>
          <span className="dq-step__label">{label}</span>
          {i < STEPS.length - 1 && <div className="dq-step__line" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1 — pick machine ─────────────────────────────────────── */
function Step1({ selected, onToggle }: { selected: string[]; onToggle: (slug: string) => void }) {
  const [activeCat, setActiveCat] = useState("film-blowing");
  const catFamilies = families.filter(f => f.category === activeCat);

  return (
    <div className="dq-s1">
      <div className="dq-cattabs">
        {categories.map(c => (
          <button key={c.slug} className={`dq-cattab${activeCat === c.slug ? " dq-cattab--active" : ""}`} onClick={() => setActiveCat(c.slug)}>
            <span className="dq-cattab__icon">{CAT_ICONS[c.slug]}</span>
            {c.name}
          </button>
        ))}
      </div>

      <div className="dq-families">
        {catFamilies.map(f => {
          const on = selected.includes(f.slug);
          const img = familyImages(f)[0];
          return (
            <button key={f.slug} className={`dq-fcard${on ? " dq-fcard--on" : ""}`} onClick={() => onToggle(f.slug)}>
              <div className="dq-fcard__img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={f.name} className="dq-fcard__img" />
              </div>
              <div className="dq-fcard__check">{on && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}</div>
              <div className="dq-fcard__series">{f.series}</div>
              <div className="dq-fcard__name">{f.name}</div>
              <div className="dq-fcard__tagline">{f.tagline}</div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="dq-sel-count">
          {selected.length} machine line{selected.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

/* ─── Step 2 — details ──────────────────────────────────────────── */
function Step2({
  machines, form, onMachineChange, onFormChange
}: {
  machines: SelectedMachine[];
  form: FormData;
  onMachineChange: (idx: number, patch: Partial<SelectedMachine>) => void;
  onFormChange: (patch: Partial<FormData>) => void;
}) {
  const [expandedImg, setExpandedImg] = useState<Record<string, number>>({});

  return (
    <div className="dq-s2">
      {machines.map((m, i) => {
        const imgs = familyImages(m.family);
        const heroIdx = expandedImg[m.family.slug] ?? 0;
        return (
          <div key={m.family.slug} className="dq-mach">

            {/* hero image */}
            <div className="dq-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgs[heroIdx]} alt={m.family.name} className="dq-hero__main" />
              {imgs.length > 1 && (
                <div className="dq-hero__thumbs">
                  {imgs.map((img, ii) => (
                    <button key={ii} className={`dq-hero__thumb${heroIdx === ii ? " dq-hero__thumb--on" : ""}`}
                      onClick={() => setExpandedImg(prev => ({ ...prev, [m.family.slug]: ii }))}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* machine identity */}
            <div className="dq-mach__identity">
              <span className="dq-mach__series">{m.family.series}</span>
              <span className="dq-mach__name">{m.family.name}</span>
              {m.family.tagline && <span className="dq-mach__tagline">{m.family.tagline}</span>}
            </div>

            {/* model selection — cards */}
            <div className="dq-section">
              <div className="dq-section__label">Select Model</div>
              <div className="dq-model-cards">
                {m.family.models.map((mod, mi) => (
                  <button key={mod} className={`dq-mcard${m.modelIdx === mi ? " dq-mcard--on" : ""}`}
                    onClick={() => onMachineChange(i, { modelIdx: mi })}>
                    <span className="dq-mcard__name">{mod}</span>
                    {m.family.specs.length > 0 && (
                      <span className="dq-mcard__spec">{m.family.specs[0].values[mi] ?? m.family.specs[0].values[0]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* specs */}
            {m.family.specs.length > 0 && (
              <div className="dq-section">
                <div className="dq-section__label">Specifications — {m.family.models[m.modelIdx]}</div>
                <div className="dq-specs">
                  {m.family.specs.map(s => (
                    <div key={s.label} className="dq-spec">
                      <span className="dq-spec__label">{s.label}</span>
                      <span className="dq-spec__val">{s.values[m.modelIdx] ?? s.values[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* customization */}
            <div className="dq-section dq-cust">
              <div className="dq-section__label">Customization</div>
              <div className="dq-cust__grid">
                <div className="dq-cust__qty">
                  <span className="dq-cust__qty-label">Quantity</span>
                  <div className="dq-qty">
                    <button className="dq-qty__btn" onClick={() => onMachineChange(i, { qty: Math.max(1, m.qty - 1) })}>−</button>
                    <span className="dq-qty__val">{m.qty}</span>
                    <button className="dq-qty__btn" onClick={() => onMachineChange(i, { qty: m.qty + 1 })}>+</button>
                  </div>
                </div>
                <div className="dq-cust__notes">
                  <span className="dq-cust__notes-label">Special requirements</span>
                  <textarea className="dq-textarea" rows={3} placeholder="Any customization or special requirements…" value={m.notes} onChange={e => onMachineChange(i, { notes: e.target.value })} />
                </div>
              </div>
            </div>

          </div>
        );
      })}

      <div className="dq-contact">
        <div className="dq-section__label" style={{ marginBottom: "1rem" }}>Your Details</div>
        <div className="dq-grid2">
          <div className="dq-field">
            <label>Full name *</label>
            <input type="text" placeholder="Your name" value={form.name} onChange={e => onFormChange({ name: e.target.value })} required />
          </div>
          <div className="dq-field">
            <label>Company</label>
            <input type="text" placeholder="Company name" value={form.company} onChange={e => onFormChange({ company: e.target.value })} />
          </div>
          <div className="dq-field">
            <label>Email *</label>
            <input type="email" placeholder="you@company.com" value={form.email} onChange={e => onFormChange({ email: e.target.value })} required />
          </div>
          <div className="dq-field">
            <label>Phone / WhatsApp</label>
            <input type="tel" placeholder="+1 000 000 0000" value={form.phone} onChange={e => onFormChange({ phone: e.target.value })} />
          </div>
          <div className="dq-field">
            <label>Country</label>
            <input type="text" placeholder="Country" value={form.country} onChange={e => onFormChange({ country: e.target.value })} />
          </div>
        </div>
        <div className="dq-field" style={{ marginTop: "1rem" }}>
          <label>Message</label>
          <textarea className="dq-textarea" rows={3} placeholder="Tell us what you need…" value={form.message} onChange={e => onFormChange({ message: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3 — review ───────────────────────────────────────────── */
function Step3({ machines, form }: { machines: SelectedMachine[]; form: FormData }) {
  return (
    <div className="dq-s3">
      <div className="dq-review-block">
        <div className="dq-review-title">Machines</div>
        {machines.map(m => (
          <div key={m.family.slug} className="dq-review-machine">
            <div className="dq-review-machine__img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={familyImages(m.family)[0]} alt="" />
            </div>
            <div>
              <div className="dq-review-machine__name">{m.family.name}</div>
              <div className="dq-review-machine__meta">
                Model: <strong>{m.family.models[m.modelIdx]}</strong> · Qty: <strong>{m.qty}</strong>
              </div>
              {m.notes && <div className="dq-review-machine__notes">"{m.notes}"</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="dq-review-block">
        <div className="dq-review-title">Your Details</div>
        <div className="dq-review-grid">
          {[["Name", form.name], ["Company", form.company], ["Email", form.email], ["Phone", form.phone], ["Country", form.country]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="dq-review-row">
              <span className="dq-review-key">{k}</span>
              <span className="dq-review-val">{v}</span>
            </div>
          ))}
        </div>
        {form.message && <div className="dq-review-msg">"{form.message}"</div>}
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
function DirectInquiryInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [machines, setMachines] = useState<SelectedMachine[]>([]);
  const [form, setForm] = useState<FormData>({ name: "", company: "", email: "", phone: "", country: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    const slug = searchParams?.get("machine");
    if (!slug) return;
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setSelectedSlugs([slug]);
    setMachines([{ family: fam, modelIdx: 0, qty: 1, notes: "" }]);
    setStep(1);
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
    if (step === 1) return !!form.name && !!form.email;
    return true;
  }

  async function submitInquiry() {
    setSending(true); setSendError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "direct",
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
          source: typeof window !== "undefined" ? (sessionStorage.getItem("cx_source") ?? "direct") : "direct",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send inquiry");
      }
      setSent(true);
      // Store email for reply notifications
      if (form.email) {
        localStorage.setItem("cx_inquiry_email", form.email.trim().toLowerCase());
        localStorage.setItem("cx_inquiry_lastSeen", new Date().toISOString());
      }
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
        .dq-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg); position: relative;
        }
        .dq-page::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
          background-size: 80px 80px; pointer-events: none;
        }
        .dq-body {
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding: clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem) clamp(4rem,7vw,7rem);
        }
        .dq-heading { margin-bottom: clamp(2rem,4vw,3rem); }
        .dq-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .dq-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
        .dq-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.4rem,5vw,4rem);
          line-height: .93; color: var(--text);
          letter-spacing: -.01em; margin: 0 0 .7rem;
        }
        .dq-h1 em { font-style: normal; color: var(--brand-teal); }
        .dq-sub {
          font-size: clamp(.85rem,1vw,.95rem);
          color: var(--text-muted); line-height: 1.7; max-width: 52ch;
        }
        .dq-steps { display: flex; align-items: center; gap: 0; margin-bottom: 2rem; overflow-x: auto; padding-bottom: .25rem; scrollbar-width: none; }
        .dq-steps::-webkit-scrollbar { display: none; }
        .dq-step { display: flex; align-items: center; gap: .6rem; flex-shrink: 0; }
        .dq-step__dot {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px solid var(--border); background: var(--card-bg);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-mono); font-size: .7rem; color: var(--text-muted); flex-shrink: 0;
        }
        .dq-step--active .dq-step__dot { border-color: var(--brand-teal); background: rgba(43,191,179,.15); color: var(--brand-teal); }
        .dq-step--done .dq-step__dot { border-color: var(--brand-teal); background: var(--brand-teal); }
        .dq-step__label { font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
        .dq-step--active .dq-step__label { color: var(--text); }
        .dq-step--done .dq-step__label { color: var(--text-secondary); }
        .dq-step__line { width: 2.5rem; height: 1px; background: var(--border); flex-shrink: 0; margin: 0 .5rem; }
        .dq-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 1.25rem; padding: clamp(1.5rem,3vw,2.5rem); margin-bottom: 1.5rem;
        }
        .dq-cattabs { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .dq-cattab {
          display: flex; align-items: center; gap: .5rem;
          padding: .5rem 1rem; border-radius: 999px;
          border: 1px solid var(--border); background: var(--card-bg);
          font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .08em;
          text-transform: uppercase; color: var(--text-muted); cursor: pointer; white-space: nowrap;
        }
        .dq-cattab:hover { border-color: var(--text-secondary); color: var(--text); }
        .dq-cattab--active { background: rgba(43,191,179,.12) !important; border-color: rgba(43,191,179,.4) !important; color: var(--text) !important; }
        .dq-cattab__icon { color: var(--brand-teal); line-height: 0; }
        .dq-families { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .dq-fcard {
          position: relative; text-align: left;
          border: 1px solid var(--border); border-radius: 1rem;
          background: var(--card-bg); padding: 0; cursor: pointer;
          overflow: hidden; transition: border-color .2s;
        }
        .dq-fcard:hover { border-color: var(--text-secondary); }
        .dq-fcard--on { border-color: var(--brand-teal) !important; }
        .dq-fcard__img-wrap { width: 100%; height: 120px; overflow: hidden; background: var(--surface); }
        .dq-fcard__img { width: 100%; height: 100%; object-fit: cover; }
        .dq-fcard__check {
          position: absolute; top: .75rem; right: .75rem;
          width: 22px; height: 22px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.2); background: rgba(0,0,0,.3);
          backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
        }
        .dq-fcard--on .dq-fcard__check { background: var(--brand-teal); border-color: var(--brand-teal); }
        .dq-fcard__series { font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .16em; text-transform: uppercase; color: var(--brand-teal); padding: .85rem 1rem .25rem; }
        .dq-fcard__name { font-family: var(--ff-display); font-size: 1rem; color: var(--text); line-height: 1.1; padding: 0 1rem .35rem; }
        .dq-fcard__tagline { font-size: .78rem; color: var(--text-muted); line-height: 1.5; padding: 0 1rem .85rem; }
        .dq-sel-count { margin-top: 1.25rem; font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .12em; text-transform: uppercase; color: var(--brand-teal); }
        .dq-mach {
          border: 1px solid var(--border); border-radius: 1rem;
          background: var(--surface); padding: 1.5rem; margin-bottom: 1.5rem;
        }

        /* hero image */
        .dq-hero { margin-bottom: 1.5rem; }
        .dq-hero__main {
          width: 100%; height: 300px; object-fit: cover;
          border-radius: .75rem; border: 1px solid var(--border);
          background: var(--card-bg);
        }
        @media(max-width:600px){ .dq-hero__main{ height: 200px; } }
        .dq-hero__thumbs { display: flex; gap: .5rem; margin-top: .75rem; overflow-x: auto; padding-bottom: .25rem; }
        .dq-hero__thumb {
          width: 52px; height: 52px; border-radius: .5rem; overflow: hidden;
          border: 2px solid var(--border); background: none; cursor: pointer;
          flex-shrink: 0; padding: 0;
        }
        .dq-hero__thumb img { width: 100%; height: 100%; object-fit: cover; }
        .dq-hero__thumb--on { border-color: var(--brand-teal); }

        /* identity */
        .dq-mach__identity {
          display: flex; flex-direction: column; gap: .2rem;
          margin-bottom: 1.5rem; padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .dq-mach__series { font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .16em; text-transform: uppercase; color: var(--brand-teal); }
        .dq-mach__name { font-family: var(--ff-display); font-size: 1.4rem; color: var(--text); line-height: 1.1; }
        .dq-mach__tagline { font-size: .85rem; color: var(--text-muted); margin-top: .15rem; }

        /* sections */
        .dq-section { margin-bottom: 1.25rem; }
        .dq-section__label { font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: .65rem; }

        /* model cards */
        .dq-model-cards { display: flex; flex-wrap: wrap; gap: .6rem; }
        .dq-mcard {
          flex: 1 1 auto; min-width: 100px;
          display: flex; flex-direction: column; align-items: center;
          gap: .2rem; padding: .7rem .9rem;
          border: 1px solid var(--border); border-radius: .75rem;
          background: var(--card-bg); cursor: pointer;
          transition: border-color .15s, background .15s;
        }
        .dq-mcard:hover { border-color: var(--text-secondary); }
        .dq-mcard--on { border-color: var(--brand-teal) !important; background: rgba(43,191,179,.1) !important; }
        .dq-mcard__name { font-family: var(--ff-mono); font-size: .72rem; font-weight: 600; letter-spacing: .04em; color: var(--text); }
        .dq-mcard__spec { font-family: var(--ff-mono); font-size: .6rem; color: var(--text-secondary); }
        .dq-mcard--on .dq-mcard__name { color: var(--brand-teal); }

        /* specs */
        .dq-specs {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: .5rem 1.5rem; padding: 1rem;
          background: var(--card-bg); border-radius: .75rem; border: 1px solid var(--border);
        }
        .dq-spec { display: flex; flex-direction: column; gap: .15rem; }
        .dq-spec__label { font-family: var(--ff-mono); font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-secondary); }
        .dq-spec__val { font-family: var(--ff-mono); font-size: .78rem; color: var(--text); }

        /* customization */
        .dq-cust { background: var(--card-bg); border: 1px solid var(--border); border-radius: .75rem; padding: 1rem 1.25rem; }
        .dq-cust__grid { display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; align-items: start; }
        @media(max-width:600px){ .dq-cust__grid{ grid-template-columns: 1fr; } }
        .dq-cust__qty { display: flex; flex-direction: column; gap: .4rem; }
        .dq-cust__qty-label { font-family: var(--ff-mono); font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
        .dq-cust__notes { display: flex; flex-direction: column; gap: .4rem; }
        .dq-cust__notes-label { font-family: var(--ff-mono); font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
        .dq-qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: .5rem; overflow: hidden; }
        .dq-qty__btn { width: 40px; height: 40px; background: var(--surface); color: var(--text-secondary); font-size: 1.1rem; border: none; cursor: pointer; }
        .dq-qty__btn:hover { background: rgba(43,191,179,.12); color: var(--brand-teal); }
        .dq-qty__val { min-width: 44px; text-align: center; font-family: var(--ff-mono); font-size: .9rem; color: var(--text); background: var(--surface); line-height: 40px; }
        .dq-textarea {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: .5rem; color: var(--text); padding: .7rem 1rem; width: 100%;
          font-family: var(--ff-body); font-size: .9rem; resize: vertical; outline: none;
        }
        .dq-textarea::placeholder { color: var(--text-secondary); }
        .dq-textarea:focus { border-color: var(--brand-teal); }
        .dq-contact { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .dq-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media(max-width:600px){ .dq-grid2{ grid-template-columns:1fr; } }
        .dq-field { display: flex; flex-direction: column; gap: .35rem; }
        .dq-field label { font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--text-muted); }
        .dq-field input {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: .5rem; color: var(--text); padding: .65rem .9rem;
          font-family: var(--ff-body); font-size: .9rem; outline: none; width: 100%;
        }
        .dq-field input::placeholder { color: var(--text-secondary); }
        .dq-field input:focus { border-color: var(--brand-teal); }
        .dq-review-block { background: var(--card-bg); border: 1px solid var(--border); border-radius: .875rem; padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
        .dq-review-title { font-family: var(--ff-mono); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; color: var(--brand-teal); margin-bottom: 1rem; }
        .dq-review-machine { display: flex; align-items: center; gap: 1rem; padding: .75rem 0; border-bottom: 1px solid var(--border); }
        .dq-review-machine:last-child { border-bottom: none; }
        .dq-review-machine__img { width: 48px; height: 48px; border-radius: .5rem; overflow: hidden; flex-shrink: 0; }
        .dq-review-machine__img img { width: 100%; height: 100%; object-fit: cover; }
        .dq-review-machine__name { font-family: var(--ff-display); font-size: 1rem; color: var(--text); margin-bottom: .2rem; }
        .dq-review-machine__meta { font-family: var(--ff-mono); font-size: .72rem; color: var(--text-secondary); }
        .dq-review-machine__meta strong { color: var(--text); }
        .dq-review-machine__notes { margin-top: .3rem; font-size: .82rem; color: var(--text-secondary); font-style: italic; }
        .dq-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem 2rem; }
        .dq-review-row { display: flex; flex-direction: column; gap: .15rem; }
        .dq-review-key { font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-secondary); }
        .dq-review-val { font-size: .9rem; color: var(--text); }
        .dq-review-msg { margin-top: .75rem; font-size: .85rem; color: var(--text-secondary); font-style: italic; }
        .dq-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 2rem; }
        .dq-back {
          display: flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .1em;
          text-transform: uppercase; color: var(--text-muted); cursor: pointer;
          background: none; border: none;
        }
        .dq-back:hover { color: var(--text); }
        .dq-success { text-align: center; padding: clamp(3rem,6vw,6rem) 2rem; }
        .dq-success__icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(43,191,179,.12); border: 1.5px solid rgba(43,191,179,.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.75rem;
        }
        .dq-success__title { font-family: var(--ff-display); font-size: clamp(2rem,4vw,3rem); color: var(--text); margin: 0 0 1rem; line-height: .95; }
        .dq-success__sub { color: var(--text-muted); font-size: .95rem; line-height: 1.7; max-width: 40ch; margin: 0 auto; }
        .dq-error { margin-top: 1rem; padding: .75rem 1rem; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); border-radius: .5rem; color: #fca5a5; font-size: .88rem; }
      `}</style>

      <div className="dq-page">
        <div className="dq-body">
          <div className="dq-heading">
            <div className="dq-eyebrow">Direct Inquiry</div>
            <h1 className="dq-h1">
              Quick <em>machine inquiry.</em>
            </h1>
            <p className="dq-sub">
              Already know what you need? Pick your machines, add any customization notes, and send — we reply within 24 hours.
            </p>
          </div>

          {sent ? (
            <div className="dq-card">
              <div className="dq-success">
                <div className="dq-success__icon">
                  <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                    <path d="M2 12l8 8L26 2" stroke="var(--brand-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="dq-success__title">Inquiry sent.</h2>
                <p className="dq-success__sub">
                  Thank you, {form.name || "there"}. Our team will review your request and reply to {form.email || "you"} within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />
              <div className="dq-card">
                {step === 0 && <Step1 selected={selectedSlugs} onToggle={toggleFamily} />}
                {step === 1 && <Step2 machines={machines} form={form} onMachineChange={patchMachine} onFormChange={p => setForm(f => ({ ...f, ...p }))} />}
                {step === 2 && <Step3 machines={machines} form={form} />}
              </div>

              {sendError && <div className="dq-error" role="alert">{sendError}</div>}

              <div className="dq-nav">
                {step > 0
                  ? <button className="dq-back" onClick={() => setStep(s => s - 1)} disabled={sending}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Back
                    </button>
                  : <TransitionLink href="/inquiries">
                      <span className="dq-back">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        All inquiry types
                      </span>
                    </TransitionLink>
                }
                <AetherBtn>
                  <button
                    type="button"
                    disabled={!canAdvance()}
                    style={{ opacity: canAdvance() ? 1 : .4, cursor: canAdvance() ? "pointer" : "default" }}
                    onClick={advance}
                  >
                    {sending
                      ? "Sending…"
                      : step === STEPS.length - 1 ? "Send inquiry →" : step === 0 ? `Select ${selectedSlugs.length || ""} machine${selectedSlugs.length !== 1 ? "s" : ""} →` : "Continue →"}
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

export default function DirectInquiryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <DirectInquiryInner />
    </Suspense>
  );
}
