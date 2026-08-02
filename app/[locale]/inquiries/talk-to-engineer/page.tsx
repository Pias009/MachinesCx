"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { families, familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, MachineGrid, EntryRow, AddAnotherButton,
  InsightPanel, ReviewCard, ImageGallery, chatStyles, type ReviewRow,
} from "@/components/ChatInquiry";
import AiReviewChat from "@/components/AiReviewChat";

interface MachineEntry {
  family: ProductFamily;
  modelIdx: number;
  qty: number;
  notes: string;
}

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

function TalkToEngineerInner() {
  const t = useTranslations("talkToEngineer");
  const tToast = useTranslations("toasts");
  const searchParams = useSearchParams();

  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [draftCat, setDraftCat] = useState<CategorySlug>("film-blowing");
  const [draftFamily, setDraftFamily] = useState<ProductFamily | null>(null);
  const [draftModelIdx, setDraftModelIdx] = useState(0);
  const [draftQty, setDraftQty] = useState(1);
  const [draftNotes, setDraftNotes] = useState("");

  const [parts, setParts] = useState<PartEntry[]>([]);
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState(1);
  const [partNotes, setPartNotes] = useState("");
  const [partImages, setPartImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const generalFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [step, setStep] = useState<"build" | "ai-review" | "details">("build");
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const slug = searchParams?.get("machine");
    if (!slug) return;
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setDraftCat(fam.category);
    setDraftFamily(fam);
  }, [searchParams]);

  // Deep-linked context from elsewhere on the site (e.g. a process-step
  // card) — prefills the message so the visitor doesn't retype what they
  // already told us, but it lands in the editable textarea, never sent
  // automatically. No machine to pick here, so this skips straight to the
  // details step rather than the machine-builder.
  useEffect(() => {
    const note = searchParams?.get("note");
    if (!note) return;
    setForm(f => ({ ...f, message: note }));
    setStep("details");
  }, [searchParams]);

  function addMachine() {
    if (!draftFamily) return;
    setMachines(prev => [...prev, { family: draftFamily, modelIdx: draftModelIdx, qty: draftQty, notes: draftNotes.trim() }]);
    setDraftFamily(null); setDraftModelIdx(0); setDraftQty(1); setDraftNotes("");
  }
  function removeMachine(i: number) {
    setMachines(prev => prev.filter((_, j) => j !== i));
  }

  async function uploadPartImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setPartImages(prev => [...prev, j.url]);
      toast.success(tToast("photoUploaded"));
    } catch {
      // non-fatal — visitor can retry or continue without a photo
      toast.error(tToast("photoUploadFailed"), { description: tToast("photoUploadFailedDesc") });
    } finally {
      setUploading(false);
    }
  }
  function addPart() {
    if (!partName.trim()) return;
    setParts(prev => [...prev, { name: partName.trim(), machine: "", machineSlug: "", quantity: partQty, notes: partNotes.trim(), images: partImages }]);
    setPartName(""); setPartQty(1); setPartNotes(""); setPartImages([]);
  }
  function removePart(i: number) {
    setParts(prev => prev.filter((_, j) => j !== i));
  }

  // ── AI review chat callbacks — the chat suggests changes, these apply them
  //    to the same machines/parts state the manual form above edits. ──────
  function aiAddMachine(slug: string) {
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setMachines(prev => [...prev, { family: fam, modelIdx: 0, qty: 1, notes: "" }]);
  }
  function aiEditMachineQty(index: number, qty: number) {
    setMachines(prev => prev.map((m, i) => (i === index ? { ...m, qty: Math.max(1, qty) } : m)));
  }
  function aiEditMachineNotes(index: number, notes: string) {
    setMachines(prev => prev.map((m, i) => (i === index ? { ...m, notes } : m)));
  }
  function aiAddPart(name: string) {
    setParts(prev => [...prev, { name, machine: "", machineSlug: "", quantity: 1, notes: "", images: [] }]);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setImages(prev => [...prev, j.url]);
      toast.success(tToast("photoUploaded"));
    } catch {
      // non-fatal — visitor can retry or continue without a photo
      toast.error(tToast("photoUploadFailed"), { description: tToast("photoUploadFailedDesc") });
    } finally {
      setUploading(false);
    }
  }

  const canReview = (machines.length > 0 || parts.length > 0) && !draftFamily && !partName.trim();

  async function send() {
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
          images,
          machines: machines.map(m => ({
            slug: m.family.slug, name: m.family.name, series: m.family.series,
            model: m.family.models[m.modelIdx], qty: m.qty, notes: m.notes,
          })),
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

  const insightFamily = draftFamily ?? machines[machines.length - 1]?.family ?? null;
  const insightModelIdx = draftFamily ? draftModelIdx : (machines[machines.length - 1]?.modelIdx ?? 0);
  const related = useMemo(() => {
    if (!insightFamily) return [];
    return familiesByCategory(insightFamily.category).filter(f => f.slug !== insightFamily.slug);
  }, [insightFamily]);

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
            {step === "build" ? (
              <TransitionLink href="/inquiries">
                <span className="ci-back">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {t("backLink")}
                </span>
              </TransitionLink>
            ) : (
              <button type="button" className="ci-back" onClick={() => setStep(step === "details" ? "ai-review" : "build")}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {step === "details" ? t("backToAiReview") : t("backToMachines")}
              </button>
            )}
            <div className="ci-heading">
              <div className="ci-eyebrow">{t("eyebrow")}</div>
              <h1 className="ci-h1">{t("titlePrefix")} <em>{t("titleEm")}</em></h1>
            </div>

            <div className="ci-convo">
              {step === "build" && (
              <Section
                title={t("machinesSection")}
                subtitle={t("machinesSubtitle")}
              >
                {machines.map((m, i) => (
                  <EntryRow
                    key={i}
                    title={`${m.family.name} (${m.family.models[m.modelIdx]}) × ${m.qty}`}
                    meta={m.notes || undefined}
                    onRemove={() => removeMachine(i)}
                  />
                ))}

                <MachineGrid
                  category={draftCat}
                  onCategory={setDraftCat}
                  family={draftFamily}
                  onFamily={setDraftFamily}
                  modelIdx={draftModelIdx}
                  onModel={setDraftModelIdx}
                />

                {draftFamily && (
                  <>
                    <div className="ci-row">
                      <Field label={t("quantity")}>
                        <div className="ci-qty">
                          <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => Math.max(1, q - 1))}>−</button>
                          <span className="ci-qty__val">{draftQty}</span>
                          <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => q + 1)}>+</button>
                        </div>
                      </Field>
                      <Field label={t("customNotes")} hint={t("customNotesHint")}>
                        <input type="text" placeholder={t("optional")} value={draftNotes} onChange={e => setDraftNotes(e.target.value)} />
                      </Field>
                    </div>
                    <AddAnotherButton onClick={addMachine}>{t("addMachineToOrder")}</AddAnotherButton>
                  </>
                )}
              </Section>
              )}

              {step === "build" && (
              <Section
                title={t("partsSection")}
                subtitle={t("partsSubtitle")}
              >
                {parts.map((p, i) => (
                  <EntryRow
                    key={i}
                    title={`${p.name} · qty ${p.quantity}`}
                    meta={[p.notes, p.images.length ? `${p.images.length} ${p.images.length > 1 ? t("photos") : t("photo")}` : ""].filter(Boolean).join(" · ") || undefined}
                    onRemove={() => removePart(i)}
                  />
                ))}

                <Field label={t("partName")} hint={t("partNameHint")}>
                  <input type="text" placeholder={t("partNamePlaceholder")} value={partName} onChange={e => setPartName(e.target.value)} />
                </Field>

                {partName.trim() && (
                  <>
                    <div className="ci-row">
                      <Field label={t("quantity")}>
                        <div className="ci-qty">
                          <button type="button" className="ci-qty__btn" onClick={() => setPartQty(q => Math.max(1, q - 1))}>−</button>
                          <span className="ci-qty__val">{partQty}</span>
                          <button type="button" className="ci-qty__btn" onClick={() => setPartQty(q => q + 1)}>+</button>
                        </div>
                      </Field>
                      <Field label={t("specsRefNumbers")}>
                        <input type="text" placeholder={t("optional")} value={partNotes} onChange={e => setPartNotes(e.target.value)} />
                      </Field>
                    </div>
                    <Field label={t("referencePhoto")}>
                      <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                        {partImages.map((src, i) => (
                          <Image key={i} src={src} alt="" width={40} height={40} style={{ objectFit: "cover", borderRadius: 8, border: "1px solid var(--bg-line)" }} />
                        ))}
                        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                          style={{ padding: ".5rem .8rem", borderRadius: ".6rem", border: "1px dashed var(--bg-line)", background: "var(--bg-raise)", color: "var(--ink-60)", fontSize: ".8rem", cursor: "pointer" }}>
                          {uploading ? t("uploading") : t("addPhoto")}
                        </button>
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadPartImage(f); e.target.value = ""; }} />
                      </div>
                    </Field>
                    <AddAnotherButton onClick={addPart}>{t("addPartToOrder")}</AddAnotherButton>
                  </>
                )}
              </Section>
              )}

              {step === "build" && (
                <div className="ci-submit-bar">
                  <button
                    type="button"
                    className="ci-submit-bar__btn"
                    disabled={!!draftFamily || !!partName.trim()}
                    onClick={() => setStep("ai-review")}
                  >
                    {t("continueButton")}
                  </button>
                </div>
              )}

              {step === "ai-review" && (
                <Section
                  title={t("aiReviewSection")}
                  subtitle={t("aiReviewSubtitle")}
                >
                  <AiReviewChat
                    machines={machines.map(m => ({ slug: m.family.slug, name: m.family.name, series: m.family.series, model: m.family.models[m.modelIdx], qty: m.qty, notes: m.notes }))}
                    parts={parts.map(p => ({ name: p.name, machine: p.machine, quantity: p.quantity, notes: p.notes }))}
                    onAddMachine={aiAddMachine}
                    onEditMachineQty={aiEditMachineQty}
                    onEditMachineNotes={aiEditMachineNotes}
                    onAddPart={aiAddPart}
                    onContinue={() => setStep("details")}
                  />
                </Section>
              )}

              {step === "details" && (
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
                <Field label={t("referencePhotos")}>
                  <ImageGallery
                    images={images}
                    uploading={uploading}
                    onAdd={() => generalFileRef.current?.click()}
                    onRemove={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  />
                </Field>
                <input ref={generalFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </Section>
              )}

              {step === "details" && sendError && <div className="ci-error" role="alert">{sendError}</div>}

              {step === "details" && (!reviewing ? (
                <div className="ci-submit-bar">
                  <button
                    type="button"
                    className="ci-submit-bar__btn"
                    disabled={!form.name.trim() || !form.email.trim()}
                    onClick={() => setReviewing(true)}
                  >
                    {t("reviewButton")}
                  </button>
                </div>
              ) : (
                <ReviewCard
                  title={t("reviewTitle")}
                  rows={reviewRows}
                  images={images}
                  uploading={uploading}
                  onAddImage={() => generalFileRef.current?.click()}
                  onRemoveImage={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  onSend={send}
                  sending={sending}
                />
              ))}
            </div>
          </div>

          <InsightPanel
            family={insightFamily}
            modelIdx={insightModelIdx}
            related={related}
            tip={
              machines.length === 0 && parts.length === 0 ? { text: <>{t("tipEmpty")}</> } :
              canReview ? { text: <>{t("tipReady")}</> } :
              { text: <>{t("tipDefault")}</> }
            }
          />
        </div>
      </div>
    </>
  );
}

export default function TalkToEngineerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-base)" }} />}>
      <TalkToEngineerInner />
    </Suspense>
  );
}
