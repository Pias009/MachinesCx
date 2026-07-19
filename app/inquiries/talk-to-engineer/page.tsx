"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { families, categories, familyImage, familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import TransitionLink from "@/components/TransitionLink";
import { ChatThread, ChoiceRow, ChoiceChip, Composer, InsightPanel, ReviewCard, ImageGallery, chatStyles, type Turn, type ReviewRow } from "@/components/ChatInquiry";

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

type Stage =
  | "machine" | "model" | "qty" | "notes" | "more-machines"
  | "want-parts" | "part-name" | "part-qty" | "part-notes" | "part-images" | "more-parts"
  | "contact" | "message" | "photos" | "review" | "sent";

function TalkToEngineerInner() {
  const searchParams = useSearchParams();

  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [draftFamily, setDraftFamily] = useState<ProductFamily | null>(null);
  const [draftModelIdx, setDraftModelIdx] = useState(0);
  const [draftQty, setDraftQty] = useState(1);
  const [draftNotes, setDraftNotes] = useState("");
  const [activeCat, setActiveCat] = useState<CategorySlug | "all">("film-blowing");
  const [machineSearch, setMachineSearch] = useState("");

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
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [companyDraft, setCompanyDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");

  const [stage, setStage] = useState<Stage>("machine");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    const slug = searchParams?.get("machine");
    if (!slug) return;
    const fam = families.find(f => f.slug === slug);
    if (!fam) return;
    setDraftFamily(fam);
    setStage(fam.models.length > 1 ? "model" : "qty");
  }, [searchParams]);

  function say(next: () => void, delay = 550) {
    setTyping(true);
    setTimeout(() => { setTyping(false); next(); }, delay);
  }

  function pickMachine(fam: ProductFamily) {
    setDraftFamily(fam);
    say(() => setStage(fam.models.length > 1 ? "model" : "qty"));
  }
  function pickModel(i: number) {
    setDraftModelIdx(i);
    say(() => setStage("qty"));
  }
  function submitQty() { say(() => setStage("notes")); }
  function submitMachineNotes() {
    if (draftFamily) {
      setMachines(prev => [...prev, { family: draftFamily, modelIdx: draftModelIdx, qty: draftQty, notes: draftNotes.trim() }]);
    }
    say(() => setStage("more-machines"));
  }
  function addAnotherMachine() {
    setDraftFamily(null); setDraftModelIdx(0); setDraftQty(1); setDraftNotes("");
    say(() => setStage("machine"));
  }
  function doneAddingMachines() { say(() => setStage("want-parts")); }
  function skipMachines() { say(() => setStage("want-parts")); }

  function wantParts(yes: boolean) {
    say(() => setStage(yes ? "part-name" : "contact"));
  }
  function submitPartName() {
    if (!partName.trim()) return;
    say(() => setStage("part-qty"));
  }
  function submitPartQty() { say(() => setStage("part-notes")); }
  function submitPartNotes() { say(() => setStage("part-images")); }
  async function uploadPartImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setPartImages(prev => [...prev, j.url]);
    } catch {
      // non-fatal — visitor can retry or continue without a photo
    } finally {
      setUploading(false);
    }
  }
  function finishPart() {
    setParts(prev => [...prev, { name: partName.trim(), machine: "", machineSlug: "", quantity: partQty, notes: partNotes.trim(), images: partImages }]);
    say(() => setStage("more-parts"));
  }
  function addAnotherPart() {
    setPartName(""); setPartQty(1); setPartNotes(""); setPartImages([]);
    say(() => setStage("part-name"));
  }
  function doneAddingParts() { say(() => setStage("contact")); }

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
      say(() => setStage("sent"), 500);
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
    { key: "name", label: "Name", value: form.name, onChange: v => setForm(f => ({ ...f, name: v })) },
    { key: "email", label: "Email", value: form.email, onChange: v => setForm(f => ({ ...f, email: v })) },
    { key: "company", label: "Company", value: form.company, placeholder: "Optional", onChange: v => setForm(f => ({ ...f, company: v })) },
    { key: "message", label: "Message", value: form.message, kind: "textarea", placeholder: "Optional", onChange: v => setForm(f => ({ ...f, message: v })) },
  ], [form]);

  const BEFORE_MACHINE = ["machine", "model", "qty", "notes"];

  const visibleMachines = useMemo(() => {
    const pool = activeCat === "all" ? families : familiesByCategory(activeCat);
    const q = machineSearch.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.series.toLowerCase().includes(q) ||
      f.models.some(m => m.toLowerCase().includes(q))
    );
  }, [activeCat, machineSearch]);

  const turns = useMemo<Turn[]>(() => {
    const t: Turn[] = [
      { id: "b0", from: "bot", content: (
        <>
          Hi! Let&apos;s build your configuration sheet together. Which machine do you want to start with? Not sure yet, or just have a general question? You can skip this and tell us in your message instead.
          <ChoiceRow>
            <ChoiceChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All machines</ChoiceChip>
            {categories.map(c => (
              <ChoiceChip key={c.slug} active={activeCat === c.slug} onClick={() => setActiveCat(c.slug as CategorySlug)}>{c.name}</ChoiceChip>
            ))}
          </ChoiceRow>
          {stage === "machine" && (
            <>
              <div className="ci-machine-search">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <input type="text" placeholder="Search machines by name or model…" value={machineSearch} onChange={e => setMachineSearch(e.target.value)} />
              </div>
              <ChoiceRow>
                {visibleMachines.map(f => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <ChoiceChip key={f.slug} onClick={() => pickMachine(f)}><img src={familyImage(f)} alt="" /> {f.name}</ChoiceChip>
                ))}
                {visibleMachines.length === 0 && (
                  <span style={{ fontSize: ".8rem", color: "var(--ink-35)" }}>No machines match &quot;{machineSearch}&quot;.</span>
                )}
              </ChoiceRow>
              <ChoiceRow>
                <ChoiceChip onClick={skipMachines}>Skip — no machine, just send a message →</ChoiceChip>
              </ChoiceRow>
            </>
          )}
        </>
      ) },
    ];

    machines.forEach((m, i) => {
      t.push({ id: `mu${i}`, from: "user", content: `${m.family.name} (${m.family.models[m.modelIdx]}) × ${m.qty}${m.notes ? ` — "${m.notes}"` : ""}` });
      t.push({ id: `mb${i}`, from: "bot", content: `Added ${m.family.name} to your sheet.` });
    });

    if (BEFORE_MACHINE.includes(stage) && draftFamily) {
      t.push({ id: "u-fam", from: "user", content: draftFamily.name });

      if (draftFamily.models.length > 1) {
        t.push({ id: "b-model", from: "bot", content: (
          <>
            Which model of the {draftFamily.name}?
            {stage === "model" && (
              <ChoiceRow>{draftFamily.models.map((mo, i) => <ChoiceChip key={mo} onClick={() => pickModel(i)}>{mo}</ChoiceChip>)}</ChoiceRow>
            )}
          </>
        ) });
      }
      if (stage === "qty" || stage === "notes") {
        t.push({ id: "u-model", from: "user", content: draftFamily.models[draftModelIdx] });
        t.push({ id: "b-qty", from: "bot", content: "How many units?" });
      }
      if (stage === "notes") {
        t.push({ id: "u-qty", from: "user", content: `${draftQty} unit${draftQty > 1 ? "s" : ""}` });
        t.push({ id: "b-notes", from: "bot", content: "Any customization — voltage, automation, certification? Leave blank if not." });
      }
    }

    if (stage === "more-machines") {
      t.push({ id: "b-more-mach", from: "bot", content: "Want to add another machine, or move on?" });
    }

    const pastMachineStage = ["want-parts", "part-name", "part-qty", "part-notes", "part-images", "more-parts", "contact", "message", "review", "sent"].includes(stage);
    if (pastMachineStage && machines.length === 0 && !draftFamily) {
      t.push({ id: "u-skip-machine", from: "user", content: "Skip — no machine, just send a message" });
    }

    if (pastMachineStage) {
      if (stage === "want-parts") {
        t.push({ id: "b-parts-q", from: "bot", content: (
          <>
            Do you want to add any specific parts to this order?
            <ChoiceRow>
              <ChoiceChip onClick={() => wantParts(true)}>Yes, add parts</ChoiceChip>
              <ChoiceChip onClick={() => wantParts(false)}>No, skip this</ChoiceChip>
            </ChoiceRow>
          </>
        ) });
      }
    }

    parts.forEach((p, i) => {
      t.push({ id: `pu${i}`, from: "user", content: `${p.name} · qty ${p.quantity}${p.notes ? ` · "${p.notes}"` : ""}` });
      t.push({ id: `pb${i}`, from: "bot", content: `Added part ${i + 1}.` });
    });

    if (stage === "part-name") {
      t.push({ id: "b-part-name", from: "bot", content: "What's the part called?" });
    }
    if (["part-qty", "part-notes", "part-images", "more-parts"].includes(stage)) {
      t.push({ id: "u-part-name", from: "user", content: partName });
    }
    if (stage === "part-qty") {
      t.push({ id: "b-part-qty", from: "bot", content: "How many do you need?" });
    }
    if (["part-notes", "part-images", "more-parts"].includes(stage)) {
      t.push({ id: "u-part-qty", from: "user", content: `${partQty} unit${partQty > 1 ? "s" : ""}` });
    }
    if (stage === "part-notes") {
      t.push({ id: "b-part-notes", from: "bot", content: "Any specs or reference numbers? Leave blank if not sure." });
    }
    if (["part-images", "more-parts"].includes(stage)) {
      t.push({ id: "u-part-notes", from: "user", content: partNotes.trim() || "No extra notes" });
    }
    if (stage === "part-images") {
      t.push({ id: "b-part-img", from: "bot", content: "Got a reference photo? Attach it — optional." });
    }
    if (stage === "more-parts") {
      t.push({ id: "u-part-img", from: "user", content: partImages.length ? `${partImages.length} photo${partImages.length > 1 ? "s" : ""} attached` : "No photos" });
      t.push({ id: "b-more-parts", from: "bot", content: "Add another part, or move on?" });
    }

    if (["contact", "message", "photos", "review", "sent"].includes(stage)) {
      t.push({ id: "b-contact", from: "bot", content: "Last step — what's your name and email so our engineer can reach you?" });
    }
    if (["message", "photos", "review", "sent"].includes(stage)) {
      t.push({ id: "u-contact", from: "user", content: `${form.name} · ${form.email}` });
      t.push({ id: "b-msg", from: "bot", content: "Anything else you'd like us to know? (optional)" });
    }
    if (["photos", "review", "sent"].includes(stage)) {
      t.push({ id: "u-msg", from: "user", content: form.message || "Nothing else" });
      t.push({ id: "b-photos", from: "bot", content: "Want to attach any reference photos? Totally optional." });
    }
    if (["review", "sent"].includes(stage)) {
      t.push({ id: "u-photos", from: "user", content: images.length ? `${images.length} photo${images.length > 1 ? "s" : ""} attached` : "No photos" });
    }
    if (stage === "review") {
      t.push({ id: "b-review", from: "bot", content: "Here's your configuration sheet — click any answer below to edit it, then send whenever you're ready." });
    }
    if (stage === "sent") {
      t.push({ id: "b-sent", from: "bot", content: <>Thanks, {form.name}! Our engineering team will review your configuration sheet and reply to {form.email} within 24 hours.</> });
    }

    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines, draftFamily, draftModelIdx, draftQty, draftNotes, parts, partName, partQty, partNotes, partImages, form, stage, activeCat, visibleMachines, images]);

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
              <div className="ci-eyebrow">Talk to an Engineer (Inquiry Send)</div>
              <h1 className="ci-h1">Build your <em>custom order.</em></h1>
            </div>

            <div className="ci-convo">
              <ChatThread turns={turns} typing={typing} />

              {stage === "qty" && (
                <Composer onSend={submitQty} sendLabel="Continue">
                  <div className="ci-qty">
                    <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="ci-qty__val">{draftQty}</span>
                    <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => q + 1)}>+</button>
                  </div>
                </Composer>
              )}

              {stage === "notes" && (
                <Composer onSend={submitMachineNotes} sendLabel="Continue">
                  <textarea rows={2} placeholder="e.g. corona treatment, special voltage, CE certification…" value={draftNotes} onChange={e => setDraftNotes(e.target.value)} />
                </Composer>
              )}

              {stage === "more-machines" && (
                <Composer onSend={doneAddingMachines} sendLabel="I'm done, continue">
                  <button type="button" onClick={addAnotherMachine}
                    style={{ padding: ".7rem 1rem", borderRadius: ".7rem", border: "1px dashed var(--brand-teal)", background: "rgba(43,191,179,.06)", color: "var(--brand-teal)", fontSize: ".85rem", cursor: "pointer", width: "100%" }}>
                    + Add another machine
                  </button>
                </Composer>
              )}

              {stage === "part-name" && (
                <Composer onSend={submitPartName} sendLabel="Continue" disabled={!partName.trim()}>
                  <input type="text" placeholder="e.g. Die Head, Screw, Barrel…" value={partName} onChange={e => setPartName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitPartName(); }} />
                </Composer>
              )}

              {stage === "part-qty" && (
                <Composer onSend={submitPartQty} sendLabel="Continue">
                  <div className="ci-qty">
                    <button type="button" className="ci-qty__btn" onClick={() => setPartQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="ci-qty__val">{partQty}</span>
                    <button type="button" className="ci-qty__btn" onClick={() => setPartQty(q => q + 1)}>+</button>
                  </div>
                </Composer>
              )}

              {stage === "part-notes" && (
                <Composer onSend={submitPartNotes} sendLabel="Continue">
                  <textarea rows={2} placeholder="Material, dimensions, reference numbers…" value={partNotes} onChange={e => setPartNotes(e.target.value)} />
                </Composer>
              )}

              {stage === "part-images" && (
                <Composer onSend={finishPart} sendLabel="Continue" disabled={uploading}>
                  <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {partImages.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--bg-line)" }} />
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ padding: ".5rem .8rem", borderRadius: ".6rem", border: "1px dashed var(--bg-line)", background: "var(--bg-raise)", color: "var(--ink-60)", fontSize: ".8rem", cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "+ Add photo"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadPartImage(f); e.target.value = ""; }} />
                  </div>
                </Composer>
              )}

              {stage === "more-parts" && (
                <Composer onSend={doneAddingParts} sendLabel="I'm done, continue">
                  <button type="button" onClick={addAnotherPart}
                    style={{ padding: ".7rem 1rem", borderRadius: ".7rem", border: "1px dashed var(--brand-teal)", background: "rgba(43,191,179,.06)", color: "var(--brand-teal)", fontSize: ".85rem", cursor: "pointer", width: "100%" }}>
                    + Add another part
                  </button>
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
                    onAdd={() => generalFileRef.current?.click()}
                    onRemove={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  />
                </Composer>
              )}

              {stage === "review" && (
                <ReviewCard
                  title="Review your configuration sheet — click any answer to edit it."
                  rows={reviewRows}
                  images={images}
                  uploading={uploading}
                  onAddImage={() => generalFileRef.current?.click()}
                  onRemoveImage={i => setImages(prev => prev.filter((_, j) => j !== i))}
                  onSend={send}
                  sending={sending}
                />
              )}
              <input ref={generalFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
            </div>
            {sendError && <div className="ci-error" role="alert">{sendError}</div>}
          </div>

          <InsightPanel
            family={insightFamily}
            modelIdx={insightModelIdx}
            related={related}
            tip={
              stage === "machine" ? { text: <>Pick as many machines as you need — you can <strong>add more</strong> before moving on.</> } :
              stage === "model" ? { text: <>Each model trades off <strong>speed vs. footprint</strong> — check the spec panel as you pick.</> } :
              stage === "want-parts" || stage.startsWith("part-") ? { text: <>Parts are optional — skip if you just need <strong>machine pricing</strong> for now.</> } :
              stage === "contact" ? { text: <>A real engineer reviews every sheet — expect a <strong>detailed reply</strong> within 24 hours.</> } :
              stage === "review" ? { text: <>Click any row in the review card to <strong>edit it</strong> — nothing sends until you press the button.</> } :
              { text: <>You can still go back and change any answer before you <strong>send</strong>.</> }
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
