"use client";
import { Suspense, useMemo, useRef, useState } from "react";
import { families, familyImage, familiesByCategory, type ProductFamily } from "@/lib/products";
import TransitionLink from "@/components/TransitionLink";
import { ChatThread, ChoiceRow, ChoiceChip, Composer, InsightPanel, ReviewCard, chatStyles, type Turn, type ReviewRow } from "@/components/ChatInquiry";

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

type Stage = "part-name" | "part-machine" | "part-qty" | "part-notes" | "part-images" | "more" | "contact" | "message" | "review" | "sent";

function PartsInquiryInner() {
  const [parts, setParts] = useState<PartEntry[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftMachine, setDraftMachine] = useState<ProductFamily | null>(null);
  const [draftQty, setDraftQty] = useState(1);
  const [draftNotes, setDraftNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [companyDraft, setCompanyDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");

  const [stage, setStage] = useState<Stage>("part-name");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  function say(next: () => void, delay = 550) {
    setTyping(true);
    setTimeout(() => { setTyping(false); next(); }, delay);
  }

  function submitPartName() {
    if (!draftName.trim()) return;
    say(() => setStage("part-machine"));
  }

  function pickMachine(fam: ProductFamily | null) {
    setDraftMachine(fam);
    say(() => setStage("part-qty"));
  }

  function submitQty() {
    say(() => setStage("part-notes"));
  }

  function submitNotes() {
    say(() => setStage("part-images"));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setDraftImages(prev => [...prev, j.url]);
    } catch {
      // upload errors are non-fatal — the visitor can retry or continue without a photo
    } finally {
      setUploading(false);
    }
  }

  function finishPart() {
    setParts(prev => [...prev, {
      name: draftName.trim(), machine: draftMachine?.name ?? "", machineSlug: draftMachine?.slug ?? "",
      quantity: draftQty, notes: draftNotes.trim(), images: draftImages,
    }]);
    say(() => setStage("more"));
  }

  function addAnotherPart() {
    setDraftName(""); setDraftMachine(null); setDraftQty(1); setDraftNotes(""); setDraftImages([]);
    say(() => setStage("part-name"));
  }

  function doneAddingParts() {
    say(() => setStage("contact"));
  }

  function submitContact() {
    if (!nameDraft.trim() || !emailDraft.trim()) return;
    setForm(f => ({ ...f, name: nameDraft.trim(), email: emailDraft.trim(), company: companyDraft.trim() }));
    say(() => setStage("message"));
  }

  function submitMessage() {
    setForm(f => ({ ...f, message: messageDraft.trim() }));
    say(() => setStage("review"), 650);
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
      say(() => setStage("sent"), 500);
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

  function patchPart(i: number, patch: Partial<PartEntry>) {
    setParts(prev => prev.map((p, j) => j === i ? { ...p, ...patch } : p));
  }

  const reviewRows = useMemo<ReviewRow[]>(() => {
    const rows: ReviewRow[] = [];
    parts.forEach((p, i) => {
      rows.push({ key: `part-name-${i}`, label: `Part ${i + 1}`, value: p.name, onChange: v => patchPart(i, { name: v }) });
      rows.push({ key: `part-qty-${i}`, label: `Qty`, value: String(p.quantity), onChange: v => patchPart(i, { quantity: Math.max(1, parseInt(v, 10) || 1) }) });
      rows.push({ key: `part-notes-${i}`, label: `Notes`, value: p.notes, kind: "textarea", placeholder: "Specs, dimensions…", onChange: v => patchPart(i, { notes: v }) });
    });
    rows.push(
      { key: "name", label: "Name", value: form.name, onChange: v => setForm(f => ({ ...f, name: v })) },
      { key: "email", label: "Email", value: form.email, onChange: v => setForm(f => ({ ...f, email: v })) },
      { key: "company", label: "Company", value: form.company, placeholder: "Optional", onChange: v => setForm(f => ({ ...f, company: v })) },
      { key: "message", label: "Message", value: form.message, kind: "textarea", placeholder: "Optional", onChange: v => setForm(f => ({ ...f, message: v })) },
    );
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, form]);

  const turns = useMemo<Turn[]>(() => {
    const t: Turn[] = [
      { id: "b0", from: "bot", content: "Hi! Tell me about the part you need — name it, and I'll help you attach the right machine, quantity, and photos." },
    ];

    parts.forEach((p, i) => {
      t.push({ id: `pu${i}`, from: "user", content: (
        <>{p.name} — {p.machine || "no machine specified"} · qty {p.quantity}{p.notes ? ` · "${p.notes}"` : ""}{p.images.length ? ` · ${p.images.length} photo${p.images.length > 1 ? "s" : ""}` : ""}</>
      ) });
      t.push({ id: `pb${i}`, from: "bot", content: `Got it — part ${i + 1} added.` });
    });

    if (stage === "part-name") {
      t.push({ id: "b1", from: "bot", content: "What's the part called? (e.g. Die Head, Screw, Barrel, Heating Element)" });
    }
    if (!["part-name"].includes(stage)) {
      const currentPartIdx = parts.length;
      t.push({ id: `u-name-${currentPartIdx}`, from: "user", content: draftName });
    }

    if (stage === "part-machine") {
      t.push({ id: "b2", from: "bot", content: (
        <>
          Which machine is this part for? (optional — pick one or skip)
          <ChoiceRow>
            <ChoiceChip onClick={() => pickMachine(null)}>Not sure / skip</ChoiceChip>
            {families.slice(0, 8).map(f => (
              // eslint-disable-next-line @next/next/no-img-element
              <ChoiceChip key={f.slug} onClick={() => pickMachine(f)}><img src={familyImage(f)} alt="" /> {f.name}</ChoiceChip>
            ))}
          </ChoiceRow>
        </>
      ) });
    }
    if (!["part-name", "part-machine"].includes(stage)) {
      t.push({ id: "u-machine", from: "user", content: draftMachine?.name ?? "Not sure / skip" });
    }

    if (stage === "part-qty") {
      t.push({ id: "b3", from: "bot", content: "How many do you need?" });
    }
    if (!["part-name", "part-machine", "part-qty"].includes(stage)) {
      t.push({ id: "u-qty", from: "user", content: `${draftQty} unit${draftQty > 1 ? "s" : ""}` });
    }

    if (stage === "part-notes") {
      t.push({ id: "b4", from: "bot", content: "Any specs, dimensions, or reference numbers? Leave blank if not sure." });
    }
    if (!["part-name", "part-machine", "part-qty", "part-notes"].includes(stage)) {
      t.push({ id: "u-notes", from: "user", content: draftNotes.trim() || "No extra notes" });
    }

    if (stage === "part-images") {
      t.push({ id: "b5", from: "bot", content: "Got a photo of the part or where it fits? Attach it — totally optional." });
    }
    if (stage === "more" || stage === "contact" || stage === "message" || stage === "review" || stage === "sent") {
      t.push({ id: "u-images", from: "user", content: draftImages.length ? `${draftImages.length} photo${draftImages.length > 1 ? "s" : ""} attached` : "No photos" });
    }

    if (stage === "more") {
      t.push({ id: "b6", from: "bot", content: "Need anything else, or ready to send this?" });
    }

    if (stage === "contact" || stage === "message" || stage === "review" || stage === "sent") {
      t.push({ id: "b7", from: "bot", content: "What's your name and email so we can reach you?" });
    }
    if (stage === "message" || stage === "review" || stage === "sent") {
      t.push({ id: "u7", from: "user", content: `${form.name} · ${form.email}` });
    }

    if (stage === "message" || stage === "review" || stage === "sent") {
      t.push({ id: "b8", from: "bot", content: "Anything else you'd like us to know? (optional)" });
    }
    if (stage === "review" || stage === "sent") {
      t.push({ id: "u8", from: "user", content: form.message || "Nothing else" });
    }

    if (stage === "review") {
      t.push({ id: "b9", from: "bot", content: (
        <>Here&apos;s your parts inquiry — <strong>{parts.length} part{parts.length > 1 ? "s" : ""}</strong>. Click any answer below to edit it, then send whenever you&apos;re ready.</>
      ) });
    }

    if (stage === "sent") {
      t.push({ id: "b10", from: "bot", content: <>Thanks, {form.name}! Our team will review your parts list and reply to {form.email} within 24 hours.</> });
    }

    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, draftName, draftMachine, draftQty, draftNotes, draftImages, form, stage]);

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
              <div className="ci-eyebrow">Part Inquiry</div>
              <h1 className="ci-h1">Need a <em>spare part?</em></h1>
            </div>

            <div className="ci-convo">
              <ChatThread turns={turns} typing={typing} />

              {stage === "part-name" && (
                <Composer onSend={submitPartName} sendLabel="Continue" disabled={!draftName.trim()}>
                  <input type="text" placeholder="e.g. Die Head, Screw, Barrel…" value={draftName} onChange={e => setDraftName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitPartName(); }} />
                </Composer>
              )}

              {stage === "part-qty" && (
                <Composer onSend={submitQty} sendLabel="Continue">
                  <div className="ci-qty">
                    <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="ci-qty__val">{draftQty}</span>
                    <button type="button" className="ci-qty__btn" onClick={() => setDraftQty(q => q + 1)}>+</button>
                  </div>
                </Composer>
              )}

              {stage === "part-notes" && (
                <Composer onSend={submitNotes} sendLabel="Continue">
                  <textarea rows={2} placeholder="Material, dimensions, reference numbers…" value={draftNotes} onChange={e => setDraftNotes(e.target.value)} />
                </Composer>
              )}

              {stage === "part-images" && (
                <Composer onSend={finishPart} sendLabel="Continue" disabled={uploading}>
                  <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {draftImages.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--bg-line)" }} />
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ padding: ".5rem .8rem", borderRadius: ".6rem", border: "1px dashed var(--bg-line)", background: "var(--bg-raise)", color: "var(--ink-60)", fontSize: ".8rem", cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "+ Add photo"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                  </div>
                </Composer>
              )}

              {stage === "more" && (
                <Composer onSend={doneAddingParts} sendLabel="I'm done, review my order">
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

              {stage === "review" && (
                <ReviewCard
                  title={<>Review your parts inquiry — click any answer to edit it.</>}
                  rows={reviewRows}
                  onSend={send}
                  sending={sending}
                />
              )}
            </div>
            {sendError && <div className="ci-error" role="alert">{sendError}</div>}
          </div>

          <InsightPanel
            family={draftMachine}
            related={related}
            tip={
              stage === "part-name" ? { text: <>Use the name printed on the part itself if you have it — <strong>exact terms</strong> help our engineers match it faster.</> } :
              stage === "part-machine" ? { text: <>Not sure which machine? <strong>Skip is fine</strong> — a reference photo usually tells us everything we need.</> } :
              stage === "part-images" ? { text: <>A photo showing the part <strong>in place</strong> (not just the part alone) helps us confirm fit.</> } :
              stage === "review" ? { text: <>Click any row in the review card to <strong>edit it</strong> — nothing sends until you press the button.</> } :
              { text: <>You can add as many parts as you need before sending — nothing sends until you press <strong>send inquiry</strong>.</> }
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
