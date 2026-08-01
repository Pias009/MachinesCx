"use client";
import { useEffect, useState, useCallback } from "react";
import { Camera, Star, X, Plus, CheckCircle2, Package, Loader2 } from "lucide-react";
import type { Field, Collection, SectionSchema } from "@/lib/cmsSchemas";
import { CATEGORY_ICON as SHARED_CATEGORY_ICON } from "./adminIcons";

type Json = Record<string, unknown>;
type Item = Record<string, unknown>;

// ── shared styles ──────────────────────────────────────────
const label: React.CSSProperties = {
  fontFamily: "var(--ff-body)", fontSize: "0.92rem", fontWeight: 600,
  color: "rgba(255,255,255,0.85)",
};
const hintStyle: React.CSSProperties = {
  fontFamily: "var(--ff-body)", fontSize: "0.82rem", fontWeight: 400,
  color: "rgba(255,255,255,0.4)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 0.95rem", borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontFamily: "var(--ff-body)", fontSize: "0.98rem",
  outline: "none",
};
const btnBase: React.CSSProperties = {
  padding: "0.6rem 1rem", borderRadius: 8,
  border: "none", cursor: "pointer",
  fontFamily: "var(--ff-body)", fontSize: "0.88rem", fontWeight: 600,
  display: "inline-flex", alignItems: "center", gap: "0.4rem",
};
const smallBtn: React.CSSProperties = {
  ...btnBase,
  background: "rgba(43,191,179,0.14)", color: "var(--brand-teal)",
};
const dangerBtn: React.CSSProperties = {
  ...btnBase, padding: "0.6rem 0.85rem",
  background: "rgba(255,107,125,0.14)", color: "#ff8a97",
};
const iconBtn: React.CSSProperties = {
  ...btnBase, padding: "0.5rem 0.7rem",
  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
};

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <span style={{ ...label, display: "block" }}>{children}</span>
      {hint && <span style={{ ...hintStyle, display: "block", marginTop: "0.15rem" }}>{hint}</span>}
    </div>
  );
}

// ── image field with local upload ──────────────────────────
function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "upload failed");
      onChange(j.path);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{
            width: 72, height: 72, objectFit: "contain", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: 6, flexShrink: 0,
          }} />
        )}
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder="/uploads/…" />
          <label style={{ ...smallBtn, cursor: busy ? "wait" : "pointer", alignSelf: "flex-start" }}>
            {busy ? <Loader2 size={14} className="adm-spin-icon" /> : <Camera size={14} />} {busy ? "Uploading…" : "Upload a photo"}
            <input type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          </label>
        </div>
      </div>
      {err && <div style={{ ...hintStyle, color: "#ff8a97", marginTop: "0.4rem" }}>{err}</div>}
    </div>
  );
}

// ── unlimited photo gallery — upload as many as you like, first = primary ──
function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "upload failed");
    return j.path as string;
  }

  async function uploadMany(files: FileList) {
    setBusy(true); setErr("");
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) paths.push(await uploadOne(file));
      onChange([...value, ...paths]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  function makePrimary(i: number) {
    if (i === 0) return;
    const next = [...value];
    const [pick] = next.splice(i, 1);
    next.unshift(pick);
    onChange(next);
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
        {value.map((src, i) => (
          <div key={i} style={{ position: "relative" }}>
            <div style={{
              aspectRatio: "1", borderRadius: 12, overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              border: i === 0 ? "2px solid var(--brand-teal)" : "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
            </div>
            {i === 0 && (
              <span style={{
                position: "absolute", top: 6, left: 6, borderRadius: 6,
                background: "var(--brand-teal)", color: "#04211e",
                fontFamily: "var(--ff-body)", fontSize: "0.65rem", fontWeight: 700,
                padding: "0.15rem 0.4rem",
              }}>Main photo</span>
            )}
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.4rem" }}>
              {i !== 0 && (
                <button type="button" title="Set as main photo" style={{ ...iconBtn, flex: 1, padding: "0.35rem", fontSize: "0.75rem" }}
                  onClick={() => makePrimary(i)}><Star size={12} /> Set main</button>
              )}
              <button type="button" title="Remove photo" style={{ ...dangerBtn, padding: "0.35rem", fontSize: "0.75rem" }}
                onClick={() => remove(i)}><X size={13} /></button>
            </div>
          </div>
        ))}

        <label style={{
          aspectRatio: "1", borderRadius: 12, cursor: busy ? "wait" : "pointer",
          border: "2px dashed rgba(255,255,255,0.2)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem",
          color: "rgba(255,255,255,0.55)", fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 600,
        }}>
          <Plus size={22} />
          {busy ? "Uploading…" : "Add photos"}
          <input type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => { if (e.target.files?.length) uploadMany(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {err && <div style={{ ...hintStyle, color: "#ff8a97", marginTop: "0.6rem" }}>{err}</div>}
    </div>
  );
}

// ── {title, detail, image}[] editor — shared by the top-level "steps"
// field kind and the per-part install-guide editor nested inside "parts" ──
type Step = { title: string; detail: string; image?: string };
function StepsEditor({ value, onChange }: { value: Step[]; onChange: (v: Step[]) => void }) {
  const rows = value ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "var(--brand-teal)", color: "#04211e",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700,
            }}>{i + 1}</span>
            <input style={{ ...inputStyle, flex: 1 }} value={r.title} placeholder="Step title"
              onChange={e => { const n = rows.map(x => ({ ...x })); n[i].title = e.target.value; onChange(n); }} />
            <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
          </div>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={r.detail} placeholder="What happens in this step"
            onChange={e => { const n = rows.map(x => ({ ...x })); n[i].detail = e.target.value; onChange(n); }} />
          <div>
            <span style={{ ...hintStyle, display: "block", marginBottom: "0.35rem" }}>Step photo or diagram (shown on the product page)</span>
            <ImageField value={r.image ?? ""} onChange={v => { const n = rows.map(x => ({ ...x })); n[i].image = v; onChange(n); }} />
          </div>
        </div>
      ))}
      <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { title: "", detail: "", image: "" }])}>+ Add step</button>
    </div>
  );
}

// ── one field, dispatched by kind ──────────────────────────
function FieldControl({ field, value, item, onChange, onItemChange }: {
  field: Field;
  value: unknown;
  item: Item;
  onChange: (v: unknown) => void;
  /** write a sibling field on the same item (used by "specs" to keep `models` in sync) */
  onItemChange: (key: string, v: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
      return <input style={inputStyle} value={(value as string) ?? ""} onChange={e => onChange(e.target.value)} />;
    case "textarea":
      return <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={(value as string) ?? ""} onChange={e => onChange(e.target.value)} />;
    case "number":
      return <input style={inputStyle} type="number" value={(value as number) ?? 0} onChange={e => onChange(Number(e.target.value))} />;
    case "boolean":
      return (
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} style={{ width: 20, height: 20 }} />
          <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: "#fff" }}>{Boolean(value) ? "On" : "Off"}</span>
        </label>
      );
    case "select":
      return (
        <select style={{ ...inputStyle, appearance: "auto" }} value={(value as string) ?? ""} onChange={e => onChange(e.target.value)}>
          {(field.options ?? []).map(o => <option key={o} value={o} style={{ color: "#e0e0e0", background: "#111" }}>{o}</option>)}
        </select>
      );
    case "image":
      return <ImageField value={(value as string) ?? ""} onChange={onChange} />;
    case "images":
      return <ImagesField value={(value as string[]) ?? []} onChange={onChange} />;
    case "stringlist": {
      const list = (value as string[]) ?? [];
      return (
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={list.join("\n")}
          onChange={e => onChange(e.target.value.split("\n"))}
          onBlur={e => onChange(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
          placeholder="one per line"
        />
      );
    }
    case "pairs": {
      const rows = (value as [string, string][]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input style={{ ...inputStyle, flex: 1 }} value={r[0]} placeholder="Label"
                onChange={e => { const n = rows.map(x => [...x] as [string, string]); n[i][0] = e.target.value; onChange(n); }} />
              <input style={{ ...inputStyle, flex: 1 }} value={r[1]} placeholder="Value"
                onChange={e => { const n = rows.map(x => [...x] as [string, string]); n[i][1] = e.target.value; onChange(n); }} />
              <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, ["", ""]])}>+ Add row</button>
        </div>
      );
    }
    case "kvlist": {
      const rows = (value as { label: string; value: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input style={{ ...inputStyle, flex: 1 }} value={r.label} placeholder="Label"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].label = e.target.value; onChange(n); }} />
              <input style={{ ...inputStyle, flex: 1 }} value={r.value} placeholder="Value"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].value = e.target.value; onChange(n); }} />
              <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { label: "", value: "" }])}>+ Add row</button>
        </div>
      );
    }
    case "features": {
      const rows = (value as { head: string; body: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input style={{ ...inputStyle, flex: 1 }} value={r.head} placeholder="Heading"
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].head = e.target.value; onChange(n); }} />
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={r.body} placeholder="Body"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].body = e.target.value; onChange(n); }} />
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { head: "", body: "" }])}>+ Add feature</button>
        </div>
      );
    }
    case "specs": {
      // {label, values[]}[] — values[] is positionally aligned to item.models[].
      // Model columns are edited right here (not via the separate "models"
      // text field) so adding/renaming/removing a column always keeps every
      // row's values[] in sync by splicing at the same index — never a
      // free-form re-type of `models` that could silently misalign existing
      // values against the wrong column.
      const models = (item.models as string[]) ?? [];
      const rows = (value as { label: string; values: string[] }[]) ?? [];

      const setModelName = (mi: number, name: string) => {
        const nm = models.map((m, j) => (j === mi ? name : m));
        onItemChange("models", nm);
      };
      const addModel = () => {
        onItemChange("models", [...models, `Model-${models.length + 1}`]);
        onChange(rows.map(r => ({ ...r, values: [...r.values, ""] })));
      };
      const removeModel = (mi: number) => {
        onItemChange("models", models.filter((_, j) => j !== mi));
        onChange(rows.map(r => ({ ...r, values: r.values.filter((_, j) => j !== mi) })));
      };

      return (
        <div style={{ overflowX: "auto", borderRadius: 12, background: "rgba(255,255,255,0.03)", padding: "1rem" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: "0.4rem", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...hintStyle, fontWeight: 700, color: "var(--brand-teal)", textAlign: "left", padding: "0.3rem 0.4rem" }}>Spec</th>
                {models.map((m, mi) => (
                  <th key={mi} style={{ padding: "0.2rem 0.3rem", minWidth: 150 }}>
                    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                      <input style={{ ...inputStyle, fontWeight: 700, color: "var(--brand-teal)", padding: "0.5rem 0.7rem" }} value={m}
                        onChange={e => setModelName(mi, e.target.value)} />
                      <button type="button" title={`Remove ${m || "column"}`} style={{ ...dangerBtn, padding: "0.5rem" }}
                        onClick={() => { if (confirm(`Remove model column "${m || `#${mi + 1}`}"? This deletes its value from every spec row.`)) removeModel(mi); }}>
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
                <th style={{ padding: "0.2rem 0.3rem" }}>
                  <button type="button" style={smallBtn} onClick={addModel}>+ Column</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "0.2rem 0.3rem", minWidth: 160 }}>
                    <input style={inputStyle} value={r.label}
                      onChange={e => { const n = rows.map(x => ({ ...x, values: [...x.values] })); n[i].label = e.target.value; onChange(n); }} />
                  </td>
                  {models.map((_, mi) => (
                    <td key={mi} style={{ padding: "0.2rem 0.3rem", minWidth: 130 }}>
                      <input style={inputStyle} value={r.values[mi] ?? ""}
                        onChange={e => { const n = rows.map(x => ({ ...x, values: [...x.values] })); n[i].values[mi] = e.target.value; onChange(n); }} />
                    </td>
                  ))}
                  <td style={{ padding: "0.2rem 0.3rem" }}>
                    <button type="button" style={{ ...dangerBtn, padding: "0.5rem" }} onClick={() => onChange(rows.filter((_, j) => j !== i))}><X size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" style={{ ...smallBtn, marginTop: "0.75rem" }}
            onClick={() => onChange([...rows, { label: "", values: models.map(() => "") }])}>
            + Add spec row
          </button>
        </div>
      );
    }
    case "steps": {
      // {title, detail, image}[] — numbered installation / setup steps
      return <StepsEditor value={(value as Step[]) ?? []} onChange={onChange} />;
    }
    case "phases": {
      // {label, duration, detail}[] — delivery/timeline phases
      const rows = (value as { label: string; duration: string; detail: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input style={{ ...inputStyle, flex: 2, minWidth: 160 }} value={r.label} placeholder="Phase (e.g. Production)"
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].label = e.target.value; onChange(n); }} />
                <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={r.duration} placeholder="Duration (e.g. 25–30 days)"
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].duration = e.target.value; onChange(n); }} />
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={r.detail} placeholder="What happens in this phase"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].detail = e.target.value; onChange(n); }} />
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { label: "", duration: "", detail: "" }])}>+ Add phase</button>
        </div>
      );
    }
    case "gallery": {
      // {src, caption}[] — real site / installation / delivery photos
      const rows = (value as { src: string; caption: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <ImageField value={r.src} onChange={v => { const n = rows.map(x => ({ ...x })); n[i].src = v; onChange(n); }} />
                </div>
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <input style={inputStyle} value={r.caption} placeholder="Caption"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].caption = e.target.value; onChange(n); }} />
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { src: "", caption: "" }])}>+ Add photo</button>
        </div>
      );
    }
    case "videos": {
      // {url, title}[] — real product demo videos (YouTube link or ID)
      const rows = (value as { url: string; title: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <input style={{ ...inputStyle, flex: 1 }} value={r.url} placeholder="YouTube URL or video ID"
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].url = e.target.value; onChange(n); }} />
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <input style={inputStyle} value={r.title} placeholder="Video title (e.g. Live Production Run)"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].title = e.target.value; onChange(n); }} />
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { url: "", title: "" }])}>+ Add video</button>
        </div>
      );
    }
    case "reviews": {
      // {name, title, rating, text}[] — only real, collected buyer reviews
      const rows = (value as { name: string; title: string; rating: number; text: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input style={{ ...inputStyle, flex: 2, minWidth: 140 }} value={r.name} placeholder="Reviewer name"
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].name = e.target.value; onChange(n); }} />
                <input style={{ ...inputStyle, flex: 2, minWidth: 160 }} value={r.title} placeholder="Company / role"
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].title = e.target.value; onChange(n); }} />
                <select style={{ ...inputStyle, flex: "0 0 90px" }} value={r.rating || 5}
                  onChange={e => { const n = rows.map(x => ({ ...x })); n[i].rating = Number(e.target.value); onChange(n); }}>
                  {[5, 4, 3, 2, 1].map(v => <option key={v} value={v} style={{ color: "#e0e0e0", background: "#111" }}>{v} star{v === 1 ? "" : "s"}</option>)}
                </select>
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={r.text} placeholder="What the buyer said"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].text = e.target.value; onChange(n); }} />
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { name: "", title: "", rating: 5, text: "" }])}>+ Add review</button>
        </div>
      );
    }
    case "stagePhotos": {
      // {packing?, freight?, install?: string[]} — 3 fixed delivery-stage
      // proof photo galleries. Older data may still hold a single string per
      // stage — normalize to an array so existing saves keep working.
      const v = (value as Record<"packing" | "freight" | "install", string | string[] | undefined>) ?? {};
      const toArray = (x: string | string[] | undefined): string[] => (Array.isArray(x) ? x : x ? [x] : []);
      const STAGES: { key: "packing" | "freight" | "install"; label: string }[] = [
        { key: "packing", label: "Export Packing — crated / palletized machine" },
        { key: "freight", label: "Ocean / Air Freight — container loading" },
        { key: "install", label: "On-Site Install — commissioning at buyer's site" },
      ];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {STAGES.map(s => (
            <div key={s.key} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ ...label, fontSize: "0.85rem" }}>{s.label}</span>
              <ImagesField value={toArray(v[s.key])} onChange={val => onChange({ ...v, [s.key]: val })} />
            </div>
          ))}
        </div>
      );
    }
    case "customSections": {
      // discriminated union — {kind, title, image?, text?, imageSide?, photos?}[].
      // Admins pick a kind, then only the fields that template uses appear.
      type Row = {
        kind: "banner" | "text" | "split" | "gallery";
        title: string;
        image?: string;
        text?: string;
        imageSide?: "left" | "right";
        photos?: { src: string; caption: string }[];
      };
      const rows = (value as Row[]) ?? [];
      const KIND_LABEL: Record<Row["kind"], string> = {
        banner: "Full-width image banner",
        text: "Title + text only",
        split: "Image + title + text (side by side)",
        gallery: "Photo grid with captions",
      };
      const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= rows.length) return;
        const n = rows.map(x => ({ ...x }));
        [n[i], n[j]] = [n[j], n[i]];
        onChange(n);
      };
      const patch = (i: number, p: Partial<Row>) => {
        const n = rows.map(x => ({ ...x }));
        n[i] = { ...n[i], ...p };
        onChange(n);
      };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <select style={{ ...inputStyle, flex: "0 0 260px" }} value={r.kind}
                  onChange={e => patch(i, { kind: e.target.value as Row["kind"] })}>
                  {(Object.keys(KIND_LABEL) as Row["kind"][]).map(k => <option key={k} value={k} style={{ color: "#e0e0e0", background: "#111" }}>{KIND_LABEL[k]}</option>)}
                </select>
                <div style={{ flex: 1 }} />
                <button type="button" title="Move up" style={iconBtn} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" title="Move down" style={iconBtn} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove section</button>
              </div>

              <input style={inputStyle} value={r.title} placeholder="Section title"
                onChange={e => patch(i, { title: e.target.value })} />

              {(r.kind === "banner" || r.kind === "split") && (
                <div>
                  <span style={{ ...hintStyle, display: "block", marginBottom: "0.35rem" }}>Image</span>
                  <ImageField value={r.image ?? ""} onChange={v => patch(i, { image: v })} />
                </div>
              )}

              {r.kind === "split" && (
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                  <span style={{ ...hintStyle }}>Image side:</span>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                    <input type="radio" checked={(r.imageSide ?? "left") === "left"} onChange={() => patch(i, { imageSide: "left" })} />
                    <span style={{ ...hintStyle, color: "rgba(255,255,255,0.8)" }}>Left</span>
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                    <input type="radio" checked={r.imageSide === "right"} onChange={() => patch(i, { imageSide: "right" })} />
                    <span style={{ ...hintStyle, color: "rgba(255,255,255,0.8)" }}>Right</span>
                  </label>
                </div>
              )}

              {(r.kind === "text" || r.kind === "split" || r.kind === "banner") && (
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                  value={r.text ?? ""} placeholder={r.kind === "banner" ? "Caption text (optional)" : "Body text"}
                  onChange={e => patch(i, { text: e.target.value })} />
              )}

              {r.kind === "gallery" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {(r.photos ?? []).map((p, pi) => (
                    <div key={pi} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <ImageField value={p.src} onChange={v => {
                          const photos = (r.photos ?? []).map(x => ({ ...x }));
                          photos[pi].src = v;
                          patch(i, { photos });
                        }} />
                        <input style={{ ...inputStyle, marginTop: "0.5rem" }} value={p.caption} placeholder="Caption"
                          onChange={e => {
                            const photos = (r.photos ?? []).map(x => ({ ...x }));
                            photos[pi].caption = e.target.value;
                            patch(i, { photos });
                          }} />
                      </div>
                      <button type="button" style={dangerBtn} onClick={() => patch(i, { photos: (r.photos ?? []).filter((_, j) => j !== pi) })}>Remove</button>
                    </div>
                  ))}
                  <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }}
                    onClick={() => patch(i, { photos: [...(r.photos ?? []), { src: "", caption: "" }] })}>+ Add photo</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }}
            onClick={() => onChange([...rows, { kind: "banner", title: "", image: "", text: "" }])}>+ Add section</button>
        </div>
      );
    }
    case "parts": {
      // {name, detail, images?, installation?}[] — real machine parts/components.
      // Each part can carry its own optional install-step sequence, only shown
      // on the product page when that part actually has steps.
      type Part = { name: string; detail: string; images?: string[]; installation?: Step[] };
      const rows = (value as Part[]) ?? [];
      const patch = (i: number, p: Partial<Part>) => {
        const n = rows.map(x => ({ ...x }));
        n[i] = { ...n[i], ...p };
        onChange(n);
      };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input style={{ ...inputStyle, flex: 1 }} value={r.name} placeholder="Part name (e.g. Die Head Assembly)"
                  onChange={e => patch(i, { name: e.target.value })} />
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove part</button>
              </div>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={r.detail} placeholder="What this part is / does"
                onChange={e => patch(i, { detail: e.target.value })} />
              <div>
                <span style={{ ...hintStyle, display: "block", marginBottom: "0.35rem" }}>Part photos (upload as many as you like)</span>
                <ImagesField value={r.images ?? []} onChange={v => patch(i, { images: v })} />
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem" }}>
                <span style={{ ...label, fontSize: "0.85rem", display: "block", marginBottom: "0.6rem" }}>Install steps for this part (optional — only add if this part needs its own sequence)</span>
                <StepsEditor value={r.installation ?? []} onChange={v => patch(i, { installation: v })} />
              </div>
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }}
            onClick={() => onChange([...rows, { name: "", detail: "", images: [], installation: [] }])}>+ Add part</button>
        </div>
      );
    }
    case "links": {
      const rows = (value as { label: string; url: string }[]) ?? [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input style={{ ...inputStyle, flex: 1 }} value={r.label} placeholder="Link text (e.g. Full specification)"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].label = e.target.value; onChange(n); }} />
              <input style={{ ...inputStyle, flex: 1 }} value={r.url} placeholder="/products/... or https://…"
                onChange={e => { const n = rows.map(x => ({ ...x })); n[i].url = e.target.value; onChange(n); }} />
              <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => onChange([...rows, { label: "", url: "" }])}>+ Add link</button>
        </div>
      );
    }
    case "richtext": {
      // block-based article body — {kind: heading|paragraph|list, text?, items?}[].
      // Admins compose the article from typed blocks instead of writing HTML;
      // renderNewsBody() in lib/news.ts turns this into the same p/h3/ul markup
      // the article page already styles. **bold** is the only inline syntax.
      type Block =
        | { kind: "heading"; text: string }
        | { kind: "paragraph"; text: string }
        | { kind: "list"; items: string[] };
      const rows = (value as Block[]) ?? [];
      const BLOCK_LABEL: Record<Block["kind"], string> = {
        heading: "Heading",
        paragraph: "Paragraph",
        list: "Bullet list",
      };
      const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= rows.length) return;
        const n = rows.map(x => ({ ...x }));
        [n[i], n[j]] = [n[j], n[i]];
        onChange(n);
      };
      const setKind = (i: number, kind: Block["kind"]) => {
        const n = rows.map(x => ({ ...x }));
        n[i] = kind === "list" ? { kind, items: [""] } : { kind, text: "" };
        onChange(n);
      };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((b, i) => (
            <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <select style={{ ...inputStyle, flex: "0 0 180px" }} value={b.kind}
                  onChange={e => setKind(i, e.target.value as Block["kind"])}>
                  {(Object.keys(BLOCK_LABEL) as Block["kind"][]).map(k => <option key={k} value={k} style={{ color: "#e0e0e0", background: "#111" }}>{BLOCK_LABEL[k]}</option>)}
                </select>
                <div style={{ flex: 1 }} />
                <button type="button" title="Move up" style={iconBtn} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" title="Move down" style={iconBtn} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" style={dangerBtn} onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
              </div>

              {b.kind === "heading" && (
                <input style={inputStyle} value={b.text} placeholder="Heading text"
                  onChange={e => { const n = rows.map(x => ({ ...x })); (n[i] as Block & { kind: "heading" }).text = e.target.value; onChange(n); }} />
              )}

              {b.kind === "paragraph" && (
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={b.text} placeholder="Paragraph text — use **bold** for emphasis"
                  onChange={e => { const n = rows.map(x => ({ ...x })); (n[i] as Block & { kind: "paragraph" }).text = e.target.value; onChange(n); }} />
              )}

              {b.kind === "list" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {b.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", gap: "0.5rem" }}>
                      <input style={{ ...inputStyle, flex: 1 }} value={item} placeholder="List item — use **bold** for emphasis"
                        onChange={e => {
                          const n = rows.map(x => ({ ...x })) as Block[];
                          const items = [...(n[i] as Block & { kind: "list" }).items];
                          items[ii] = e.target.value;
                          (n[i] as Block & { kind: "list" }).items = items;
                          onChange(n);
                        }} />
                      <button type="button" style={dangerBtn} onClick={() => {
                        const n = rows.map(x => ({ ...x })) as Block[];
                        (n[i] as Block & { kind: "list" }).items = (n[i] as Block & { kind: "list" }).items.filter((_, j) => j !== ii);
                        onChange(n);
                      }}><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }} onClick={() => {
                    const n = rows.map(x => ({ ...x })) as Block[];
                    (n[i] as Block & { kind: "list" }).items = [...(n[i] as Block & { kind: "list" }).items, ""];
                    onChange(n);
                  }}>+ Add item</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" style={{ ...smallBtn, alignSelf: "flex-start" }}
            onClick={() => onChange([...rows, { kind: "paragraph", text: "" }])}>+ Add block</button>
        </div>
      );
    }
    default:
      return null;
  }
}

// ── fields for one open item — grouped into tabs when the collection
// declares `groups`, otherwise a plain flat list (unchanged behaviour) ──
function ItemFieldsPanel({ collection, item, onFieldChange, onFieldItemChange }: {
  collection: Collection;
  item: Item;
  onFieldChange: (key: string, v: unknown) => void;
  onFieldItemChange: (key: string, v: unknown) => void;
}) {
  const groups = collection.groups;
  const hasGroups = !!groups && groups.length > 0;
  const [activeGroup, setActiveGroup] = useState(groups?.[0] ?? "");

  const fieldsToShow = hasGroups
    ? collection.fields.filter(f => (f.group ?? groups![0]) === activeGroup)
    : collection.fields;

  return (
    <div>
      {hasGroups && (
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", padding: "0.9rem 1.25rem 0" }}>
          {groups!.map(g => (
            <button key={g} type="button"
              onClick={() => setActiveGroup(g)}
              style={{
                padding: "0.55rem 1rem", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700,
                background: activeGroup === g ? "var(--brand-teal)" : "rgba(255,255,255,0.06)",
                color: activeGroup === g ? "#04211e" : "rgba(255,255,255,0.65)",
                whiteSpace: "nowrap",
              }}>
              {g}
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {fieldsToShow.map(f => (
          <label key={f.key} style={{ display: "block" }}>
            <FieldLabel hint={f.hint}>{f.label}</FieldLabel>
            <FieldControl field={f} item={item} value={item[f.key]}
              onChange={v => onFieldChange(f.key, v)}
              onItemChange={onFieldItemChange} />
          </label>
        ))}
      </div>
    </div>
  );
}

// ── category tiles — shown in place of the flat family list so 30+
// products across categories don't have to be scrolled through as one
// long list. Only used for the `families` collection (has a `category`
// field); every other collection keeps the plain flat list. ──
function CategoryTiles({ categories, items, onSelect }: {
  categories: Item[];
  items: Item[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }} className="adm-stagger">
      {categories.map(cat => {
        const slug = String(cat.slug ?? "");
        const count = items.filter(f => f.category === slug).length;
        const CatIcon = SHARED_CATEGORY_ICON[slug] ?? Package;
        return (
          <button key={slug} type="button" onClick={() => onSelect(slug)} className="adm-tile" style={{ textAlign: "left", cursor: "pointer", color: "#fff", padding: "1.5rem" }}>
            <div className="adm-tile__icon" style={{ marginBottom: "0.75rem" }}><CatIcon size={20} /></div>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.15rem", marginBottom: "0.35rem" }}>
              {String(cat.name ?? slug)}
            </div>
            <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
              {count} {count === 1 ? "machine" : "machines"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── main editor ────────────────────────────────────────────
export default function Editor({ schema }: { schema: SectionSchema }) {
  const [data, setData] = useState<Json | null>(null);
  const [openIdx, setOpenIdx] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/data/${schema.slug}`)
      .then(r => r.json())
      .then(j => { if (alive) setData(j); })
      .catch(() => { if (alive) { setStatus("error"); setErrMsg("Failed to load section data"); } });
    return () => { alive = false; };
  }, [schema.slug]);

  const mutate = useCallback((fn: (d: Json) => Json) => {
    setData(d => (d ? fn(d) : d));
    setStatus("dirty");
  }, []);

  async function save() {
    if (!data) return;
    setStatus("saving"); setErrMsg("");
    try {
      const res = await fetch(`/api/admin/data/${schema.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `save failed (${res.status})`);
      }
      setStatus("saved");
      setTimeout(() => setStatus(s => (s === "saved" ? "idle" : s)), 2500);
    } catch (e) {
      setStatus("error"); setErrMsg((e as Error).message);
    }
  }

  if (!data) {
    if (status === "error") {
      return <div style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "#ff8a97", padding: "2rem 0" }}>{errMsg}</div>;
    }
    return (
      <div style={{ maxWidth: 1200 }}>
        <div className="adm-skel" style={{ width: "40%", height: 38, borderRadius: 8, marginBottom: "0.75rem" }} />
        <div className="adm-skel" style={{ width: "65%", height: 16, borderRadius: 6, marginBottom: "2rem" }} />
        <div className="adm-skel" style={{ height: 140, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200 }} className="adm-rise">
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "2.4rem", color: "#fff", lineHeight: 1.05, margin: "0 0 0.5rem" }}>
            {schema.title}
          </h1>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(255,255,255,0.6)", maxWidth: "62ch", margin: 0, lineHeight: 1.6 }}>
            {schema.description}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          {status === "dirty" && <span className="adm-status" style={{ color: "#f5c451" }}>Unsaved changes</span>}
          {status === "saved" && <span className="adm-status" style={{ color: "var(--brand-teal)" }}><CheckCircle2 size={15} /> Saved</span>}
          {status === "error" && <span className="adm-status" style={{ color: "#ff8a97" }}>{errMsg}</span>}
          <button onClick={save} disabled={status === "saving"} className="adm-btn">
            {status === "saving" && <Loader2 size={16} className="adm-spin-icon" />}
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* root fields */}
      {schema.rootFields && schema.rootFields.length > 0 && (
        <div className="adm-panel" style={{ padding: "1.5rem", marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {schema.rootFields.map(f => (
            <label key={f.key}>
              <FieldLabel>{f.label}</FieldLabel>
              <FieldControl field={f} item={data} value={data[f.key]}
                onChange={v => mutate(d => ({ ...d, [f.key]: v }))}
                onItemChange={(k, v) => mutate(d => ({ ...d, [k]: v }))} />
            </label>
          ))}
        </div>
      )}

      {/* collections */}
      {schema.collections.map(col => {
        const allItems = ((data[col.key] as Item[]) ?? []);
        const open = openIdx[col.key] ?? -1;
        const isFamilies = col.key === "families";
        const categoryList = isFamilies ? ((data.categories as Item[]) ?? []) : [];

        // products: show category tiles until one is picked, then only that
        // category's machines — with real indices mapped back into allItems
        // so move/delete/edit still act on the right item in the full array.
        const visibleIndices = isFamilies && activeCategory
          ? allItems.reduce<number[]>((acc, it, idx) => { if (it.category === activeCategory) acc.push(idx); return acc; }, [])
          : allItems.map((_, idx) => idx);
        const items = visibleIndices.map(idx => allItems[idx]);

        if (isFamilies && !activeCategory) {
          return (
            <section key={col.key} style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: "0 0 1rem" }}>
                {col.label} <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400 }}>({allItems.length})</span>
              </h2>
              <CategoryTiles categories={categoryList} items={allItems} onSelect={setActiveCategory} />
            </section>
          );
        }

        const activeCategoryName = isFamilies && activeCategory
          ? String(categoryList.find(c => c.slug === activeCategory)?.name ?? activeCategory)
          : "";

        return (
          <section key={col.key} style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: 0 }}>
                {isFamilies && (
                  <button type="button" onClick={() => { setActiveCategory(null); setOpenIdx(o => ({ ...o, [col.key]: -1 })); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-teal)", fontFamily: "var(--ff-body)", fontSize: "0.9rem", fontWeight: 700, marginRight: "0.9rem", verticalAlign: "middle" }}>
                    ← Back to categories
                  </button>
                )}
                {isFamilies ? activeCategoryName : col.label} <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400 }}>({items.length})</span>
              </h2>
              {col.canAdd && (
                <button type="button" style={smallBtn} onClick={() => {
                  const template = JSON.parse(JSON.stringify(col.template ?? {}));
                  if (isFamilies && activeCategory) template.category = activeCategory;
                  mutate(d => ({ ...d, [col.key]: [...allItems, template] }));
                  setOpenIdx(o => ({ ...o, [col.key]: allItems.length }));
                }}>
                  + Add {(col.singular ?? col.label.replace(/s$/, "")).toLowerCase()}
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {items.map((item, listI) => {
                const i = visibleIndices[listI]; // real index in allItems
                const title = col.titleKeys.map(k => String(item[k] ?? "")).filter(Boolean).join(" — ") || `#${listI + 1}`;
                const isOpen = open === i;
                return (
                  <div key={i} className="adm-panel" style={{
                    borderRadius: 14,
                    background: isOpen ? "var(--adm-surface-2)" : "var(--adm-surface)",
                    overflow: "hidden",
                    transition: "background 0.18s ease, border-color 0.18s ease",
                    borderColor: isOpen ? "rgba(43,191,179,0.25)" : "var(--adm-border)",
                  }}>
                    {/* row header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.9rem 1.1rem" }}>
                      <button type="button"
                        onClick={() => setOpenIdx(o => ({ ...o, [col.key]: isOpen ? -1 : i }))}
                        style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#fff", fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: "rgba(43,191,179,0.16)", color: "var(--brand-teal)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--ff-body)", fontSize: "0.8rem", fontWeight: 700,
                        }}>{listI + 1}</span>
                        {title}
                        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>{isOpen ? "▲ Close" : "▼ Edit"}</span>
                      </button>
                      <button type="button" title="Move up" style={iconBtn} disabled={listI === 0}
                        onClick={() => mutate(d => {
                          const n = [...allItems];
                          const prevI = visibleIndices[listI - 1];
                          [n[prevI], n[i]] = [n[i], n[prevI]];
                          return { ...d, [col.key]: n };
                        })}>↑</button>
                      <button type="button" title="Move down" style={iconBtn} disabled={listI === items.length - 1}
                        onClick={() => mutate(d => {
                          const n = [...allItems];
                          const nextI = visibleIndices[listI + 1];
                          [n[nextI], n[i]] = [n[i], n[nextI]];
                          return { ...d, [col.key]: n };
                        })}>↓</button>
                      {col.canAdd && (
                        <button type="button" title="Delete" style={dangerBtn}
                          onClick={() => { if (confirm(`Delete “${title}”?`)) mutate(d => ({ ...d, [col.key]: allItems.filter((_, j) => j !== i) })); }}>Delete</button>
                      )}
                    </div>

                    {/* fields — grouped into tabs when the collection declares `groups` */}
                    {isOpen && (
                      <ItemFieldsPanel
                        collection={col}
                        item={item}
                        onFieldChange={(key, v) => mutate(d => {
                          const n = allItems.map(x => ({ ...x }));
                          n[i][key] = v;
                          return { ...d, [col.key]: n };
                        })}
                        onFieldItemChange={(key, v) => mutate(d => {
                          const n = allItems.map(x => ({ ...x }));
                          n[i][key] = v;
                          return { ...d, [col.key]: n };
                        })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
