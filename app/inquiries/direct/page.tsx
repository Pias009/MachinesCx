"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { families, familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, MachinePicker,
  InsightPanel, ReviewCard, ImageGallery, chatStyles, type ReviewRow,
} from "@/components/ChatInquiry";

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

const EMPTY_FORM: FormData = { name: "", company: "", email: "", phone: "", country: "", message: "" };

function DirectInquiryInner() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<CategorySlug>("film-blowing");
  const [family, setFamily] = useState<ProductFamily | null>(null);
  const [modelIdx, setModelIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const slug = searchParams?.get("machine");
    if (!slug) return;
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setCategory(fam.category);
    setFamily(fam);
  }, [searchParams]);

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setImages(prev => [...prev, j.url]);
    } catch {
      // non-fatal — visitor can retry or continue without a photo
    } finally {
      setUploading(false);
    }
  }

  async function send() {
    if (!family) return;
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
          machines: [{
            slug: family.slug, name: family.name, series: family.series,
            model: family.models[modelIdx], qty, notes, images,
          }],
          source: typeof window !== "undefined" ? (sessionStorage.getItem("cx_source") ?? "direct") : "direct",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send inquiry");
      }
      if (form.email) {
        localStorage.setItem("cx_inquiry_email", form.email.trim().toLowerCase());
        localStorage.setItem("cx_inquiry_lastSeen", new Date().toISOString());
      }
      setSent(true);
    } catch (e) {
      setSendError((e as Error).message || "Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  const related = useMemo(() => {
    if (!family) return [];
    return familiesByCategory(family.category).filter(f => f.slug !== family.slug);
  }, [family]);

  const reviewRows = useMemo<ReviewRow[]>(() => [
    { key: "qty", label: "Quantity", value: String(qty), onChange: v => setQty(Math.max(1, parseInt(v, 10) || 1)) },
    { key: "notes", label: "Notes", value: notes, kind: "textarea", placeholder: "Any customization notes", onChange: setNotes },
    { key: "name", label: "Name", value: form.name, onChange: v => setForm(f => ({ ...f, name: v })) },
    { key: "email", label: "Email", value: form.email, onChange: v => setForm(f => ({ ...f, email: v })) },
    { key: "company", label: "Company", value: form.company, placeholder: "Optional", onChange: v => setForm(f => ({ ...f, company: v })) },
    { key: "message", label: "Message", value: form.message, kind: "textarea", placeholder: "Optional", onChange: v => setForm(f => ({ ...f, message: v })) },
  ], [qty, notes, form]);

  if (sent) {
    return (
      <>
        <style suppressHydrationWarning>{chatStyles}</style>
        <div className="ci-page">
          <div className="ci-shell" style={{ gridTemplateColumns: "1fr" }}>
            <div className="ci-success">
              <div className="ci-success__icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="var(--brand-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h1 className="ci-success__title">Thanks, {form.name}!</h1>
              <p className="ci-success__sub">Our team will review this and reply to {form.email} within 24 hours.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{chatStyles}</style>
      <div className="ci-page">
        <div className="ci-shell">
          <div>
            <TransitionLink href="/inquiries">
              <span className="ci-back">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                All inquiry types
              </span>
            </TransitionLink>
            <div className="ci-heading">
              <div className="ci-eyebrow">Direct Inquiry</div>
              <h1 className="ci-h1">Quick <em>machine inquiry.</em></h1>
            </div>

            <div className="ci-convo">
              <Section title="Machine">
                <MachinePicker
                  category={category}
                  onCategory={setCategory}
                  family={family}
                  onFamily={setFamily}
                  modelIdx={modelIdx}
                  onModel={setModelIdx}
                />
                <div className="ci-row">
                  <Field label="Quantity">
                    <div className="ci-qty">
                      <button type="button" className="ci-qty__btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span className="ci-qty__val">{qty}</span>
                      <button type="button" className="ci-qty__btn" onClick={() => setQty(q => q + 1)}>+</button>
                    </div>
                  </Field>
                  <Field label="Customization notes" hint="Voltage, automation, certification…">
                    <input type="text" placeholder="Optional" value={notes} onChange={e => setNotes(e.target.value)} />
                  </Field>
                </div>
              </Section>

              <Section title="Your details">
                <div className="ci-row">
                  <Field label="Name" required>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </Field>
                </div>
                <div className="ci-row">
                  <Field label="Company">
                    <input type="text" placeholder="Optional" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" placeholder="Optional" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Message" hint="Anything else you'd like us to know?">
                  <textarea rows={3} placeholder="Optional" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </Field>
                <Field label="Reference photos">
                  <ImageGallery
                    images={images}
                    uploading={uploading}
                    onAdd={() => fileRef.current?.click()}
                    onRemove={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  />
                </Field>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </Section>

              {sendError && <div className="ci-error" role="alert">{sendError}</div>}

              {!reviewing ? (
                <div className="ci-submit-bar">
                  <button
                    type="button"
                    className="ci-submit-bar__btn"
                    disabled={!family || !form.name.trim() || !form.email.trim()}
                    onClick={() => setReviewing(true)}
                  >
                    Review inquiry →
                  </button>
                </div>
              ) : (
                <ReviewCard
                  title={<>Review your inquiry for <strong>{family?.name}</strong> ({family?.models[modelIdx]}).</>}
                  rows={reviewRows}
                  images={images}
                  uploading={uploading}
                  onAddImage={() => fileRef.current?.click()}
                  onRemoveImage={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  onSend={send}
                  sending={sending}
                />
              )}
            </div>
          </div>

          <InsightPanel
            family={family}
            modelIdx={modelIdx}
            related={related}
            tip={
              !family ? { text: <>Not sure which line fits? <strong>Pick a category</strong> above to browse machines.</> } :
              { text: <>Mention your <strong>target output (kg/h)</strong> and film type in notes — it helps us size the right model fast.</> }
            }
          />
        </div>
      </div>
    </>
  );
}

export default function DirectInquiryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-base)" }} />}>
      <DirectInquiryInner />
    </Suspense>
  );
}
