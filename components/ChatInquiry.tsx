"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { ProductFamily } from "@/lib/products";
import { familyImage } from "@/lib/products";

/** Extracts a numeric magnitude from a spec value string (e.g. "2,100 mm"
 *  -> 2100) so it can be drawn as a bar. Non-numeric values (e.g. bag
 *  types text) fall back to a 0-width bar — the row still shows the raw
 *  value as text, it just skips the bar fill. */
function specMagnitude(v: string): number {
  const m = v.replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

/* ─── shared building blocks for the 3 "feels like messaging" inquiry
   flows (talk-to-engineer, direct, parts). A bot bubble asks one thing
   at a time; the visitor's choice/input renders back as their own
   bubble before the next question appears. ─────────────────────── */

export interface Turn {
  id: string;
  from: "bot" | "user";
  content: ReactNode;
}

export function ChatThread({ turns, typing }: { turns: Turn[]; typing?: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, typing]);

  return (
    <div className="ci-thread">
      {turns.map(t => (
        <div key={t.id} className={`ci-turn ci-turn--${t.from}`}>
          {t.from === "bot" && <span className="ci-avatar">AI</span>}
          <div className="ci-bubble">{t.content}</div>
        </div>
      ))}
      {typing && (
        <div className="ci-turn ci-turn--bot">
          <span className="ci-avatar">AI</span>
          <div className="ci-bubble ci-bubble--typing">
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

/** Row of pickable chips/cards rendered inside a bot bubble as the answer widget. */
export function ChoiceRow({ children }: { children: ReactNode }) {
  return <div className="ci-choices">{children}</div>;
}

export function ChoiceChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`ci-chip${active ? " ci-chip--on" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

/** The composer bar pinned at the bottom — holds whatever input widget
 *  answers the current question, plus the advance button. */
export function Composer({ children, onSend, sendLabel = "Send", disabled }: {
  children: ReactNode;
  onSend: () => void;
  sendLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="ci-composer">
      <div className="ci-composer__field">{children}</div>
      <button type="button" className="ci-composer__send" disabled={disabled} onClick={onSend} aria-label={sendLabel}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 9h13m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** Tip shown in the side panel, keyed to the current question so it always
 *  reads as relevant to what the visitor is doing right now. */
export interface Tip {
  text: ReactNode;
}

/* ─── editable review card ──────────────────────────────────────────
   The final step before send: every answer the visitor gave renders as
   a row they can click to edit right there, instead of a plain summary
   they'd have to scroll back up to change. ──────────────────────── */

export interface ReviewRow {
  key: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind?: "text" | "textarea";
  placeholder?: string;
}

function ReviewField({ row }: { row: ReviewRow }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.value);

  useEffect(() => { setDraft(row.value); }, [row.value]);

  function commit() {
    row.onChange(draft.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="ci-review-row ci-review-row--editing">
        <span className="ci-review-row__label">{row.label}</span>
        {row.kind === "textarea" ? (
          <textarea
            className="ci-review-row__input"
            rows={2}
            autoFocus
            value={draft}
            placeholder={row.placeholder}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); } }}
          />
        ) : (
          <input
            className="ci-review-row__input"
            autoFocus
            value={draft}
            placeholder={row.placeholder}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === "Enter") commit(); }}
          />
        )}
      </div>
    );
  }

  return (
    <button type="button" className="ci-review-row" onClick={() => setEditing(true)}>
      <span className="ci-review-row__label">{row.label}</span>
      <span className="ci-review-row__value">{row.value || <em>Not set — click to add</em>}</span>
      <svg className="ci-review-row__edit" width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M8.5 1.5l3 3-7 7-3.5 1 1-3.5 6.5-6.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** A row of attached photos with per-image remove and an "add more" tile.
 *  Used for the general "attach photos" step available on all 3 forms. */
export function ImageGallery({
  images, onRemove, onAdd, uploading,
}: {
  images: string[];
  onRemove: (i: number) => void;
  onAdd: () => void;
  uploading?: boolean;
}) {
  return (
    <div className="ci-gallery">
      {images.map((src, i) => (
        <div key={i} className="ci-gallery__item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" />
          <button type="button" className="ci-gallery__remove" onClick={() => onRemove(i)} aria-label="Remove photo">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6m0-6l-6 6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
        </div>
      ))}
      <button type="button" className="ci-gallery__add" onClick={onAdd} disabled={uploading}>
        {uploading ? <span className="ci-gallery__spinner" /> : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        )}
      </button>
    </div>
  );
}

export function ReviewCard({
  title, rows, images, onRemoveImage, onAddImage, uploading, onSend, sending,
}: {
  title: ReactNode;
  rows: ReviewRow[];
  images?: string[];
  onRemoveImage?: (i: number) => void;
  onAddImage?: () => void;
  uploading?: boolean;
  onSend: () => void;
  sending?: boolean;
}) {
  return (
    <div className="ci-review-card">
      <div className="ci-review-card__title">{title}</div>
      <div className="ci-review-card__rows">
        {rows.map(r => <ReviewField key={r.key} row={r} />)}
      </div>
      {(images !== undefined && onRemoveImage && onAddImage) && (
        <div className="ci-review-card__images">
          <span className="ci-review-row__label">Photos</span>
          <ImageGallery images={images} onRemove={onRemoveImage} onAdd={onAddImage} uploading={uploading} />
        </div>
      )}
      <button type="button" className="ci-review-card__send" onClick={onSend} disabled={sending}>
        {sending ? "Sending…" : "Send inquiry →"}
      </button>
    </div>
  );
}

/** Live side panel — updates as the visitor picks a machine/model: photo,
 *  top specs for that model, a contextual tip, and related machines to
 *  cross-sell. Renders an empty placeholder before any machine is picked. */
export function InsightPanel({
  family, modelIdx = 0, tip, related = [],
}: {
  family: ProductFamily | null;
  modelIdx?: number;
  tip?: Tip;
  related?: ProductFamily[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (!family) {
    return (
      <aside className="ci-insight ci-insight--empty">
        <span className="ci-insight__scan" aria-hidden="true" />
        <div className="ci-insight__empty">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.4" />
            <path d="M18 12v7l5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Pick a machine in the chat and its live spec readout will appear here.</p>
        </div>
      </aside>
    );
  }

  const allSpecs = family.specs
    .map(s => ({ label: s.label, value: s.values[modelIdx] ?? s.values[0], mag: specMagnitude(s.values[modelIdx] ?? s.values[0]) }))
    .filter(s => s.value);
  const maxMag = Math.max(1, ...allSpecs.map(s => s.mag));
  const visibleSpecs = expanded ? allSpecs : allSpecs.slice(0, 6);

  return (
    <aside className="ci-insight">
      <div className="ci-insight__img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={familyImage(family)} alt={family.name} className="ci-insight__img" />
        <span className="ci-insight__live"><span className="ci-insight__live-dot" />Live spec readout</span>
      </div>
      <div className="ci-insight__series">{family.series}</div>
      <div className="ci-insight__name">{family.name}</div>

      {visibleSpecs.length > 0 && (
        <>
          <div className="ci-insight__specs">
            {visibleSpecs.map(s => (
              <div key={s.label} className="ci-insight__spec">
                <div className="ci-insight__spec-top">
                  <span className="ci-insight__spec-label">{s.label}</span>
                  <span className="ci-insight__spec-val">{s.value}</span>
                </div>
                {s.mag > 0 && (
                  <div className="ci-insight__spec-track">
                    <span className="ci-insight__spec-fill" style={{ transform: `scaleX(${Math.max(0.06, s.mag / maxMag)})` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {allSpecs.length > 6 && (
            <button type="button" className="ci-insight__more" onClick={() => setExpanded(v => !v)}>
              {expanded ? "Show fewer specs" : `Show all ${allSpecs.length} specs`}
            </button>
          )}
        </>
      )}

      {tip && (
        <div className="ci-tip">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5a4.5 4.5 0 00-2.5 8.25c.35.25.5.6.5 1v.25a1 1 0 001 1h2a1 1 0 001-1v-.25c0-.4.15-.75.5-1A4.5 4.5 0 008 1.5z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6.5 14.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p>{tip.text}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="ci-related">
          <span className="ci-related__label">Related machines</span>
          {related.slice(0, 3).map(r => (
            <Link key={r.slug} href={`/products/${r.category}/${r.slug}`} className="ci-related__row" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={familyImage(r)} alt="" className="ci-related__img" />
              <span className="ci-related__name">{r.name}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}

export const chatStyles = `
  .ci-page {
    min-height: 100vh; padding-top: 100px;
    background: var(--bg-base); position: relative;
  }
  .ci-page::before {
    content: ""; position: absolute; inset: 0; z-index: 0;
    background:
      linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
    background-size: 80px 80px; pointer-events: none;
  }
  .ci-shell {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto;
    padding: 0 clamp(1.25rem, 3vw, 2rem) clamp(2rem, 4vw, 3rem);
    display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .ci-shell { grid-template-columns: 1fr; }
  }

  .ci-heading { margin-bottom: 1.25rem; }
  .ci-eyebrow {
    display: inline-flex; align-items: center; gap: .6rem;
    font-family: var(--ff-mono); font-size: .65rem;
    letter-spacing: .22em; text-transform: uppercase;
    color: var(--brand-teal); margin-bottom: .75rem;
  }
  .ci-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
  .ci-h1 {
    font-family: var(--ff-display);
    font-size: clamp(2.1rem, 4.4vw, 3.2rem);
    line-height: .95; color: var(--ink);
    letter-spacing: -.01em; margin: 0;
  }
  .ci-h1 em { font-style: normal; color: var(--brand-teal); }
  .ci-back {
    display: inline-flex; align-items: center; gap: .5rem;
    font-family: var(--ff-mono); font-size: .68rem;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--ink-35); text-decoration: none; margin-bottom: 1rem;
    background: none; border: none; cursor: pointer;
  }
  .ci-back:hover { color: var(--ink); }

  /* conversation panel */
  .ci-convo {
    background: var(--bg-surface);
    border: 1px solid var(--bg-line);
    border-radius: 1.25rem;
    display: flex; flex-direction: column;
    height: min(72vh, 780px);
    overflow: hidden;
  }
  .ci-thread {
    flex: 1; overflow-y: auto;
    padding: clamp(1.25rem, 2.5vw, 2rem);
    display: flex; flex-direction: column; gap: 1rem;
  }
  .ci-turn { display: flex; gap: .65rem; align-items: flex-start; max-width: 100%; }
  .ci-turn--user { flex-direction: row-reverse; }
  .ci-avatar {
    flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%;
    background: rgba(43,191,179,.14); border: 1px solid rgba(43,191,179,.3);
    color: var(--brand-teal);
    font-family: var(--ff-mono); font-size: .6rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .ci-bubble {
    background: var(--bg-raise);
    border: 1px solid var(--bg-line);
    border-radius: 1rem 1rem 1rem .25rem;
    padding: .85rem 1.1rem;
    font-size: .92rem; color: var(--ink); line-height: 1.55;
    max-width: min(100%, 560px);
  }
  .ci-turn--user .ci-bubble {
    background: var(--brand-teal); color: #04211e; border-color: var(--brand-teal);
    border-radius: 1rem 1rem .25rem 1rem;
  }
  .ci-bubble--typing { display: flex; gap: .3rem; padding: 1rem 1.1rem; }
  .ci-bubble--typing span {
    width: 6px; height: 6px; border-radius: 50%; background: var(--ink-35);
    animation: ci-bounce 1.1s ease-in-out infinite;
  }
  .ci-bubble--typing span:nth-child(2) { animation-delay: .15s; }
  .ci-bubble--typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes ci-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }

  /* answer widgets, shown inline in the latest bot bubble */
  .ci-choices { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .75rem; }
  .ci-chip {
    display: flex; align-items: center; gap: .55rem;
    padding: .55rem .9rem; border-radius: .7rem;
    border: 1px solid var(--bg-line); background: var(--bg-surface);
    font-family: var(--ff-body); font-size: .85rem; color: var(--ink);
    cursor: pointer; transition: border-color .15s, background .15s;
  }
  .ci-chip:hover { border-color: var(--brand-teal); }
  .ci-chip--on { border-color: var(--brand-teal); background: rgba(43,191,179,.12); color: var(--brand-teal); font-weight: 600; }
  .ci-chip img { width: 32px; height: 32px; object-fit: contain; border-radius: .4rem; flex-shrink: 0; }

  .ci-machine-search {
    display: flex; align-items: center; gap: .5rem;
    margin-top: .85rem; padding: .55rem .8rem;
    background: var(--bg-raise); border: 1px solid var(--bg-line);
    border-radius: .7rem; color: var(--ink-35);
  }
  .ci-machine-search input {
    flex: 1; border: none; background: none; outline: none;
    color: var(--ink); font-family: var(--ff-body); font-size: .85rem; padding: 0;
  }
  .ci-machine-search input::placeholder { color: var(--ink-35); }

  /* composer */
  .ci-composer {
    display: flex; align-items: flex-end; gap: .6rem;
    padding: 1rem clamp(1.25rem, 2.5vw, 2rem);
    border-top: 1px solid var(--bg-line);
    background: var(--bg-surface);
  }
  .ci-composer__field { flex: 1; min-width: 0; }
  .ci-composer input, .ci-composer textarea, .ci-composer select {
    width: 100%; background: var(--bg-raise); border: 1px solid var(--bg-line);
    border-radius: .7rem; color: var(--ink); padding: .7rem .9rem;
    font-family: var(--ff-body); font-size: .9rem; outline: none;
  }
  .ci-composer input:focus, .ci-composer textarea:focus, .ci-composer select:focus { border-color: var(--brand-teal); }
  .ci-composer textarea { resize: none; }
  .ci-composer__grid { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
  @media (max-width: 520px) { .ci-composer__grid { grid-template-columns: 1fr; } }
  .ci-composer__send {
    flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
    background: var(--brand-teal); color: #04211e; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform .15s, background .15s;
  }
  .ci-composer__send:hover:not(:disabled) { background: var(--brand-teal-dk); transform: scale(1.05); }
  .ci-composer__send:disabled { opacity: .35; cursor: default; }

  .ci-qty { display: inline-flex; align-items: center; border: 1px solid var(--bg-line); border-radius: .7rem; overflow: hidden; background: var(--bg-raise); }
  .ci-qty__btn { width: 40px; height: 40px; background: none; border: none; color: var(--ink-60); font-size: 1.1rem; cursor: pointer; }
  .ci-qty__btn:hover { background: rgba(43,191,179,.12); color: var(--brand-teal); }
  .ci-qty__val { min-width: 44px; text-align: center; font-family: var(--ff-mono); font-size: .9rem; color: var(--ink); }

  /* insight side panel — a live "diagnostics readout" feel: corner
     brackets, a scanning sweep, animated spec bars instead of plain
     rows, all built from the site's existing teal/industrial palette
     rather than a generic sci-fi neon look. */
  .ci-insight {
    position: sticky; top: 116px;
    background: var(--bg-surface); border: 1px solid var(--bg-line);
    border-radius: 1.25rem; padding: 1.5rem;
    overflow: hidden;
  }
  .ci-insight::before, .ci-insight::after {
    content: ""; position: absolute; width: 14px; height: 14px;
    border-color: var(--brand-teal); opacity: .5; pointer-events: none;
  }
  .ci-insight::before { top: 10px; left: 10px; border-top: 1.5px solid; border-left: 1.5px solid; }
  .ci-insight::after { bottom: 10px; right: 10px; border-bottom: 1.5px solid; border-right: 1.5px solid; }
  .ci-insight--empty { min-height: 260px; display: flex; align-items: center; }
  .ci-insight__scan {
    position: absolute; left: 0; right: 0; height: 40%;
    background: linear-gradient(to bottom, transparent, rgba(43,191,179,.06), transparent);
    animation: ci-scan 3.2s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes ci-scan { 0% { top: -40%; } 100% { top: 100%; } }
  .ci-insight__empty {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: .75rem; padding: 2rem 1rem; color: var(--ink-35); width: 100%;
  }
  .ci-insight__empty svg { color: var(--brand-teal); opacity: .6; }
  .ci-insight__empty p { font-size: .85rem; line-height: 1.6; margin: 0; }
  .ci-insight__img-wrap {
    position: relative;
    width: 100%; aspect-ratio: 4/3; border-radius: .875rem; overflow: hidden;
    background: var(--bg-raise); margin-bottom: 1rem;
  }
  .ci-insight__img { width: 100%; height: 100%; object-fit: cover; }
  .ci-insight__live {
    position: absolute; left: .6rem; bottom: .6rem; z-index: 1;
    display: inline-flex; align-items: center; gap: .4rem;
    font-family: var(--ff-mono); font-size: .58rem; letter-spacing: .1em; text-transform: uppercase;
    color: #fff; background: rgba(4,10,10,.6); backdrop-filter: blur(4px);
    padding: .3rem .55rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.15);
  }
  .ci-insight__live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--brand-teal);
    animation: ci-pulse 1.6s ease-in-out infinite;
    box-shadow: 0 0 0 0 rgba(43,191,179,.6);
  }
  @keyframes ci-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(43,191,179,.5); }
    50% { opacity: .6; box-shadow: 0 0 0 4px rgba(43,191,179,0); }
  }
  .ci-insight__series {
    font-family: var(--ff-mono); font-size: .62rem; letter-spacing: .16em;
    text-transform: uppercase; color: var(--brand-teal); margin-bottom: .3rem;
  }
  .ci-insight__name {
    font-family: var(--ff-display); font-size: 1.3rem; color: var(--ink);
    line-height: 1.1; margin-bottom: 1rem;
  }
  .ci-insight__specs { display: flex; flex-direction: column; gap: .8rem; margin-bottom: .85rem; }
  .ci-insight__spec { display: flex; flex-direction: column; gap: .3rem; }
  .ci-insight__spec-top { display: flex; justify-content: space-between; gap: 1rem; }
  .ci-insight__spec-label { font-size: .76rem; color: var(--ink-60); }
  .ci-insight__spec-val { font-family: var(--ff-mono); font-size: .76rem; color: var(--ink); font-weight: 600; text-align: right; white-space: nowrap; }
  .ci-insight__spec-track {
    height: 4px; border-radius: 999px; background: var(--bg-line); overflow: hidden;
  }
  .ci-insight__spec-fill {
    display: block; height: 100%; width: 100%; border-radius: 999px;
    background: linear-gradient(90deg, var(--brand-teal-dk), var(--brand-teal));
    transform-origin: left center;
    transition: transform .6s cubic-bezier(0.16,1,0.3,1);
  }
  .ci-insight__more {
    display: block; width: 100%; text-align: center;
    font-family: var(--ff-mono); font-size: .64rem; letter-spacing: .1em; text-transform: uppercase;
    color: var(--brand-teal); background: none; border: 1px dashed rgba(43,191,179,.35);
    border-radius: .6rem; padding: .5rem; cursor: pointer; margin-bottom: 1.25rem;
    transition: background .15s, border-color .15s;
  }
  .ci-insight__more:hover { background: rgba(43,191,179,.08); border-color: var(--brand-teal); }
  .ci-tip {
    display: flex; gap: .65rem; align-items: flex-start;
    background: rgba(43,191,179,.07); border: 1px solid rgba(43,191,179,.18);
    border-radius: .875rem; padding: .85rem 1rem;
  }
  .ci-tip svg { flex-shrink: 0; color: var(--brand-teal); margin-top: .1rem; }
  .ci-tip p { margin: 0; font-size: .8rem; line-height: 1.6; color: var(--ink-60); }
  .ci-tip strong { color: var(--ink); }
  .ci-related { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--bg-line); }
  .ci-related__label {
    font-family: var(--ff-mono); font-size: .62rem; letter-spacing: .14em;
    text-transform: uppercase; color: var(--ink-35); margin-bottom: .75rem; display: block;
  }
  .ci-related__row {
    display: flex; align-items: center; gap: .65rem;
    padding: .5rem; border-radius: .65rem; margin: 0 -.5rem;
    text-decoration: none; transition: background .15s;
  }
  .ci-related__row:hover { background: var(--bg-raise); }
  .ci-related__img { width: 40px; height: 40px; object-fit: contain; border-radius: .4rem; background: var(--bg-raise); flex-shrink: 0; }
  .ci-related__name { font-size: .8rem; color: var(--ink); line-height: 1.3; }

  /* success state */
  .ci-success { text-align: center; padding: clamp(3rem,6vw,5rem) 2rem; }
  .ci-success__icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(43,191,179,.12); border: 1.5px solid rgba(43,191,179,.3);
    display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;
  }
  .ci-success__title { font-family: var(--ff-display); font-size: clamp(1.8rem,3.6vw,2.6rem); color: var(--ink); margin: 0 0 .85rem; line-height: .98; }
  .ci-success__sub { color: var(--ink-60); font-size: .92rem; line-height: 1.7; max-width: 40ch; margin: 0 auto; }
  .ci-error {
    margin: 0 clamp(1.25rem, 2.5vw, 2rem) 1rem; padding: .75rem 1rem;
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
    border-radius: .6rem; color: #fca5a5; font-size: .85rem;
  }

  /* editable review card */
  .ci-review-card {
    margin: 0 clamp(1.25rem, 2.5vw, 2rem) 1.25rem;
    background: var(--bg-raise); border: 1px solid var(--bg-line);
    border-radius: 1rem; padding: 1.25rem;
  }
  .ci-review-card__title {
    font-size: .88rem; color: var(--ink); line-height: 1.5; margin-bottom: 1rem;
  }
  .ci-review-card__rows { display: flex; flex-direction: column; gap: .4rem; }
  .ci-review-row {
    display: flex; align-items: flex-start; gap: .75rem;
    width: 100%; text-align: left; background: none; border: none;
    border-radius: .6rem; padding: .55rem .6rem; cursor: pointer;
    transition: background .15s;
  }
  .ci-review-row:hover { background: var(--bg-surface); }
  .ci-review-row:hover .ci-review-row__edit { opacity: 1; }
  .ci-review-row__label {
    flex: 0 0 110px; font-family: var(--ff-mono); font-size: .64rem;
    letter-spacing: .08em; text-transform: uppercase; color: var(--ink-35);
    padding-top: .15rem;
  }
  .ci-review-row__value { flex: 1; font-size: .85rem; color: var(--ink); line-height: 1.5; word-break: break-word; }
  .ci-review-row__value em { color: var(--ink-35); font-style: normal; }
  .ci-review-row__edit { flex-shrink: 0; color: var(--ink-35); opacity: 0; transition: opacity .15s; margin-top: .2rem; }
  .ci-review-row--editing {
    display: flex; align-items: flex-start; gap: .75rem;
    padding: .4rem .6rem; cursor: default;
  }
  .ci-review-row__input {
    flex: 1; background: var(--bg-surface); border: 1px solid var(--brand-teal);
    border-radius: .5rem; color: var(--ink); padding: .5rem .65rem;
    font-family: var(--ff-body); font-size: .85rem; outline: none; resize: none;
  }
  .ci-review-card__images { margin-top: .85rem; padding-top: .85rem; border-top: 1px solid var(--bg-line); }
  .ci-review-card__images .ci-review-row__label { padding: 0 0 .5rem; display: block; }
  .ci-review-card__send {
    width: 100%; margin-top: 1.1rem; padding: .8rem; border-radius: .7rem;
    border: none; background: var(--brand-teal); color: #04211e;
    font-family: var(--ff-display); font-size: .95rem; letter-spacing: .02em;
    cursor: pointer; transition: background .15s;
  }
  .ci-review-card__send:hover:not(:disabled) { background: var(--brand-teal-dk); }
  .ci-review-card__send:disabled { opacity: .5; cursor: default; }

  /* photo gallery — used both inline in the composer and in the review card */
  .ci-gallery { display: flex; flex-wrap: wrap; gap: .5rem; }
  .ci-gallery__item {
    position: relative; width: 56px; height: 56px; border-radius: .5rem;
    overflow: hidden; border: 1px solid var(--bg-line); flex-shrink: 0;
  }
  .ci-gallery__item img { width: 100%; height: 100%; object-fit: cover; }
  .ci-gallery__remove {
    position: absolute; top: 1px; right: 1px; width: 16px; height: 16px;
    border-radius: 50%; background: rgba(0,0,0,.65); border: none;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .ci-gallery__add {
    width: 56px; height: 56px; border-radius: .5rem; flex-shrink: 0;
    border: 1px dashed var(--bg-line); background: var(--bg-surface);
    color: var(--ink-35); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color .15s, color .15s;
  }
  .ci-gallery__add:hover:not(:disabled) { border-color: var(--brand-teal); color: var(--brand-teal); }
  .ci-gallery__add:disabled { opacity: .5; cursor: default; }
  .ci-gallery__spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid var(--bg-line); border-top-color: var(--brand-teal);
    animation: ci-spin .6s linear infinite;
  }
  @keyframes ci-spin { to { transform: rotate(360deg); } }
`;
