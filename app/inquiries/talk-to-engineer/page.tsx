"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { families, categories, familyImages, type ProductFamily } from "@/lib/products";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import type { InquiryMachine, InquiryPart } from "@/models/Inquiry";

/* ─── types ─────────────────────────────────────────────────────── */
interface SelectedMachine {
  family: ProductFamily;
  modelIdx: number;
  qty: number;
  notes: string;
}

interface PartEntry {
  name: string;
  machineName: string;
  machineSlug: string;
  quantity: number;
  notes: string;
  images: string[];
  uploading: boolean;
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

const STEPS = ["Select Machines", "Configure", "Add Parts", "Your Details", "Review & Send"];

/* ─── step indicator ────────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="tq-steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`tq-step${i === current ? " tq-step--active" : i < current ? " tq-step--done" : ""}`}>
          <div className="tq-step__dot">
            {i < current
              ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <span>{i + 1}</span>}
          </div>
          <span className="tq-step__label">{label}</span>
          {i < STEPS.length - 1 && <div className="tq-step__line" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1 — choose families ──────────────────────────────────── */
function Step1({ selected, onToggle }: { selected: string[]; onToggle: (slug: string) => void }) {
  const [activeCat, setActiveCat] = useState("film-blowing");
  const catFamilies = families.filter(f => f.category === activeCat);

  return (
    <div className="tq-s1">
      <div className="tq-cattabs">
        {categories.map(c => (
          <button key={c.slug} className={`tq-cattab${activeCat === c.slug ? " tq-cattab--active" : ""}`} onClick={() => setActiveCat(c.slug)}>
            <span className="tq-cattab__icon">{CAT_ICONS[c.slug]}</span>
            {c.name}
          </button>
        ))}
      </div>

      <div className="tq-families">
        {catFamilies.map(f => {
          const on = selected.includes(f.slug);
          const img = familyImages(f)[0];
          return (
            <button key={f.slug} className={`tq-fcard${on ? " tq-fcard--on" : ""}`} onClick={() => onToggle(f.slug)}>
              <div className="tq-fcard__img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={f.name} className="tq-fcard__img" />
              </div>
              <div className="tq-fcard__check">{on && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}</div>
              <div className="tq-fcard__series">{f.series}</div>
              <div className="tq-fcard__name">{f.name}</div>
              <div className="tq-fcard__tagline">{f.tagline}</div>
              <div className="tq-fcard__models">{f.models.length} model{f.models.length > 1 ? "s" : ""}</div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="tq-sel-count">
          {selected.length} machine line{selected.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

/* ─── Step 2 — configure each machine ───────────────────────────── */
function Step2({ machines, onChange }: { machines: SelectedMachine[]; onChange: (idx: number, patch: Partial<SelectedMachine>) => void }) {
  const [expandedImg, setExpandedImg] = useState<Record<string, number>>({});

  return (
    <div className="tq-s2">
      {machines.map((m, i) => {
        const imgs = familyImages(m.family);
        const heroIdx = expandedImg[m.family.slug] ?? 0;
        return (
          <div key={m.family.slug} className="tq-cfg">

            {/* hero image strip */}
            <div className="tq-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgs[heroIdx]} alt={m.family.name} className="tq-hero__main" />
              {imgs.length > 1 && (
                <div className="tq-hero__thumbs">
                  {imgs.map((img, ii) => (
                    <button key={ii} className={`tq-hero__thumb${heroIdx === ii ? " tq-hero__thumb--on" : ""}`}
                      onClick={() => setExpandedImg(prev => ({ ...prev, [m.family.slug]: ii }))}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* machine identity */}
            <div className="tq-cfg__identity">
              <span className="tq-cfg__series">{m.family.series}</span>
              <span className="tq-cfg__name">{m.family.name}</span>
              {m.family.tagline && <span className="tq-cfg__tagline">{m.family.tagline}</span>}
            </div>

            {/* model selection — visual cards */}
            <div className="tq-section">
              <div className="tq-section__label">Select Model</div>
              <div className="tq-model-cards">
                {m.family.models.map((mod, mi) => (
                  <button key={mod} className={`tq-mcard${m.modelIdx === mi ? " tq-mcard--on" : ""}`}
                    onClick={() => onChange(i, { modelIdx: mi })}>
                    <span className="tq-mcard__name">{mod}</span>
                    {m.family.specs.length > 0 && (
                      <span className="tq-mcard__spec">{m.family.specs[0].values[mi] ?? m.family.specs[0].values[0]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* specs grid */}
            {m.family.specs.length > 0 && (
              <div className="tq-section">
                <div className="tq-section__label">Specifications — {m.family.models[m.modelIdx]}</div>
                <div className="tq-specs">
                  {m.family.specs.map(s => (
                    <div key={s.label} className="tq-spec">
                      <span className="tq-spec__label">{s.label}</span>
                      <span className="tq-spec__val">{s.values[m.modelIdx] ?? s.values[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* materials */}
            {m.family.materials && (
              <div className="tq-section">
                <div className="tq-section__label">Materials</div>
                <div className="tq-matval">{m.family.materials}</div>
              </div>
            )}

            {/* customization */}
            <div className="tq-section tq-cust">
              <div className="tq-section__label">Customization</div>
              <div className="tq-cust__grid">
                <div className="tq-cust__qty">
                  <span className="tq-cust__qty-label">Quantity</span>
                  <div className="tq-qty">
                    <button className="tq-qty__btn" onClick={() => onChange(i, { qty: Math.max(1, m.qty - 1) })}>−</button>
                    <span className="tq-qty__val">{m.qty}</span>
                    <button className="tq-qty__btn" onClick={() => onChange(i, { qty: m.qty + 1 })}>+</button>
                  </div>
                </div>
                <div className="tq-cust__notes">
                  <span className="tq-cust__notes-label">Special requirements</span>
                  <textarea
                    className="tq-textarea"
                    rows={3}
                    placeholder="e.g. corona treatment, special voltage, CE certification, colour, automation level…"
                    value={m.notes}
                    onChange={e => onChange(i, { notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 3 — add parts ────────────────────────────────────────── */
function Step3({
  parts, machines, onAdd, onRemove, onUpdate
}: {
  parts: PartEntry[];
  machines: SelectedMachine[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, patch: Partial<PartEntry>) => void;
}) {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleImageUpload(idx: number, file: File) {
    onUpdate(idx, { uploading: true });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      onUpdate(idx, { images: [...parts[idx].images, j.url], uploading: false });
    } catch {
      onUpdate(idx, { uploading: false });
    }
  }

  function removeImage(partIdx: number, imgIdx: number) {
    onUpdate(partIdx, { images: parts[partIdx].images.filter((_, i) => i !== imgIdx) });
  }

  return (
    <div className="tq-s3">
      <p className="tq-s3-hint">
        Add specific parts or components you need. You can attach reference images to help our engineers identify exactly what you need.
      </p>

      {parts.map((p, i) => (
        <div key={i} className="tq-part">
          <div className="tq-part__head">
            <span className="tq-part__num">Part {i + 1}</span>
            <button className="tq-part__remove" onClick={() => onRemove(i)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          <div className="tq-part__fields">
            <div className="tq-field">
              <label>Part Name *</label>
              <input type="text" placeholder="e.g. Die Head, Screw, Barrel" value={p.name} onChange={e => onUpdate(i, { name: e.target.value })} />
            </div>
            <div className="tq-field">
              <label>Associated Machine</label>
              <select value={p.machineSlug} onChange={e => {
                const fam = machines.find(m => m.family.slug === e.target.value);
                onUpdate(i, { machineSlug: e.target.value, machineName: fam?.family.name ?? "" });
              }}>
                <option value="">— Select machine —</option>
                {machines.map(m => (
                  <option key={m.family.slug} value={m.family.slug}>{m.family.name} ({m.family.models[m.modelIdx]})</option>
                ))}
              </select>
            </div>
            <div className="tq-field">
              <label>Quantity</label>
              <div className="tq-qty tq-qty--sm">
                <button className="tq-qty__btn" onClick={() => onUpdate(i, { quantity: Math.max(1, p.quantity - 1) })}>−</button>
                <span className="tq-qty__val">{p.quantity}</span>
                <button className="tq-qty__btn" onClick={() => onUpdate(i, { quantity: p.quantity + 1 })}>+</button>
              </div>
            </div>
          </div>

          <div className="tq-field" style={{ marginTop: ".75rem" }}>
            <label>Notes</label>
            <textarea className="tq-textarea" rows={2} placeholder="Material, dimensions, specs, reference numbers…" value={p.notes} onChange={e => onUpdate(i, { notes: e.target.value })} />
          </div>

          {/* image upload */}
          <div className="tq-part__images">
            <div className="tq-part__imgs-row">
              {p.images.map((src, j) => (
                <div key={j} className="tq-part__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                  <button className="tq-part__thumb-x" onClick={() => removeImage(i, j)}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6m0-6l-6 6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button
                className="tq-part__add-img"
                onClick={() => fileRefs.current[i]?.click()}
                disabled={p.uploading}
              >
                {p.uploading ? (
                  <span className="tq-part__spinner" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                )}
                <span>{p.uploading ? "Uploading…" : "Add Image"}</span>
              </button>
            </div>
            <input
              ref={el => { fileRefs.current[i] = el; }}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(i, file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      ))}

      <button className="tq-add-part" onClick={onAdd}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Add Another Part
      </button>
    </div>
  );
}

/* ─── Step 4 — contact details ──────────────────────────────────── */
function Step4({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div className="tq-s4">
      <div className="tq-grid2">
        <div className="tq-field">
          <label>Full name *</label>
          <input type="text" placeholder="Your name" value={data.name} onChange={e => onChange({ name: e.target.value })} required />
        </div>
        <div className="tq-field">
          <label>Company</label>
          <input type="text" placeholder="Company name" value={data.company} onChange={e => onChange({ company: e.target.value })} />
        </div>
        <div className="tq-field">
          <label>Email *</label>
          <input type="email" placeholder="you@company.com" value={data.email} onChange={e => onChange({ email: e.target.value })} required />
        </div>
        <div className="tq-field">
          <label>Phone / WhatsApp</label>
          <input type="tel" placeholder="+1 000 000 0000" value={data.phone} onChange={e => onChange({ phone: e.target.value })} />
        </div>
        <div className="tq-field">
          <label>Country</label>
          <input type="text" placeholder="Country" value={data.country} onChange={e => onChange({ country: e.target.value })} />
        </div>
      </div>
      <div className="tq-field" style={{ marginTop: "1rem" }}>
        <label>Additional message</label>
        <textarea className="tq-textarea" rows={4} placeholder="Production targets, timeline, floor dimensions, special requirements…" value={data.message} onChange={e => onChange({ message: e.target.value })} />
      </div>
    </div>
  );
}

/* ─── Step 5 — review & send ────────────────────────────────────── */
function Step5({ machines, parts, form }: { machines: SelectedMachine[]; parts: PartEntry[]; form: FormData }) {
  return (
    <div className="tq-s5">
      {/* machine sheet */}
      <div className="tq-review-block">
        <div className="tq-review-title">Machine Configuration Sheet</div>
        <table className="tq-sheet">
          <thead>
            <tr>
              <th>Machine</th>
              <th>Model</th>
              <th>Qty</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {machines.map(m => (
              <tr key={m.family.slug}>
                <td>
                  <div className="tq-sheet__machine">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={familyImages(m.family)[0]} alt="" className="tq-sheet__thumb" />
                    <div>
                      <div className="tq-sheet__name">{m.family.name}</div>
                      <div className="tq-sheet__series">{m.family.series}</div>
                    </div>
                  </div>
                </td>
                <td>{m.family.models[m.modelIdx]}</td>
                <td>{m.qty}</td>
                <td className="tq-sheet__notes">{m.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* parts */}
      {parts.length > 0 && (
        <div className="tq-review-block">
          <div className="tq-review-title">Parts Requested</div>
          <table className="tq-sheet">
            <thead>
              <tr>
                <th>Part</th>
                <th>Machine</th>
                <th>Qty</th>
                <th>Notes</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p, i) => (
                <tr key={i}>
                  <td>{p.name || "—"}</td>
                  <td>{p.machineName || "—"}</td>
                  <td>{p.quantity}</td>
                  <td className="tq-sheet__notes">{p.notes || "—"}</td>
                  <td>
                    <div className="tq-sheet__imgs">
                      {p.images.map((src, j) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={j} src={src} alt="" className="tq-sheet__img-sm" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* contact */}
      <div className="tq-review-block">
        <div className="tq-review-title">Your Details</div>
        <div className="tq-review-grid">
          {[["Name", form.name], ["Company", form.company], ["Email", form.email], ["Phone", form.phone], ["Country", form.country]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="tq-review-row">
              <span className="tq-review-key">{k}</span>
              <span className="tq-review-val">{v}</span>
            </div>
          ))}
        </div>
        {form.message && (
          <div className="tq-review-msg">"{form.message}"</div>
        )}
      </div>
    </div>
  );
}

/* ─── shared styles ──────────────────────────────────────────────── */
function SharedStyles() {
  return (
    <style suppressHydrationWarning>{`
      .tq-page {
        min-height: 100vh; padding-top: 100px;
        background: var(--bg); position: relative;
      }
      .tq-page::before {
        content: ""; position: absolute; inset: 0; z-index: 0;
        background:
          linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
        background-size: 80px 80px; pointer-events: none;
      }
      .tq-body {
        position: relative; z-index: 1;
        max-width: 1100px; margin: 0 auto;
        padding: clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem) clamp(4rem,7vw,7rem);
      }
      .tq-heading { margin-bottom: clamp(2rem,4vw,3rem); }
      .tq-eyebrow {
        display: inline-flex; align-items: center; gap: .6rem;
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .22em; text-transform: uppercase;
        color: var(--brand-teal); margin-bottom: 1rem;
      }
      .tq-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
      .tq-h1 {
        font-family: var(--ff-display);
        font-size: clamp(2.4rem,5vw,4rem);
        line-height: .93; color: var(--text);
        letter-spacing: -.01em; margin: 0 0 .7rem;
      }
      .tq-h1 em { font-style: normal; color: var(--brand-teal); }
      .tq-sub {
        font-size: clamp(.85rem,1vw,.95rem);
        color: var(--text-muted); line-height: 1.7; max-width: 52ch;
      }

      /* steps */
      .tq-steps {
        display: flex; align-items: center; gap: 0; margin-bottom: 2rem;
        overflow-x: auto; padding-bottom: .25rem; scrollbar-width: none;
      }
      .tq-steps::-webkit-scrollbar { display: none; }
      .tq-step { display: flex; align-items: center; gap: .6rem; flex-shrink: 0; }
      .tq-step__dot {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1.5px solid var(--border);
        background: var(--card-bg);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--ff-mono); font-size: .7rem;
        color: var(--text-muted); flex-shrink: 0;
      }
      .tq-step--active .tq-step__dot {
        border-color: var(--brand-teal); background: rgba(43,191,179,.15);
        color: var(--brand-teal);
      }
      .tq-step--done .tq-step__dot {
        border-color: var(--brand-teal); background: var(--brand-teal);
      }
      .tq-step__label {
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--text-muted); white-space: nowrap;
      }
      .tq-step--active .tq-step__label { color: var(--text); }
      .tq-step--done .tq-step__label { color: var(--text-secondary); }
      .tq-step__line { width: 2.5rem; height: 1px; background: var(--border); flex-shrink: 0; margin: 0 .5rem; }

      /* card */
      .tq-card {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 1.25rem;
        padding: clamp(1.5rem,3vw,2.5rem);
        margin-bottom: 1.5rem;
      }

      /* step 1 */
      .tq-cattabs { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
      .tq-cattab {
        display: flex; align-items: center; gap: .5rem;
        padding: .5rem 1rem; border-radius: 999px;
        border: 1px solid var(--border); background: var(--card-bg);
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .08em; text-transform: uppercase;
        color: var(--text-muted); cursor: pointer; white-space: nowrap;
      }
      .tq-cattab:hover { border-color: var(--text-secondary); color: var(--text); }
      .tq-cattab--active {
        background: rgba(43,191,179,.12) !important;
        border-color: rgba(43,191,179,.4) !important;
        color: var(--text) !important;
      }
      .tq-cattab__icon { color: var(--brand-teal); line-height: 0; }
      .tq-families { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
      .tq-fcard {
        position: relative; text-align: left;
        border: 1px solid var(--border); border-radius: 1rem;
        background: var(--card-bg); padding: 0; cursor: pointer;
        overflow: hidden; transition: border-color .2s;
      }
      .tq-fcard:hover { border-color: var(--text-secondary); }
      .tq-fcard--on { border-color: var(--brand-teal) !important; }
      .tq-fcard__img-wrap {
        width: 100%; height: 140px; overflow: hidden;
        background: var(--surface);
      }
      .tq-fcard__img { width: 100%; height: 100%; object-fit: cover; }
      .tq-fcard__check {
        position: absolute; top: .75rem; right: .75rem;
        width: 22px; height: 22px; border-radius: 50%;
        border: 1.5px solid rgba(255,255,255,.2);
        background: rgba(0,0,0,.3); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
      }
      .tq-fcard--on .tq-fcard__check { background: var(--brand-teal); border-color: var(--brand-teal); }
      .tq-fcard__series {
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .16em; text-transform: uppercase;
        color: var(--brand-teal); padding: 1rem 1.25rem .3rem;
      }
      .tq-fcard__name {
        font-family: var(--ff-display); font-size: 1.05rem;
        color: var(--text); line-height: 1.1; padding: 0 1.25rem .4rem;
      }
      .tq-fcard__tagline {
        font-size: .8rem; color: var(--text-muted);
        line-height: 1.5; padding: 0 1.25rem .75rem;
      }
      .tq-fcard__models {
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--text-secondary); padding: 0 1.25rem 1rem;
      }
      .tq-sel-count {
        margin-top: 1.25rem;
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .12em; text-transform: uppercase;
        color: var(--brand-teal);
      }

      /* step 2 — hero image */
      .tq-hero { margin-bottom: 1.5rem; }
      .tq-hero__main {
        width: 100%; height: 320px; object-fit: cover;
        border-radius: .75rem; border: 1px solid var(--border);
        background: var(--card-bg);
      }
      @media(max-width:600px){ .tq-hero__main{ height: 220px; } }
      .tq-hero__thumbs { display: flex; gap: .5rem; margin-top: .75rem; overflow-x: auto; padding-bottom: .25rem; }
      .tq-hero__thumb {
        width: 56px; height: 56px; border-radius: .5rem; overflow: hidden;
        border: 2px solid var(--border); background: none; cursor: pointer;
        flex-shrink: 0; padding: 0;
      }
      .tq-hero__thumb img { width: 100%; height: 100%; object-fit: cover; }
      .tq-hero__thumb--on { border-color: var(--brand-teal); }

      /* step 2 — card shell */
      .tq-cfg {
        border: 1px solid var(--border); border-radius: 1rem;
        background: var(--surface); padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .tq-cfg__identity {
        display: flex; flex-direction: column; gap: .2rem;
        margin-bottom: 1.5rem; padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }
      .tq-cfg__series {
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .16em; text-transform: uppercase; color: var(--brand-teal);
      }
      .tq-cfg__name {
        font-family: var(--ff-display); font-size: 1.5rem;
        color: var(--text); line-height: 1.1;
      }
      .tq-cfg__tagline {
        font-size: .85rem; color: var(--text-muted); margin-top: .15rem;
      }

      /* step 2 — sections */
      .tq-section { margin-bottom: 1.25rem; }
      .tq-section__label {
        font-family: var(--ff-mono); font-size: .68rem;
        letter-spacing: .12em; text-transform: uppercase;
        color: var(--text-muted); display: block; margin-bottom: .65rem;
      }

      /* step 2 — model cards */
      .tq-model-cards { display: flex; flex-wrap: wrap; gap: .6rem; }
      .tq-mcard {
        flex: 1 1 auto; min-width: 110px;
        display: flex; flex-direction: column; align-items: center;
        gap: .25rem; padding: .75rem 1rem;
        border: 1px solid var(--border); border-radius: .75rem;
        background: var(--card-bg); cursor: pointer;
        transition: border-color .15s, background .15s;
      }
      .tq-mcard:hover { border-color: var(--text-secondary); }
      .tq-mcard--on {
        border-color: var(--brand-teal) !important;
        background: rgba(43,191,179,.1) !important;
      }
      .tq-mcard__name {
        font-family: var(--ff-mono); font-size: .75rem;
        font-weight: 600; letter-spacing: .04em; color: var(--text);
      }
      .tq-mcard__spec {
        font-family: var(--ff-mono); font-size: .62rem;
        color: var(--text-secondary);
      }
      .tq-mcard--on .tq-mcard__name { color: var(--brand-teal); }

      /* step 2 — specs */
      .tq-specs {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: .5rem 1.5rem; padding: 1rem;
        background: var(--card-bg); border-radius: .75rem;
        border: 1px solid var(--border);
      }
      .tq-spec { display: flex; flex-direction: column; gap: .15rem; }
      .tq-spec__label {
        font-family: var(--ff-mono); font-size: .62rem;
        letter-spacing: .1em; text-transform: uppercase; color: var(--text-secondary);
      }
      .tq-spec__val { font-family: var(--ff-mono); font-size: .8rem; color: var(--text); }
      .tq-matval { font-family: var(--ff-mono); font-size: .75rem; color: var(--text-secondary); }

      /* step 2 — customization */
      .tq-cust { background: var(--card-bg); border: 1px solid var(--border); border-radius: .75rem; padding: 1rem 1.25rem; }
      .tq-cust__grid {
        display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; align-items: start;
      }
      @media(max-width:600px){ .tq-cust__grid{ grid-template-columns: 1fr; } }
      .tq-cust__qty { display: flex; flex-direction: column; gap: .4rem; }
      .tq-cust__qty-label {
        font-family: var(--ff-mono); font-size: .62rem;
        letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted);
      }
      .tq-cust__notes { display: flex; flex-direction: column; gap: .4rem; }
      .tq-cust__notes-label {
        font-family: var(--ff-mono); font-size: .62rem;
        letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted);
      }
      .tq-qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: .5rem; overflow: hidden; }
      .tq-qty__btn {
        width: 40px; height: 40px; background: var(--surface);
        color: var(--text-secondary); font-size: 1.1rem; line-height: 1;
        border: none; cursor: pointer;
      }
      .tq-qty__btn:hover { background: rgba(43,191,179,.12); color: var(--brand-teal); }
      .tq-qty__val {
        min-width: 44px; text-align: center;
        font-family: var(--ff-mono); font-size: .9rem;
        color: var(--text); background: var(--surface);
        line-height: 40px;
      }
      .tq-textarea {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: .5rem; color: var(--text);
        padding: .7rem 1rem; width: 100%;
        font-family: var(--ff-body); font-size: .9rem;
        resize: vertical; outline: none;
      }
      .tq-textarea::placeholder { color: var(--text-secondary); }
      .tq-textarea:focus { border-color: var(--brand-teal); }

      /* step 3 - parts */
      .tq-s3-hint {
        font-size: .9rem; color: var(--text-muted); line-height: 1.6;
        margin: 0 0 1.5rem;
      }
      .tq-part {
        border: 1px solid var(--border); border-radius: 1rem;
        background: var(--surface); padding: 1.5rem;
        margin-bottom: 1.25rem;
      }
      .tq-part__head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 1rem; padding-bottom: .75rem;
        border-bottom: 1px solid var(--border);
      }
      .tq-part__num {
        font-family: var(--ff-mono); font-size: .7rem;
        letter-spacing: .12em; text-transform: uppercase;
        color: var(--brand-teal);
      }
      .tq-part__remove {
        background: none; border: none; color: var(--text-secondary);
        cursor: pointer; padding: .25rem;
      }
      .tq-part__remove:hover { color: #ef4444; }
      .tq-part__fields {
        display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem;
        align-items: end;
      }
      @media(max-width:700px){ .tq-part__fields{ grid-template-columns: 1fr; } }
      .tq-field { display: flex; flex-direction: column; gap: .4rem; }
      .tq-field label {
        font-family: var(--ff-mono); font-size: .68rem;
        letter-spacing: .12em; text-transform: uppercase;
        color: var(--text-muted);
      }
      .tq-field input, .tq-field select {
        background: var(--card-bg); border: 1px solid var(--border);
        border-radius: .5rem; color: var(--text);
        padding: .7rem 1rem; font-family: var(--ff-body); font-size: .9rem;
        outline: none; width: 100%;
      }
      .tq-field select { cursor: pointer; }
      .tq-field input::placeholder { color: var(--text-secondary); }
      .tq-field input:focus, .tq-field select:focus { border-color: var(--brand-teal); }
      .tq-textarea {
        background: var(--card-bg); border: 1px solid var(--border);
        border-radius: .5rem; color: var(--text);
        padding: .7rem 1rem; width: 100%;
        font-family: var(--ff-body); font-size: .9rem;
        resize: vertical; outline: none;
      }
      .tq-textarea::placeholder { color: var(--text-secondary); }
      .tq-textarea:focus { border-color: var(--brand-teal); }
      .tq-part__images { margin-top: 1rem; }
      .tq-part__imgs-row { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; }
      .tq-part__thumb {
        position: relative; width: 64px; height: 64px;
        border-radius: .5rem; overflow: hidden;
        border: 1px solid var(--border);
      }
      .tq-part__thumb img { width: 100%; height: 100%; object-fit: cover; }
      .tq-part__thumb-x {
        position: absolute; top: 2px; right: 2px;
        width: 18px; height: 18px; border-radius: 50%;
        background: rgba(0,0,0,.6); border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
      }
      .tq-part__add-img {
        display: flex; align-items: center; gap: .4rem;
        padding: .5rem 1rem; border-radius: .5rem;
        border: 1px dashed var(--border); background: var(--card-bg);
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .08em; text-transform: uppercase;
        color: var(--text-secondary); cursor: pointer;
      }
      .tq-part__add-img:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
      .tq-part__add-img:disabled { opacity: .5; cursor: default; }
      .tq-part__spinner {
        width: 14px; height: 14px; border-radius: 50%;
        border: 2px solid var(--border); border-top-color: var(--brand-teal);
        animation: tq-spin .6s linear infinite;
      }
      @keyframes tq-spin { to { transform: rotate(360deg); } }
      .tq-add-part {
        display: flex; align-items: center; gap: .5rem;
        padding: .85rem 1.5rem; border-radius: .75rem;
        border: 1px dashed var(--brand-teal); background: rgba(43,191,179,.06);
        font-family: var(--ff-mono); font-size: .7rem;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--brand-teal); cursor: pointer; width: 100%;
        justify-content: center;
      }
      .tq-add-part:hover { background: rgba(43,191,179,.12); }

      /* step 4 */
      .tq-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media(max-width:600px){ .tq-grid2{ grid-template-columns:1fr; } }

      /* step 5 - review */
      .tq-review-block {
        background: var(--card-bg); border: 1px solid var(--border);
        border-radius: .875rem; padding: 1.25rem 1.5rem;
        margin-bottom: 1.25rem;
      }
      .tq-review-title {
        font-family: var(--ff-mono); font-size: .7rem;
        letter-spacing: .18em; text-transform: uppercase;
        color: var(--brand-teal); margin-bottom: 1rem;
      }
      .tq-sheet { width: 100%; border-collapse: collapse; }
      .tq-sheet th {
        text-align: left; padding: .5rem .75rem;
        font-family: var(--ff-mono); font-size: .62rem;
        letter-spacing: .12em; text-transform: uppercase;
        color: var(--text-secondary); border-bottom: 1px solid var(--border);
      }
      .tq-sheet td {
        padding: .65rem .75rem; font-size: .85rem;
        color: var(--text); border-bottom: 1px solid var(--border);
        vertical-align: middle;
      }
      .tq-sheet tr:last-child td { border-bottom: none; }
      .tq-sheet__machine { display: flex; align-items: center; gap: .75rem; }
      .tq-sheet__thumb { width: 40px; height: 40px; border-radius: .4rem; object-fit: cover; }
      .tq-sheet__name { font-weight: 600; }
      .tq-sheet__series {
        font-family: var(--ff-mono); font-size: .6rem;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--text-secondary);
      }
      .tq-sheet__notes { font-size: .8rem; color: var(--text-secondary); font-style: italic; max-width: 200px; }
      .tq-sheet__imgs { display: flex; gap: .3rem; flex-wrap: wrap; }
      .tq-sheet__img-sm { width: 32px; height: 32px; border-radius: .3rem; object-fit: cover; }
      .tq-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem 2rem; }
      .tq-review-row { display: flex; flex-direction: column; gap: .15rem; }
      .tq-review-key {
        font-family: var(--ff-mono); font-size: .65rem;
        letter-spacing: .1em; text-transform: uppercase; color: var(--text-secondary);
      }
      .tq-review-val { font-size: .9rem; color: var(--text); }
      .tq-review-msg {
        margin-top: .75rem; font-size: .85rem;
        color: var(--text-secondary); font-style: italic;
      }

      /* nav */
      .tq-nav {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; margin-top: 2rem;
      }
      .tq-back {
        display: flex; align-items: center; gap: .5rem;
        font-family: var(--ff-mono); font-size: .68rem;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--text-muted); cursor: pointer; background: none; border: none;
      }
      .tq-back:hover { color: var(--text); }

      /* success */
      .tq-success { text-align: center; padding: clamp(3rem,6vw,6rem) 2rem; }
      .tq-success__icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(43,191,179,.12); border: 1.5px solid rgba(43,191,179,.3);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1.75rem;
      }
      .tq-success__title {
        font-family: var(--ff-display);
        font-size: clamp(2rem,4vw,3rem);
        color: var(--text); margin: 0 0 1rem; line-height: .95;
      }
      .tq-success__sub {
        color: var(--text-muted); font-size: .95rem;
        line-height: 1.7; max-width: 40ch; margin: 0 auto;
      }
      .tq-error {
        margin-top: 1rem; padding: .75rem 1rem;
        background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
        border-radius: .5rem; color: #fca5a5; font-size: .88rem;
      }
      .tq-table-responsive { overflow-x: auto; }
    `}</style>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
function TalkToEngineerInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [machines, setMachines] = useState<SelectedMachine[]>([]);
  const [parts, setParts] = useState<PartEntry[]>([]);
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

  function addPart() {
    setParts(prev => [...prev, {
      name: "", machineName: "", machineSlug: "",
      quantity: 1, notes: "", images: [], uploading: false,
    }]);
  }

  function removePart(idx: number) {
    setParts(prev => prev.filter((_, i) => i !== idx));
  }

  function updatePart(idx: number, patch: Partial<PartEntry>) {
    setParts(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  }

  function canAdvance() {
    if (sending) return false;
    if (step === 0) return selectedSlugs.length > 0;
    if (step === 2) return true; // parts are optional
    if (step === 3) return !!form.name && !!form.email;
    return true;
  }

  async function submitInquiry() {
    setSending(true); setSendError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "talk-to-engineer",
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
          parts: parts.filter(p => p.name.trim()).map(p => ({
            name: p.name,
            machine: p.machineName,
            machineSlug: p.machineSlug,
            quantity: p.quantity,
            notes: p.notes,
            images: p.images,
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
      <SharedStyles />
      <div className="tq-page">
        <div className="tq-body">
          <div className="tq-heading">
            <div className="tq-eyebrow">Talk to Our Engineer</div>
            <h1 className="tq-h1">
              Build your <em>custom order.</em>
            </h1>
            <p className="tq-sub">
              Select machines, configure specs, add parts — our engineers review every detail and reply within 24 hours.
            </p>
          </div>

          {sent ? (
            <div className="tq-card">
              <div className="tq-success">
                <div className="tq-success__icon">
                  <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                    <path d="M2 12l8 8L26 2" stroke="var(--brand-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="tq-success__title">Inquiry sent.</h2>
                <p className="tq-success__sub">
                  Thank you, {form.name || "there"}. Our engineering team will review your configuration and reply to {form.email || "you"} within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />
              <div className="tq-card">
                {step === 0 && <Step1 selected={selectedSlugs} onToggle={toggleFamily} />}
                {step === 1 && <Step2 machines={machines} onChange={patchMachine} />}
                {step === 2 && <Step3 parts={parts} machines={machines} onAdd={addPart} onRemove={removePart} onUpdate={updatePart} />}
                {step === 3 && <Step4 data={form} onChange={p => setForm(f => ({ ...f, ...p }))} />}
                {step === 4 && <Step5 machines={machines} parts={parts} form={form} />}
              </div>

              {sendError && <div className="tq-error" role="alert">{sendError}</div>}

              <div className="tq-nav">
                {step > 0
                  ? <button className="tq-back" onClick={() => setStep(s => s - 1)} disabled={sending}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Back
                    </button>
                  : <TransitionLink href="/inquiries">
                      <span className="tq-back">
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

export default function TalkToEngineerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <TalkToEngineerInner />
    </Suspense>
  );
}
