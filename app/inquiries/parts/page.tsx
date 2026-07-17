"use client";
import { Suspense, useState, useRef } from "react";
import { families } from "@/lib/products";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";

/* ─── types ─────────────────────────────────────────────────────── */
interface PartEntry {
  name: string;
  machine: string;
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

const STEPS = ["Add Parts", "Your Details", "Review"];

/* ─── step indicator ────────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="ps-steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`ps-step${i === current ? " ps-step--active" : i < current ? " ps-step--done" : ""}`}>
          <div className="ps-step__dot">
            {i < current
              ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <span>{i + 1}</span>}
          </div>
          <span className="ps-step__label">{label}</span>
          {i < STEPS.length - 1 && <div className="ps-step__line" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Step 1 — parts form ──────────────────────────────────────── */
function Step1({ parts, onAdd, onRemove, onUpdate }: {
  parts: PartEntry[];
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
    <div className="ps-s1">
      <p className="ps-hint">
        Tell us about the parts you need. Add reference images to help us identify the exact components — our engineers will match them for you.
      </p>

      {parts.map((p, i) => (
        <div key={i} className="ps-part">
          <div className="ps-part__head">
            <span className="ps-part__num">Part {i + 1}</span>
            {parts.length > 1 && (
              <button className="ps-part__remove" onClick={() => onRemove(i)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>

          <div className="ps-fields">
            <div className="ps-field ps-field--wide">
              <label>Part Name *</label>
              <input type="text" placeholder="e.g. Die Head, Screw, Barrel, Heating Element" value={p.name} onChange={e => onUpdate(i, { name: e.target.value })} />
            </div>
            <div className="ps-field">
              <label>Associated Machine</label>
              <select value={p.machineSlug} onChange={e => {
                const fam = families.find(f => f.slug === e.target.value);
                onUpdate(i, { machineSlug: e.target.value, machine: fam?.name ?? "" });
              }}>
                <option value="">— Select (optional) —</option>
                {families.map(f => (
                  <option key={f.slug} value={f.slug}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="ps-field">
              <label>Quantity</label>
              <div className="ps-qty">
                <button className="ps-qty__btn" onClick={() => onUpdate(i, { quantity: Math.max(1, p.quantity - 1) })}>−</button>
                <span className="ps-qty__val">{p.quantity}</span>
                <button className="ps-qty__btn" onClick={() => onUpdate(i, { quantity: p.quantity + 1 })}>+</button>
              </div>
            </div>
          </div>

          <div className="ps-field" style={{ marginTop: ".75rem" }}>
            <label>Notes / Specs</label>
            <textarea className="ps-textarea" rows={2} placeholder="Material, dimensions, reference numbers, compatibility info…" value={p.notes} onChange={e => onUpdate(i, { notes: e.target.value })} />
          </div>

          {/* image upload */}
          <div className="ps-part__images">
            <div className="ps-part__imgs-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="4.5" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1"/><path d="M1 10l3-3 2 2 3-3 4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Reference Images
            </div>
            <div className="ps-part__imgs-row">
              {p.images.map((src, j) => (
                <div key={j} className="ps-part__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                  <button className="ps-part__thumb-x" onClick={() => removeImage(i, j)}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6m0-6l-6 6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button className="ps-part__add-img" onClick={() => fileRefs.current[i]?.click()} disabled={p.uploading}>
                {p.uploading ? <span className="ps-spinner" /> : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                )}
                <span>{p.uploading ? "Uploading…" : "Add"}</span>
              </button>
            </div>
            <input
              ref={el => { fileRefs.current[i] = el; }}
              type="file" accept="image/png,image/jpeg,image/webp,image/gif"
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

      <button className="ps-add" onClick={onAdd}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Add Another Part
      </button>
    </div>
  );
}

/* ─── Step 2 — contact details ──────────────────────────────────── */
function Step2({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div className="ps-s2">
      <div className="ps-grid2">
        <div className="ps-field">
          <label>Full name *</label>
          <input type="text" placeholder="Your name" value={data.name} onChange={e => onChange({ name: e.target.value })} required />
        </div>
        <div className="ps-field">
          <label>Company</label>
          <input type="text" placeholder="Company name" value={data.company} onChange={e => onChange({ company: e.target.value })} />
        </div>
        <div className="ps-field">
          <label>Email *</label>
          <input type="email" placeholder="you@company.com" value={data.email} onChange={e => onChange({ email: e.target.value })} required />
        </div>
        <div className="ps-field">
          <label>Phone / WhatsApp</label>
          <input type="tel" placeholder="+1 000 000 0000" value={data.phone} onChange={e => onChange({ phone: e.target.value })} />
        </div>
        <div className="ps-field">
          <label>Country</label>
          <input type="text" placeholder="Country" value={data.country} onChange={e => onChange({ country: e.target.value })} />
        </div>
      </div>
      <div className="ps-field" style={{ marginTop: "1rem" }}>
        <label>Additional message</label>
        <textarea className="ps-textarea" rows={3} placeholder="Urgency, compatibility, preferred brand, shipping requirements…" value={data.message} onChange={e => onChange({ message: e.target.value })} />
      </div>
    </div>
  );
}

/* ─── Step 3 — review ───────────────────────────────────────────── */
function Step3({ parts, form }: { parts: PartEntry[]; form: FormData }) {
  return (
    <div className="ps-s3">
      <div className="ps-review-block">
        <div className="ps-review-title">Parts Requested</div>
        <div className="ps-review-table-wrap">
          <table className="ps-table">
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
                  <td className="ps-table__name">{p.name || "—"}</td>
                  <td>{p.machine || "—"}</td>
                  <td>{p.quantity}</td>
                  <td className="ps-table__notes">{p.notes || "—"}</td>
                  <td>
                    <div className="ps-table__imgs">
                      {p.images.map((src, j) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={j} src={src} alt="" className="ps-table__img" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ps-review-block">
        <div className="ps-review-title">Your Details</div>
        <div className="ps-review-grid">
          {[["Name", form.name], ["Company", form.company], ["Email", form.email], ["Phone", form.phone], ["Country", form.country]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="ps-review-row">
              <span className="ps-review-key">{k}</span>
              <span className="ps-review-val">{v}</span>
            </div>
          ))}
        </div>
        {form.message && <div className="ps-review-msg">"{form.message}"</div>}
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
function PartsInquiryInner() {
  const [step, setStep] = useState(0);
  const [parts, setParts] = useState<PartEntry[]>([
    { name: "", machine: "", machineSlug: "", quantity: 1, notes: "", images: [], uploading: false },
  ]);
  const [form, setForm] = useState<FormData>({ name: "", company: "", email: "", phone: "", country: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  function addPart() {
    setParts(prev => [...prev, {
      name: "", machine: "", machineSlug: "",
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
    if (step === 0) return parts.some(p => p.name.trim());
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
          inquiryType: "parts",
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          country: form.country,
          message: form.message,
          parts: parts.filter(p => p.name.trim()).map(p => ({
            name: p.name,
            machine: p.machine,
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
    if (step === STEPS.length - 1) { submitInquiry(); return; }
    setStep(s => s + 1);
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .ps-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg); position: relative;
        }
        .ps-page::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
          background-size: 80px 80px; pointer-events: none;
        }
        .ps-body {
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding: clamp(2rem,4vw,4rem) clamp(1.5rem,4vw,3rem) clamp(4rem,7vw,7rem);
        }
        .ps-heading { margin-bottom: clamp(2rem,4vw,3rem); }
        .ps-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .ps-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
        .ps-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.4rem,5vw,4rem);
          line-height: .93; color: var(--text);
          letter-spacing: -.01em; margin: 0 0 .7rem;
        }
        .ps-h1 em { font-style: normal; color: var(--brand-teal); }
        .ps-sub {
          font-size: clamp(.85rem,1vw,.95rem);
          color: var(--text-muted); line-height: 1.7; max-width: 52ch;
        }
        .ps-steps { display: flex; align-items: center; gap: 0; margin-bottom: 2rem; overflow-x: auto; padding-bottom: .25rem; scrollbar-width: none; }
        .ps-steps::-webkit-scrollbar { display: none; }
        .ps-step { display: flex; align-items: center; gap: .6rem; flex-shrink: 0; }
        .ps-step__dot {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px solid var(--border); background: var(--card-bg);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-mono); font-size: .7rem; color: var(--text-muted); flex-shrink: 0;
        }
        .ps-step--active .ps-step__dot { border-color: var(--brand-teal); background: rgba(43,191,179,.15); color: var(--brand-teal); }
        .ps-step--done .ps-step__dot { border-color: var(--brand-teal); background: var(--brand-teal); }
        .ps-step__label { font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
        .ps-step--active .ps-step__label { color: var(--text); }
        .ps-step--done .ps-step__label { color: var(--text-secondary); }
        .ps-step__line { width: 2.5rem; height: 1px; background: var(--border); flex-shrink: 0; margin: 0 .5rem; }
        .ps-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 1.25rem; padding: clamp(1.5rem,3vw,2.5rem); margin-bottom: 1.5rem;
        }
        .ps-hint { font-size: .9rem; color: var(--text-muted); line-height: 1.6; margin: 0 0 1.5rem; }
        .ps-part {
          border: 1px solid var(--border); border-radius: 1rem;
          background: var(--surface); padding: 1.5rem; margin-bottom: 1.25rem;
        }
        .ps-part__head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem; padding-bottom: .75rem; border-bottom: 1px solid var(--border);
        }
        .ps-part__num { font-family: var(--ff-mono); font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: var(--brand-teal); }
        .ps-part__remove { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: .25rem; }
        .ps-part__remove:hover { color: #ef4444; }
        .ps-fields { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end; }
        .ps-field--wide { grid-column: 1 / -1; }
        @media(max-width:700px){ .ps-fields{ grid-template-columns: 1fr; } .ps-field--wide{ grid-column: auto; } }
        .ps-field { display: flex; flex-direction: column; gap: .35rem; }
        .ps-field label { font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--text-muted); }
        .ps-field input, .ps-field select {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: .5rem; color: var(--text); padding: .65rem .9rem;
          font-family: var(--ff-body); font-size: .9rem; outline: none; width: 100%;
        }
        .ps-field select { cursor: pointer; }
        .ps-field input::placeholder { color: var(--text-secondary); }
        .ps-field input:focus, .ps-field select:focus { border-color: var(--brand-teal); }
        .ps-textarea {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: .5rem; color: var(--text); padding: .65rem .9rem; width: 100%;
          font-family: var(--ff-body); font-size: .88rem; resize: vertical; outline: none;
        }
        .ps-textarea::placeholder { color: var(--text-secondary); }
        .ps-textarea:focus { border-color: var(--brand-teal); }
        .ps-qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: .5rem; overflow: hidden; }
        .ps-qty__btn { width: 34px; height: 34px; background: var(--card-bg); color: var(--text-secondary); font-size: 1rem; border: none; cursor: pointer; }
        .ps-qty__btn:hover { background: rgba(43,191,179,.12); color: var(--brand-teal); }
        .ps-qty__val { min-width: 36px; text-align: center; font-family: var(--ff-mono); font-size: .82rem; color: var(--text); background: var(--surface); line-height: 34px; }
        .ps-part__images { margin-top: 1rem; }
        .ps-part__imgs-label {
          display: flex; align-items: center; gap: .4rem;
          font-family: var(--ff-mono); font-size: .63rem; letter-spacing: .1em;
          text-transform: uppercase; color: var(--text-secondary); margin-bottom: .5rem;
        }
        .ps-part__imgs-row { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
        .ps-part__thumb { position: relative; width: 64px; height: 64px; border-radius: .5rem; overflow: hidden; border: 1px solid var(--border); }
        .ps-part__thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ps-part__thumb-x {
          position: absolute; top: 2px; right: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(0,0,0,.6); border: none;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .ps-part__add-img {
          display: flex; align-items: center; gap: .35rem;
          padding: .45rem .85rem; border-radius: .5rem;
          border: 1px dashed var(--border); background: var(--card-bg);
          font-family: var(--ff-mono); font-size: .62rem; letter-spacing: .08em;
          text-transform: uppercase; color: var(--text-secondary); cursor: pointer;
        }
        .ps-part__add-img:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
        .ps-part__add-img:disabled { opacity: .5; cursor: default; }
        .ps-spinner {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid var(--border); border-top-color: var(--brand-teal);
          animation: ps-spin .6s linear infinite;
        }
        @keyframes ps-spin { to { transform: rotate(360deg); } }
        .ps-add {
          display: flex; align-items: center; gap: .5rem;
          padding: .85rem 1.5rem; border-radius: .75rem;
          border: 1px dashed var(--brand-teal); background: rgba(43,191,179,.06);
          font-family: var(--ff-mono); font-size: .7rem; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brand-teal); cursor: pointer;
          width: 100%; justify-content: center;
        }
        .ps-add:hover { background: rgba(43,191,179,.12); }
        .ps-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media(max-width:600px){ .ps-grid2{ grid-template-columns:1fr; } }
        .ps-review-block { background: var(--card-bg); border: 1px solid var(--border); border-radius: .875rem; padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
        .ps-review-title { font-family: var(--ff-mono); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; color: var(--brand-teal); margin-bottom: 1rem; }
        .ps-review-table-wrap { overflow-x: auto; }
        .ps-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .ps-table th {
          text-align: left; padding: .5rem .75rem;
          font-family: var(--ff-mono); font-size: .6rem; letter-spacing: .12em;
          text-transform: uppercase; color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .ps-table td { padding: .6rem .75rem; font-size: .85rem; color: var(--text); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .ps-table tr:last-child td { border-bottom: none; }
        .ps-table__name { font-weight: 600; }
        .ps-table__notes { font-size: .8rem; color: var(--text-secondary); font-style: italic; max-width: 180px; }
        .ps-table__imgs { display: flex; gap: .3rem; flex-wrap: wrap; }
        .ps-table__img { width: 32px; height: 32px; border-radius: .3rem; object-fit: cover; }
        .ps-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem 2rem; }
        .ps-review-row { display: flex; flex-direction: column; gap: .15rem; }
        .ps-review-key { font-family: var(--ff-mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-secondary); }
        .ps-review-val { font-size: .9rem; color: var(--text); }
        .ps-review-msg { margin-top: .75rem; font-size: .85rem; color: var(--text-secondary); font-style: italic; }
        .ps-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 2rem; }
        .ps-back {
          display: flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .1em;
          text-transform: uppercase; color: var(--text-muted); cursor: pointer;
          background: none; border: none;
        }
        .ps-back:hover { color: var(--text); }
        .ps-success { text-align: center; padding: clamp(3rem,6vw,6rem) 2rem; }
        .ps-success__icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(43,191,179,.12); border: 1.5px solid rgba(43,191,179,.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.75rem;
        }
        .ps-success__title { font-family: var(--ff-display); font-size: clamp(2rem,4vw,3rem); color: var(--text); margin: 0 0 1rem; line-height: .95; }
        .ps-success__sub { color: var(--text-muted); font-size: .95rem; line-height: 1.7; max-width: 40ch; margin: 0 auto; }
        .ps-error { margin-top: 1rem; padding: .75rem 1rem; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); border-radius: .5rem; color: #fca5a5; font-size: .88rem; }
      `}</style>

      <div className="ps-page">
        <div className="ps-body">
          <div className="ps-heading">
            <div className="ps-eyebrow">Part Inquiry</div>
            <h1 className="ps-h1">
              Need a <em>spare part?</em>
            </h1>
            <p className="ps-sub">
              Tell us exactly what you need — add reference images and our engineers will identify and source the right components for you.
            </p>
          </div>

          {sent ? (
            <div className="ps-card">
              <div className="ps-success">
                <div className="ps-success__icon">
                  <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                    <path d="M2 12l8 8L26 2" stroke="var(--brand-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="ps-success__title">Parts inquiry sent.</h2>
                <p className="ps-success__sub">
                  Thank you, {form.name || "there"}. Our team will review your parts list and reply to {form.email || "you"} within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />
              <div className="ps-card">
                {step === 0 && <Step1 parts={parts} onAdd={addPart} onRemove={removePart} onUpdate={updatePart} />}
                {step === 1 && <Step2 data={form} onChange={p => setForm(f => ({ ...f, ...p }))} />}
                {step === 2 && <Step3 parts={parts} form={form} />}
              </div>

              {sendError && <div className="ps-error" role="alert">{sendError}</div>}

              <div className="ps-nav">
                {step > 0
                  ? <button className="ps-back" onClick={() => setStep(s => s - 1)} disabled={sending}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Back
                    </button>
                  : <TransitionLink href="/inquiries">
                      <span className="ps-back">
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
                      : step === STEPS.length - 1 ? "Send inquiry →" : "Continue →"}
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

export default function PartsInquiryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <PartsInquiryInner />
    </Suspense>
  );
}
