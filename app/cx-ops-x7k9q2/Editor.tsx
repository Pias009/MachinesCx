"use client";
import { useEffect, useState, useCallback } from "react";
import { Camera, Star, X, Plus, CheckCircle2, Package, Loader2, AlertTriangle, Search, Eye, Copy } from "lucide-react";
import type { Field, Collection, SectionSchema } from "@/lib/cmsSchemas";
import { CATEGORY_ICON as SHARED_CATEGORY_ICON } from "./adminIcons";

type Json = Record<string, unknown>;
type Item = Record<string, unknown>;

// ── validation types ───────────────────────────────────────
interface ValidationWarning {
  field: string;
  message: string;
  severity: "error" | "warning";
}

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
  background: "#162338",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff", fontFamily: "var(--ff-body)", fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};
const btnBase: React.CSSProperties = {
  padding: "0.6rem 1rem", borderRadius: 8,
  border: "none", cursor: "pointer",
  fontFamily: "var(--ff-body)", fontSize: "0.88rem", fontWeight: 600,
  display: "inline-flex", alignItems: "center", gap: "0.4rem",
  transition: "all 0.18s ease",
};
const smallBtn: React.CSSProperties = {
  ...btnBase,
  background: "rgba(0, 210, 148, 0.15)", color: "var(--adm-mint)",
  border: "1px solid rgba(0, 210, 148, 0.3)",
};
const dangerBtn: React.CSSProperties = {
  ...btnBase, padding: "0.6rem 0.85rem",
  background: "rgba(255,107,125,0.14)", color: "#ff8a97",
  border: "1px solid rgba(255,107,125,0.3)",
};
const iconBtn: React.CSSProperties = {
  ...btnBase, padding: "0.5rem 0.7rem",
  background: "#162338", color: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <span style={{ ...label, display: "block" }}>{children}</span>
      {hint && <span style={{ ...hintStyle, display: "block", marginTop: "0.15rem" }}>{hint}</span>}
    </div>
  );
}

// ── validation warning modal ──────────────────────────────
function WarningModal({ warnings, onConfirm, onCancel, title }: {
  warnings: ValidationWarning[];
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
}) {
  const errors = warnings.filter(w => w.severity === "error");
  const warns = warnings.filter(w => w.severity === "warning");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    }} onClick={onCancel}>
      <div style={{
        background: "var(--adm-surface-2)", border: "1px solid var(--adm-border-hi)",
        borderRadius: 16, padding: "2rem", maxWidth: 520, width: "90%",
        boxShadow: "0 24px 60px -12px rgba(0,0,0,0.6)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: errors.length > 0 ? "rgba(255,107,125,0.15)" : "rgba(245,196,81,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <AlertTriangle size={20} color={errors.length > 0 ? "#ff6b7d" : "#f5c451"} />
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: 0 }}>{title}</h3>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", margin: "0.25rem 0 0" }}>
              {errors.length > 0 ? "Fix these errors before saving" : "Save anyway or fix first?"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem", maxHeight: 240, overflowY: "auto" }}>
          {errors.map((w, i) => (
            <div key={`e-${i}`} style={{
              display: "flex", gap: "0.6rem", alignItems: "flex-start",
              padding: "0.7rem 0.9rem", borderRadius: 10,
              background: "rgba(255,107,125,0.08)", border: "1px solid rgba(255,107,125,0.2)",
            }}>
              <X size={15} color="#ff6b7d" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 600, color: "#ff8a97" }}>{w.field}</span>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", margin: "0.15rem 0 0" }}>{w.message}</p>
              </div>
            </div>
          ))}
          {warns.map((w, i) => (
            <div key={`w-${i}`} style={{
              display: "flex", gap: "0.6rem", alignItems: "flex-start",
              padding: "0.7rem 0.9rem", borderRadius: 10,
              background: "rgba(245,196,81,0.08)", border: "1px solid rgba(245,196,81,0.2)",
            }}>
              <AlertTriangle size={15} color="#f5c451" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 600, color: "#f5c451" }}>{w.field}</span>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", margin: "0.15rem 0 0" }}>{w.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={{
            ...btnBase, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
          }}>Cancel</button>
          {errors.length === 0 && (
            <button type="button" onClick={onConfirm} style={{
              ...btnBase, background: "var(--brand-teal)", color: "#04211e",
            }}>Save anyway</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── inline warning indicator on fields ────────────────────
function FieldWarning({ msg }: { msg: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      fontFamily: "var(--ff-body)", fontSize: "0.78rem", fontWeight: 600,
      color: "#f5c451", marginTop: "0.3rem",
    }}>
      <AlertTriangle size={12} /> {msg}
    </span>
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

// ── product model dropdown selector for hero section ──────
function ProductSelectField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ slug: string; name: string; series: string; category: string }[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/data/products")
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (alive && j) {
          if (Array.isArray(j.categories)) {
            setCategories(j.categories.map((c: any) => ({ slug: c.slug, name: c.name || c.slug })));
          }
          if (Array.isArray(j.families)) {
            setProducts(j.families.map((f: any) => ({
              slug: f.slug ?? "",
              name: f.name || f.slug || "",
              series: f.series || "",
              category: f.category || "",
            })));
          }
        }
      })
      .catch(() => { /* ignore */ });
    return () => { alive = false; };
  }, []);

  const defaultCats = [
    { slug: "film-blowing", name: "Film Blowing Machines" },
    { slug: "bag-making", name: "Bag Making Machines" },
    { slug: "recycling", name: "Recycling & Lab Lines" },
    { slug: "printing", name: "Flexographic Printing Machines" },
  ];

  const activeCategories = categories.length > 0 ? categories : defaultCats;
  const knownCatSlugs = new Set(activeCategories.map(c => c.slug));
  const uncategorized = products.filter(p => !knownCatSlugs.has(p.category));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <select
        style={{ ...inputStyle, appearance: "auto", fontWeight: 500 }}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
      >
        <option value="" style={{ color: "#aaa", background: "#111" }}>-- Select machine model from catalogue --</option>
        {activeCategories.map(cat => {
          const catProds = products.filter(p => p.category === cat.slug);
          if (catProds.length === 0) return null;
          return (
            <optgroup key={cat.slug} label={`📂 ${cat.name}`} style={{ color: "#2BBFB3", background: "#18181b", fontWeight: 700 }}>
              {catProds.map(p => (
                <option key={p.slug} value={p.slug} style={{ color: "#e4e4e7", background: "#09090b", fontWeight: 400 }}>
                  {p.series ? `${p.series} · ` : ""}{p.name} ({p.slug})
                </option>
              ))}
            </optgroup>
          );
        })}
        {uncategorized.length > 0 && (
          <optgroup label="📂 Other Products" style={{ color: "#888", background: "#18181b" }}>
            {uncategorized.map(p => (
              <option key={p.slug} value={p.slug} style={{ color: "#e4e4e7", background: "#09090b" }}>
                {p.series ? `${p.series} · ` : ""}{p.name} ({p.slug})
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
          Or enter model slug directly:
        </span>
        <input
          style={{ ...inputStyle, padding: "0.4rem 0.7rem", fontSize: "0.88rem", flex: 1 }}
          value={value ?? ""}
          placeholder="e.g. abcde-2200"
          onChange={e => onChange(e.target.value)}
        />
      </div>
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
    case "productSelect":
      return <ProductSelectField value={(value as string) ?? ""} onChange={onChange} />;
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
      // inline validation per section
      const sectionWarnings = (r: Row, i: number) => {
        const w: { field: string; msg: string; err: boolean }[] = [];
        if ((r.kind === "banner" || r.kind === "split") && !r.title?.trim()) {
          w.push({ field: "title", msg: "Title required — section won't appear on site", err: true });
        }
        if ((r.kind === "banner" || r.kind === "split") && !r.image?.trim()) {
          w.push({ field: "image", msg: "No image uploaded", err: false });
        }
        if (r.kind === "split" && !r.text?.trim()) {
          w.push({ field: "text", msg: "No body text — only title will show", err: false });
        }
        if (r.kind === "gallery" && (!r.photos || r.photos.filter(p => p.src).length === 0)) {
          w.push({ field: "photos", msg: "Gallery has no photos — won't appear on site", err: true });
        }
        return w;
      };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {rows.map((r, i) => {
            const warnings = sectionWarnings(r, i);
            const hasError = warnings.some(w => w.err);
            return (
              <div key={i} style={{
                borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: "1rem",
                display: "flex", flexDirection: "column", gap: "0.75rem",
                border: hasError ? "1px solid rgba(255,107,125,0.35)" : warnings.length > 0 ? "1px solid rgba(245,196,81,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}>
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

                <input style={{
                  ...inputStyle,
                  borderColor: (r.kind === "banner" || r.kind === "split") && !r.title?.trim() ? "rgba(255,107,125,0.5)" : undefined,
                }} value={r.title} placeholder="Section title (required for banner/split)"
                  onChange={e => patch(i, { title: e.target.value })} />
                {(r.kind === "banner" || r.kind === "split") && !r.title?.trim() && (
                  <FieldWarning msg="Title required — section won't appear on the live site" />
                )}

                {(r.kind === "banner" || r.kind === "split") && (
                  <div>
                    <span style={{ ...hintStyle, display: "block", marginBottom: "0.35rem" }}>Image</span>
                    <ImageField value={r.image ?? ""} onChange={v => patch(i, { image: v })} />
                    {!r.image?.trim() && (
                      <FieldWarning msg="No image uploaded — section may look empty" />
                    )}
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

                {/* inline warnings */}
                {warnings.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.25rem" }}>
                    {warnings.map((w, wi) => (
                      <div key={wi} style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        fontFamily: "var(--ff-body)", fontSize: "0.78rem", fontWeight: 600,
                        color: w.err ? "#ff8a97" : "#f5c451",
                      }}>
                        <AlertTriangle size={12} /> {w.msg}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

// ── validate custom sections before save ──────────────────
function validateCustomSections(sections: unknown[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  if (!Array.isArray(sections)) return warnings;

  sections.forEach((s, i) => {
    const kind = (s as Record<string, unknown>).kind;
    const title = String((s as Record<string, unknown>).title ?? "").trim();
    const image = String((s as Record<string, unknown>).image ?? "").trim();
    const text = String((s as Record<string, unknown>).text ?? "").trim();
    const photos = (s as Record<string, unknown>).photos as { src: string }[] | undefined;

    const sectionLabel = `Section ${i + 1} (${kind || "unknown"})`;

    if (kind === "banner" || kind === "split") {
      if (!title) {
        warnings.push({
          field: `${sectionLabel} — Title`,
          message: `This ${kind} section has no title. It will NOT appear on the live site without a title.`,
          severity: "error",
        });
      }
      if (!image) {
        warnings.push({
          field: `${sectionLabel} — Image`,
          message: `This ${kind} section has no image. ${kind === "banner" ? "The banner will look empty." : "The split section will have a blank area."}`,
          severity: "warning",
        });
      }
    }

    if (kind === "split" && !text) {
      warnings.push({
        field: `${sectionLabel} — Body text`,
        message: "This split section has no body text. Only the title will show.",
        severity: "warning",
      });
    }

    if (kind === "gallery") {
      const validPhotos = (photos ?? []).filter(p => p.src);
      if (validPhotos.length === 0) {
        warnings.push({
          field: `${sectionLabel} — Photos`,
          message: "This gallery has no uploaded photos. It will be invisible on the live site.",
          severity: "error",
        });
      }
    }
  });

  return warnings;
}

// ── validate product family before save ───────────────────
function validateFamily(item: Item): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const name = String(item.name ?? "").trim();
  const slug = String(item.slug ?? "").trim();
  const images = item.images as string[] | undefined;

  if (!name) {
    warnings.push({ field: "Product name", message: "Product has no name. It will be hard to identify.", severity: "warning" });
  }
  if (!slug) {
    warnings.push({ field: "Slug", message: "Product has no URL slug. The page link won't work.", severity: "error" });
  }
  if (!images || images.length === 0) {
    warnings.push({ field: "Product photos", message: "No product photos uploaded. The product will show a fallback image.", severity: "warning" });
  }

  // validate custom sections within this family
  const cs = item.customSections;
  if (Array.isArray(cs) && cs.length > 0) {
    warnings.push(...validateCustomSections(cs));
  }

  return warnings;
}

// ── validate all data before section-level save ───────────
function validateSectionData(data: Json, schema: SectionSchema): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const col of schema.collections) {
    const items = data[col.key] as Item[] | undefined;
    if (!items || !Array.isArray(items)) continue;

    items.forEach((item, i) => {
      if (col.key === "families") {
        const familyWarnings = validateFamily(item);
        // prefix with product name for context
        const productName = String(item.name ?? item.series ?? `#${i + 1}`);
        familyWarnings.forEach(w => {
          w.field = `[${productName}] ${w.field}`;
          warnings.push(w);
        });
      }
    });
  }

  return warnings;
}

// ── product editor modal ──────────────────────────────────
function ProductEditorModal({ item, index, collection, onClose, onSave, onFieldChange, onFieldItemChange }: {
  item: Item;
  index: number;
  collection: Collection;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (key: string, v: unknown) => void;
  onFieldItemChange: (key: string, v: unknown) => void;
}) {
  const [dirty, setDirty] = useState(false);

  const handleChange = useCallback((key: string, v: unknown) => {
    setDirty(true);
    onFieldChange(key, v);
  }, [onFieldChange]);

  const handleItemChange = useCallback((key: string, v: unknown) => {
    setDirty(true);
    onFieldItemChange(key, v);
  }, [onFieldItemChange]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      display: "flex", flexDirection: "column",
      background: "var(--adm-bg)",
    }}>
      {/* modal header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 1.5rem", borderBottom: "1px solid var(--adm-border)",
        background: "var(--adm-surface)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button type="button" onClick={() => {
            if (dirty && !confirm("You have unsaved changes. Discard?")) return;
            onClose();
          }} style={{
            ...iconBtn, padding: "0.6rem",
          }}>← Back</button>
          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: 0 }}>
            Edit: {String(item.name ?? item.series ?? `#${index + 1}`)}
          </h2>
          {dirty && <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "#f5c451" }}>● Unsaved</span>}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={onClose} style={{
            ...btnBase, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
          }}>Close</button>
          <button type="button" onClick={() => { setDirty(false); onSave(); }} style={{
            ...btnBase, background: "var(--brand-teal)", color: "#04211e",
          }}>
            <CheckCircle2 size={14} /> Save product
          </button>
        </div>
      </div>

      {/* modal body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <ItemFieldsPanel
            collection={collection}
            item={item}
            onFieldChange={handleChange}
            onFieldItemChange={handleItemChange}
          />
        </div>
      </div>
    </div>
  );
}

// ── main editor ────────────────────────────────────────────
export default function Editor({ schema }: { schema: SectionSchema }) {
  const [data, setData] = useState<Json | null>(null);
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "complete" | "warnings" | "has_image">("all");

  // validation modal state
  const [pendingWarnings, setPendingWarnings] = useState<ValidationWarning[] | null>(null);
  const [pendingSaveFn, setPendingSaveFn] = useState<(() => void) | null>(null);

  // product editor modal state
  const [modalItem, setModalItem] = useState<{ item: Item; index: number; collection: Collection } | null>(null);

  // live preview card modal state
  const [previewItem, setPreviewItem] = useState<{ item: Item; title: string } | null>(null);

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

  // actual save (called after validation passes)
  async function doSave() {
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

  // save with validation check
  const save = useCallback(() => {
    if (!data) return;
    const warnings = validateSectionData(data, schema);
    if (warnings.length > 0) {
      setPendingWarnings(warnings);
      setPendingSaveFn(() => doSave);
    } else {
      doSave();
    }
  }, [data, schema]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

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
    <div style={{ maxWidth: 1200, position: "relative" }} className="adm-rise">
      {/* validation warning modal */}
      {pendingWarnings && (
        <WarningModal
          title="Review before saving"
          warnings={pendingWarnings}
          onConfirm={() => { setPendingWarnings(null); pendingSaveFn?.(); }}
          onCancel={() => { setPendingWarnings(null); setPendingSaveFn(null); }}
        />
      )}

      {/* product editor modal */}
      {modalItem && (
        <ProductEditorModal
          item={modalItem.item}
          index={modalItem.index}
          collection={modalItem.collection}
          onClose={() => setModalItem(null)}
          onSave={() => { doSave(); setModalItem(null); }}
          onFieldChange={(key, v) => {
            mutate(d => {
              const n = ((d[modalItem.collection.key] as Item[]) ?? []).map(x => ({ ...x }));
              n[modalItem.index][key] = v;
              return { ...d, [modalItem.collection.key]: n };
            });
            setModalItem(prev => prev ? { ...prev, item: { ...prev.item, [key]: v } } : null);
          }}
          onFieldItemChange={(key, v) => {
            mutate(d => {
              const n = ((d[modalItem.collection.key] as Item[]) ?? []).map(x => ({ ...x }));
              n[modalItem.index][key] = v;
              return { ...d, [modalItem.collection.key]: n };
            });
            setModalItem(prev => prev ? { ...prev, item: { ...prev.item, [key]: v } } : null);
          }}
        />
      )}

      {/* Live Card Preview Modal */}
      {previewItem && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem"
        }} onClick={() => setPreviewItem(null)}>
          <div style={{
            background: "#121b2d", border: "1px solid var(--adm-mint-glow)",
            borderRadius: 20, padding: "1.75rem", maxWidth: 520, width: "100%",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8)", position: "relative"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--adm-mint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Live Card Preview
              </span>
              <button onClick={() => setPreviewItem(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{
              background: "#162338", border: "1px solid var(--adm-border)", borderRadius: 16, overflow: "hidden", padding: "1.25rem"
            }}>
              {Boolean(previewItem.item.image || previewItem.item.heroImage || (Array.isArray(previewItem.item.images) && previewItem.item.images.length > 0)) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(previewItem.item.image || previewItem.item.heroImage || (Array.isArray(previewItem.item.images) ? previewItem.item.images[0] : ""))}
                  alt=""
                  style={{ width: "100%", height: 180, objectFit: "contain", borderRadius: 12, background: "rgba(0,0,0,0.2)", marginBottom: "1rem" }}
                />
              ) : (
                <div style={{ width: "100%", height: 120, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  <Camera size={24} style={{ marginRight: 8 }} /> No Image Uploaded
                </div>
              )}
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: "0 0 0.4rem" }}>
                {previewItem.title}
              </h3>
              {Boolean(previewItem.item.tagline) && (
                <p style={{ fontSize: "0.88rem", color: "var(--adm-text-sub)", margin: "0 0 0.8rem" }}>
                  {String(previewItem.item.tagline)}
                </p>
              )}
              {Array.isArray(previewItem.item.specs) && previewItem.item.specs.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: 10, fontSize: "0.78rem" }}>
                  {(previewItem.item.specs as Array<{ label?: string; value?: string }>).slice(0, 4).map((s, idx) => (
                    <div key={idx} style={{ color: "rgba(255,255,255,0.8)" }}>
                      <span style={{ color: "var(--adm-text-sub)" }}>{s.label}: </span>
                      <strong>{s.value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <span style={{ background: "var(--adm-mint-sub)", color: "var(--adm-mint)", padding: "0.2rem 0.6rem", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700 }}>
              CMS CMS Section
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--adm-text-sub)" }}>Press Ctrl+S to save</span>
          </div>
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
            {status === "saving" ? "Saving…" : "Save changes (Ctrl+S)"}
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
        const isFamilies = col.key === "families";
        const categoryList = isFamilies ? ((data.categories as Item[]) ?? []) : [];

        const visibleIndices = isFamilies && activeCategory
          ? allItems.reduce<number[]>((acc, it, idx) => { if (it.category === activeCategory) acc.push(idx); return acc; }, [])
          : allItems.map((_, idx) => idx);

        let items = visibleIndices.map(idx => allItems[idx]);

        // Filter items dynamically by search query & filter chips
        if (filterQuery.trim()) {
          const q = filterQuery.toLowerCase();
          items = items.filter(it => {
            const title = col.titleKeys.map(k => String(it[k] ?? "")).join(" ").toLowerCase();
            return title.includes(q) || String(it.series ?? "").toLowerCase().includes(q) || String(it.name ?? "").toLowerCase().includes(q);
          });
        }

        if (filterType === "has_image") {
          items = items.filter(it => Boolean(it.image || it.heroImage || (Array.isArray(it.images) && it.images.length > 0)));
        } else if (filterType === "warnings") {
          items = items.filter(it => isFamilies ? validateFamily(it).length > 0 : false);
        }

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
            {/* Collection Header & Filter Toolbar */}
            <div style={{ background: "#121b2d", border: "1px solid var(--adm-border)", borderRadius: 16, padding: "1.2rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", color: "#fff", margin: 0 }}>
                  {isFamilies && (
                    <button type="button" onClick={() => { setActiveCategory(null); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-teal)", fontFamily: "var(--ff-body)", fontSize: "0.9rem", fontWeight: 700, marginRight: "0.9rem", verticalAlign: "middle" }}>
                      ← Back to categories
                    </button>
                  )}
                  {isFamilies ? activeCategoryName : col.label} <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400 }}>({items.length} items)</span>
                </h2>
                {col.canAdd && (
                  <button type="button" style={smallBtn} onClick={() => {
                    const template = JSON.parse(JSON.stringify(col.template ?? {}));
                    if (isFamilies && activeCategory) template.category = activeCategory;
                    mutate(d => {
                      const newItems = [...allItems, template];
                      const newIdx = newItems.length - 1;
                      setTimeout(() => setModalItem({ item: template, index: newIdx, collection: col }), 50);
                      return { ...d, [col.key]: newItems };
                    });
                  }}>
                    + Add {(col.singular ?? col.label.replace(/s$/, "")).toLowerCase()}
                  </button>
                )}
              </div>

              {/* Dynamic Filter Controls */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                  <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--adm-text-sub)" }} />
                  <input
                    type="text"
                    placeholder={`Filter ${col.label.toLowerCase()}...`}
                    value={filterQuery}
                    onChange={e => setFilterQuery(e.target.value)}
                    style={{
                      width: "100%", padding: "0.5rem 0.8rem 0.5rem 2.2rem",
                      background: "#162338", border: "1px solid var(--adm-border)",
                      borderRadius: 10, color: "#fff", fontSize: "0.82rem", outline: "none"
                    }}
                  />
                  {filterQuery && (
                    <button onClick={() => setFilterQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.35rem" }}>
                  {(["all", "has_image", "warnings"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterType(t)}
                      style={{
                        padding: "0.45rem 0.75rem", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                        border: "1px solid var(--adm-border)", cursor: "pointer",
                        background: filterType === t ? "var(--adm-mint)" : "rgba(255,255,255,0.04)",
                        color: filterType === t ? "#061814" : "var(--adm-text-sub)"
                      }}
                    >
                      {t === "all" ? "All Items" : t === "has_image" ? "📷 Has Image" : "⚠️ Needs Review"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {items.map((item, listI) => {
                const i = visibleIndices[listI];
                const title = col.titleKeys.map(k => String(item[k] ?? "")).filter(Boolean).join(" — ") || `#${listI + 1}`;
                const itemWarnings = isFamilies ? validateFamily(item) : [];
                const hasErrors = itemWarnings.some(w => w.severity === "error");
                const hasWarnings = itemWarnings.some(w => w.severity === "warning");
                const itemImg = String(item.image || item.heroImage || (Array.isArray(item.images) && item.images[0]) || "");

                const specCount = Array.isArray(item.specs) ? item.specs.length : 0;
                const photoCount = Array.isArray(item.images) ? item.images.length : (itemImg ? 1 : 0);

                return (
                  <div key={i} className="adm-panel" style={{
                    borderRadius: 16,
                    background: "#121b2d",
                    overflow: "hidden",
                    border: "1px solid",
                    transition: "all 0.2s ease",
                    borderColor: hasErrors ? "rgba(255,107,125,0.35)" : hasWarnings ? "rgba(245,196,81,0.3)" : "var(--adm-border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.9rem 1.25rem", flexWrap: "wrap" }}>

                      {/* Thumbnail or Badge */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: itemImg ? "rgba(0,0,0,0.3)" : "rgba(0,210,148,0.1)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden"
                      }}>
                        {itemImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={itemImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "var(--adm-mint)", fontWeight: 700, fontSize: "0.9rem" }}>
                            {listI + 1}
                          </span>
                        )}
                      </div>

                      {/* Title & Badges Info */}
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                            {title}
                          </h4>
                          {hasErrors && <span title="Has errors"><AlertTriangle size={14} color="#ff8a97" /></span>}
                          {hasWarnings && !hasErrors && <span title="Has warnings"><AlertTriangle size={14} color="#f5c451" /></span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.35rem", fontSize: "0.78rem", color: "var(--adm-text-sub)" }}>
                          {specCount > 0 && <span>⚡ {specCount} Specs</span>}
                          {photoCount > 0 && <span>📷 {photoCount} Photos</span>}
                          {Boolean(item.datasheetPdf) && <span style={{ color: "var(--adm-mint)" }}>📄 PDF Datasheet</span>}
                          {Boolean(item.series) && <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.1rem 0.4rem", borderRadius: 6 }}>{String(item.series)}</span>}
                        </div>
                      </div>

                      {/* Dynamic Action Buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <button
                          type="button"
                          title="Live Card Preview"
                          style={{ ...iconBtn, padding: "0.45rem 0.7rem", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}
                          onClick={() => setPreviewItem({ item, title })}
                        >
                          <Eye size={13} /> Preview
                        </button>
                        <button
                          type="button"
                          title="Clone / Duplicate"
                          style={{ ...iconBtn, padding: "0.45rem 0.7rem", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}
                          onClick={() => {
                            const clone = JSON.parse(JSON.stringify(item));
                            if (clone.name) clone.name = `${clone.name} (Copy)`;
                            mutate(d => ({ ...d, [col.key]: [...allItems, clone] }));
                          }}
                        >
                          <Copy size={13} /> Clone
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalItem({ item, index: i, collection: col })}
                          style={{
                            ...btnBase, padding: "0.45rem 0.85rem", fontSize: "0.78rem", background: "var(--adm-mint)", color: "#061814"
                          }}
                        >
                          Edit →
                        </button>
                        {col.canAdd && (
                          <button type="button" title="Delete" style={dangerBtn}
                            onClick={() => { if (confirm('Delete "' + title + '"?')) mutate(d => ({ ...d, [col.key]: allItems.filter((_, j) => j !== i) })); }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Floating Bottom Sticky Bar when unsaved */}
      {status === "dirty" && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9000,
          background: "#121b2d", border: "1px solid var(--adm-mint)",
          borderRadius: 30, padding: "0.6rem 1.5rem",
          boxShadow: "0 10px 30px rgba(0,210,148,0.3)",
          display: "flex", alignItems: "center", gap: "1.25rem",
          animation: "admRise 0.3s ease"
        }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f5c451" }} />
            Unsaved changes detected
          </div>
          <button
            onClick={save}
            className="adm-btn"
            style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
          >
            Save Now (Ctrl+S)
          </button>
        </div>
      )}
    </div>
  );
}
