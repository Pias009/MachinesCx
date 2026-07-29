"use client";
import { Suspense, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, MachinePicker, EntryRow, AddAnotherButton,
  InsightPanel, ReviewCard, chatStyles, type ReviewRow,
} from "@/components/ChatInquiry";

interface PartEntry {
  name: string;
  machine: string;
  machineSlug: string;
  quantity: number;
  notes: string;
  images: string[];
}

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

const EMPTY_FORM: FormData = { name: "", company: "", email: "", phone: "", country: "", message: "" };

function PartsInquiryInner() {
  const t = useTranslations("partsInquiry");
  const tToast = useTranslations("toasts");
  const [parts, setParts] = useState<PartEntry[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftCat, setDraftCat] = useState<CategorySlug>("film-blowing");
  const [draftMachine, setDraftMachine] = useState<ProductFamily | null>(null);
  const [draftModelIdx, setDraftModelIdx] = useState(0);
  const [draftQty, setDraftQty] = useState(1);
  const [draftNotes, setDraftNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setDraftImages(prev => [...prev, j.url]);
      toast.success(tToast("photoUploaded"));
    } catch {
      // upload errors are non-fatal — the visitor can retry or continue without a photo
      toast.error(tToast("photoUploadFailed"), { description: tToast("photoUploadFailedDesc") });
    } finally {
      setUploading(false);
    }
  }

  function addPart() {
    if (!draftName.trim()) return;
    setParts(prev => [...prev, {
      name: draftName.trim(), machine: draftMachine?.name ?? "", machineSlug: draftMachine?.slug ?? "",
      quantity: draftQty, notes: draftNotes.trim(), images: draftImages,
    }]);
    setDraftName(""); setDraftMachine(null); setDraftModelIdx(0); setDraftQty(1); setDraftNotes(""); setDraftImages([]);
  }
  function removePart(i: number) {
    setParts(prev => prev.filter((_, j) => j !== i));
  }

  async function send() {
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
          parts: parts.map(p => ({
            name: p.name, machine: p.machine, machineSlug: p.machineSlug,
            quantity: p.quantity, notes: p.notes, images: p.images,
          })),
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
    if (!draftMachine) return [];
    return familiesByCategory(draftMachine.category).filter(f => f.slug !== draftMachine.slug);
  }, [draftMachine]);

  const reviewRows = useMemo<ReviewRow[]>(() => [
    { key: "name", label: t("reviewRows.name"), value: form.name, onChange: v => setForm(f => ({ ...f, name: v })) },
    { key: "email", label: t("reviewRows.email"), value: form.email, onChange: v => setForm(f => ({ ...f, email: v })) },
    { key: "company", label: t("reviewRows.company"), value: form.company, placeholder: t("optional"), onChange: v => setForm(f => ({ ...f, company: v })) },
    { key: "message", label: t("reviewRows.message"), value: form.message, kind: "textarea", placeholder: t("optional"), onChange: v => setForm(f => ({ ...f, message: v })) },
  ], [form, t]);

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
              <h1 className="ci-success__title">{t("successTitle", { name: form.name })}</h1>
              <p className="ci-success__sub">{t("successSub", { email: form.email })}</p>
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
                {t("backLink")}
              </span>
            </TransitionLink>
            <div className="ci-heading">
              <div className="ci-eyebrow">{t("eyebrow")}</div>
              <h1 className="ci-h1">{t("titlePrefix")} <em>{t("titleEm")}</em></h1>
            </div>

            <div className="ci-convo">
              <Section title={t("partsSection")} subtitle={t("partsSubtitle")}>
                {parts.map((p, i) => (
                  <EntryRow
                    key={i}
                    title={`${p.name} — ${p.machine || t("noMachineSpecified")} · qty ${p.quantity}`}
                    meta={[p.notes, p.images.length ? `${p.images.length} ${p.images.length > 1 ? t("photos") : t("photo")}` : ""].filter(Boolean).join(" · ") || undefined}
                    onRemove={() => removePart(i)}
                  />
                ))}

                <Field label={t("partName")} hint={t("partNameHint")}>
                  <input type="text" value={draftName} onChange={e => setDraftName(e.target.value)} />
                </Field>

                <Field label={t("machine")} hint={t("machineHint")}>
                  <MachinePicker
                    category={draftCat}
                    onCategory={setDraftCat}
                    family={draftMachine}
                    onFamily={setDraftMachine}
                    modelIdx={draftModelIdx}
                    onModel={setDraftModelIdx}
                    allowNone
                    noneLabel={t("notSureSkip")}
                  />
                </Field>

                <div className="ci-row">
                  <Field label={t("quantity")}>
                    <div className="ci-qty">
                      <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => Math.max(1, q - 1))}>−</button>
                      <span className="ci-qty__val">{draftQty}</span>
                      <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => q + 1)}>+</button>
                    </div>
                  </Field>
                  <Field label={t("specsRefNumbers")}>
                    <input type="text" placeholder={t("optional")} value={draftNotes} onChange={e => setDraftNotes(e.target.value)} />
                  </Field>
                </div>

                <Field label={t("referencePhoto")} hint={t("referencePhotoHint")}>
                  <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {draftImages.map((src, i) => (
                      <Image key={i} src={src} alt="" width={40} height={40} style={{ objectFit: "cover", borderRadius: 8, border: "1px solid var(--bg-line)" }} />
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ padding: ".5rem .8rem", borderRadius: ".6rem", border: "1px dashed var(--bg-line)", background: "var(--bg-raise)", color: "var(--ink-60)", fontSize: ".8rem", cursor: "pointer" }}>
                      {uploading ? t("uploading") : t("addPhoto")}
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                  </div>
                </Field>

                <AddAnotherButton onClick={addPart}>{t("addThisPart")}</AddAnotherButton>
              </Section>

              <Section title={t("yourDetails")}>
                <div className="ci-row">
                  <Field label={t("name")} required>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </Field>
                  <Field label={t("email")} required>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </Field>
                </div>
                <div className="ci-row">
                  <Field label={t("company")}>
                    <input type="text" placeholder={t("optional")} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  </Field>
                  <Field label={t("phone")}>
                    <input type="tel" placeholder={t("optional")} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </Field>
                </div>
                <Field label={t("message")} hint={t("messageHint")}>
                  <textarea rows={3} placeholder={t("optional")} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </Field>
              </Section>

              {sendError && <div className="ci-error" role="alert">{sendError}</div>}

              {!reviewing ? (
                <div className="ci-submit-bar">
                  <button
                    type="button"
                    className="ci-submit-bar__btn"
                    disabled={parts.length === 0 || !form.name.trim() || !form.email.trim()}
                    onClick={() => setReviewing(true)}
                  >
                    {t("reviewButton")}
                  </button>
                </div>
              ) : (
                <ReviewCard
                  title={<>{t("reviewTitlePrefix")} <strong>{parts.length} {parts.length > 1 ? t("reviewTitleParts") : t("reviewTitlePart")}</strong>{t("reviewTitleSuffix")}</>}
                  rows={reviewRows}
                  onSend={send}
                  sending={sending}
                />
              )}
            </div>
          </div>

          <InsightPanel
            family={draftMachine}
            modelIdx={draftModelIdx}
            related={related}
            tip={
              parts.length === 0 ? { text: <>{t("tipNoParts")}</> } :
              { text: <>{t("tipWithParts")}</> }
            }
          />
        </div>
      </div>
    </>
  );
}

export default function PartsInquiryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-base)" }} />}>
      <PartsInquiryInner />
    </Suspense>
  );
}
