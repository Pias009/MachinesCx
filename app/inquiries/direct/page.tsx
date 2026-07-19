"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { families, categories, familyImage, familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import TransitionLink from "@/components/TransitionLink";
import { ChatThread, ChoiceRow, ChoiceChip, Composer, InsightPanel, ReviewCard, ImageGallery, chatStyles, type Turn, type ReviewRow } from "@/components/ChatInquiry";

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

const EMPTY_FORM: FormData = { name: "", company: "", email: "", phone: "", country: "", message: "" };

type Stage = "machine" | "model" | "qty" | "notes" | "contact" | "message" | "photos" | "review" | "sent";

function DirectInquiryInner() {
  const searchParams = useSearchParams();
  const [family, setFamily] = useState<ProductFamily | null>(null);
  const [modelIdx, setModelIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeCat, setActiveCat] = useState<CategorySlug>("film-blowing");
  const [stage, setStage] = useState<Stage>("machine");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // draft values for the composer, committed into a bubble on send
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [companyDraft, setCompanyDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");

  useEffect(() => {
    const slug = searchParams?.get("machine");
    if (!slug) return;
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setFamily(fam);
    setStage(fam.models.length > 1 ? "model" : "qty");
  }, [searchParams]);

  function say(next: () => void, delay = 550) {
    setTyping(true);
    setTimeout(() => { setTyping(false); next(); }, delay);
  }

  function pickMachine(fam: ProductFamily) {
    setFamily(fam);
    say(() => setStage(fam.models.length > 1 ? "model" : "qty"));
  }

  function pickModel(i: number) {
    setModelIdx(i);
    say(() => setStage("qty"));
  }

  function submitQty() {
    say(() => setStage("notes"));
  }

  function submitNotes() {
    say(() => setStage("contact"));
  }

  function submitContact() {
    if (!nameDraft.trim() || !emailDraft.trim()) return;
    setForm(f => ({ ...f, name: nameDraft.trim(), email: emailDraft.trim(), company: companyDraft.trim() }));
    say(() => setStage("message"));
  }

  function submitMessage() {
    setForm(f => ({ ...f, message: messageDraft.trim() }));
    say(() => setStage("photos"));
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
    } catch {
      // non-fatal — visitor can retry or continue without a photo
    } finally {
      setUploading(false);
    }
  }

  function submitPhotos() {
    say(() => setStage("review"), 650);
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
      say(() => setStage("sent"), 500);
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

  const turns = useMemo<Turn[]>(() => {
    const t: Turn[] = [
      { id: "b0", from: "bot", content: (
        <>
          Hey! I&apos;m here to send your inquiry straight to our team. Which machine are you interested in?
          <ChoiceRow>
            {categories.map(c => (
              <ChoiceChip key={c.slug} active={activeCat === c.slug} onClick={() => setActiveCat(c.slug as CategorySlug)}>
                {c.name}
              </ChoiceChip>
            ))}
          </ChoiceRow>
          {stage === "machine" && (
            <ChoiceRow>
              {familiesByCategory(activeCat).map(f => (
                // eslint-disable-next-line @next/next/no-img-element
                <ChoiceChip key={f.slug} onClick={() => pickMachine(f)}>
                  <img src={familyImage(f)} alt="" /> {f.name}
                </ChoiceChip>
              ))}
            </ChoiceRow>
          )}
        </>
      ) },
    ];

    if (family) {
      t.push({ id: "u0", from: "user", content: family.name });

      if (family.models.length > 1) {
        t.push({ id: "b1", from: "bot", content: (
          <>
            Nice pick. Which model of the {family.name}?
            {stage === "model" && (
              <ChoiceRow>
                {family.models.map((m, i) => <ChoiceChip key={m} onClick={() => pickModel(i)}>{m}</ChoiceChip>)}
              </ChoiceRow>
            )}
          </>
        ) });
      }
      if (stage !== "machine" && stage !== "model") {
        t.push({ id: "u1", from: "user", content: family.models[modelIdx] });
      }
    }

    if (stage === "qty" || (family && !["machine", "model"].includes(stage))) {
      t.push({ id: "b2", from: "bot", content: "How many units do you need?" });
    }
    if (!["machine", "model", "qty"].includes(stage)) {
      t.push({ id: "u2", from: "user", content: `${qty} unit${qty > 1 ? "s" : ""}` });
    }

    if (stage === "notes" || !["machine", "model", "qty", "notes"].includes(stage)) {
      t.push({ id: "b3", from: "bot", content: "Anything to customize — voltage, automation level, certification? Leave blank if not." });
    }
    if (!["machine", "model", "qty", "notes"].includes(stage)) {
      t.push({ id: "u3", from: "user", content: notes.trim() || "No special requirements" });
    }

    if (stage === "contact" || !["machine", "model", "qty", "notes", "contact"].includes(stage)) {
      t.push({ id: "b4", from: "bot", content: "Almost done — what's your name and email so we can reach you?" });
    }
    if (!["machine", "model", "qty", "notes", "contact"].includes(stage)) {
      t.push({ id: "u4", from: "user", content: `${form.name} · ${form.email}` });
    }

    if (["message", "photos", "review", "sent"].includes(stage)) {
      t.push({ id: "b5", from: "bot", content: "Anything else you'd like us to know? (optional)" });
    }
    if (["photos", "review", "sent"].includes(stage)) {
      t.push({ id: "u5", from: "user", content: form.message || "Nothing else" });
    }

    if (["photos", "review", "sent"].includes(stage)) {
      t.push({ id: "b6", from: "bot", content: "Want to attach any reference photos? Totally optional." });
    }
    if (["review", "sent"].includes(stage)) {
      t.push({ id: "u6", from: "user", content: images.length ? `${images.length} photo${images.length > 1 ? "s" : ""} attached` : "No photos" });
    }

    if (stage === "review") {
      t.push({ id: "b7", from: "bot", content: "Here's everything — click any answer below to edit it, then send whenever you're ready." });
    }

    if (stage === "sent") {
      t.push({ id: "b8", from: "bot", content: (
        <>Thanks, {form.name}! Our team will review this and reply to {form.email} within 24 hours.</>
      ) });
    }

    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family, modelIdx, qty, notes, form, stage, activeCat, images]);

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
              <ChatThread turns={turns} typing={typing} />

              {stage === "qty" && (
                <Composer onSend={submitQty} sendLabel="Continue">
                  <div className="ci-qty">
                    <button type="button" className="ci-qty__btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="ci-qty__val">{qty}</span>
                    <button type="button" className="ci-qty__btn" onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                </Composer>
              )}

              {stage === "notes" && (
                <Composer onSend={submitNotes} sendLabel="Continue">
                  <textarea rows={2} placeholder="e.g. corona treatment, special voltage, CE certification…" value={notes} onChange={e => setNotes(e.target.value)} />
                </Composer>
              )}

              {stage === "contact" && (
                <Composer onSend={submitContact} sendLabel="Continue" disabled={!nameDraft.trim() || !emailDraft.trim()}>
                  <div className="ci-composer__grid">
                    <input type="text" placeholder="Your name *" value={nameDraft} onChange={e => setNameDraft(e.target.value)} />
                    <input type="email" placeholder="Email *" value={emailDraft} onChange={e => setEmailDraft(e.target.value)} />
                  </div>
                </Composer>
              )}

              {stage === "message" && (
                <Composer onSend={submitMessage} sendLabel="Continue">
                  <textarea rows={2} placeholder="Optional — anything else to add" value={messageDraft} onChange={e => setMessageDraft(e.target.value)} />
                </Composer>
              )}

              {stage === "photos" && (
                <Composer onSend={submitPhotos} sendLabel="Continue" disabled={uploading}>
                  <ImageGallery
                    images={images}
                    uploading={uploading}
                    onAdd={() => fileRef.current?.click()}
                    onRemove={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  />
                </Composer>
              )}

              {stage === "review" && (
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
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
            </div>
            {sendError && <div className="ci-error" role="alert">{sendError}</div>}
          </div>

          <InsightPanel
            family={family}
            modelIdx={modelIdx}
            related={related}
            tip={
              stage === "machine" ? { text: <>Not sure which line fits? <strong>Pick a category</strong> above to browse — you can switch anytime before sending.</> } :
              stage === "model" ? { text: <>Each model trades off <strong>speed vs. footprint</strong> — check the spec panel on the left as you pick.</> } :
              stage === "qty" ? { text: <>Ordering more than one line? We can quote <strong>volume pricing</strong> — just say so in the notes step.</> } :
              stage === "notes" ? { text: <>Mention your <strong>target output (kg/h)</strong> and film type — it helps us size the right model fast.</> } :
              stage === "contact" ? { text: <>We reply from a <strong>real engineer</strong>, not a bot — expect a detailed answer within 24 hours.</> } :
              stage === "review" ? { text: <>Click any row in the review card to <strong>edit it</strong> before sending — nothing sends until you press the button.</> } :
              { text: <>Double-check the <strong>quantity and model</strong> above — you can still go back and change your answers.</> }
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
