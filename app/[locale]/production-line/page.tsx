"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { families, familiesByCategory, familyImage, categories, type ProductFamily, type CategorySlug } from "@/lib/products";
import { lineTemplates, lineTemplateById, type LineTemplate } from "@/lib/productionLineTemplates";
import { evaluateLineStatus, type LineStatus } from "@/lib/lineStatus";
import LineTemplateShowcase from "@/components/LineTemplateShowcase";
import {
  Field, Section, EntryRow, AddAnotherButton,
  InsightPanel, ReviewCard, ImageGallery, LineSummaryCard, chatStyles, type ReviewRow, type SummaryMachine,
} from "@/components/ChatInquiry";
import AiReviewChat from "@/components/AiReviewChat";

interface MachineEntry {
  family: ProductFamily;
  modelIdx: number;
  qty: number;
  notes: string;
  stage?: string; // carried over from a template's step label, if this entry came from one
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
  name: string; company: string; email: string; phone: string; country: string; message: string;
}
const EMPTY_FORM: FormData = { name: "", company: "", email: "", phone: "", country: "", message: "" };

type View = "hub" | "template" | "custom";
type CustomStep = "process" | "machine" | "ai-review" | "summary" | "details";

function ProductionLineInner() {
  const t = useTranslations("productionLineBuilder");
  const tToast = useTranslations("toasts");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = useState<View>("hub");
  const [selectedTemplate, setSelectedTemplate] = useState<LineTemplate | null>(null);

  // read initial view from the query string so hub/template/custom are
  // shareable/bookmarkable without splitting into separate route files
  useEffect(() => {
    const v = searchParams?.get("view");
    const tid = searchParams?.get("t");
    if (v === "template" && tid) {
      const tpl = lineTemplateById(tid);
      if (tpl) { setSelectedTemplate(tpl); setView("template"); return; }
    }
    if (v === "custom") setView("custom");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(next: View, tpl?: LineTemplate) {
    setView(next);
    const qs = new URLSearchParams();
    if (next === "template" && tpl) { qs.set("view", "template"); qs.set("t", tpl.id); setSelectedTemplate(tpl); }
    else if (next === "custom") qs.set("view", "custom");
    router.replace(qs.toString() ? `${pathname}?${qs.toString()}` : pathname);
  }

  // ── shared order state — used by both the custom-build path and a
  // template's pre-filled "use this line" path, so the summary/AI-review/
  // send steps below are written once and shared between both. ──────────
  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [parts, setParts] = useState<PartEntry[]>([]);
  const [customStep, setCustomStep] = useState<CustomStep>("process");

  // ── wizard: step 1 picks which process stages the line needs (in click
  // order), step 2 walks through each chosen stage one at a time and shows
  // a visual machine-card picker for it — replaces the old single-page
  // "everything visible at once" build step. ──────────────────────────
  const [processCategories, setProcessCategories] = useState<CategorySlug[]>([]);
  const [wizardCatIdx, setWizardCatIdx] = useState(0);

  const [draftFamily, setDraftFamily] = useState<ProductFamily | null>(null);
  const [draftModelIdx, setDraftModelIdx] = useState(0);
  const [draftQty, setDraftQty] = useState(1);
  const [draftNotes, setDraftNotes] = useState("");

  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState(1);
  const [partNotes, setPartNotes] = useState("");
  const [partImages, setPartImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const generalFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  const currentWizardCat = processCategories[wizardCatIdx];

  function addMachine() {
    if (!draftFamily) return;
    setMachines((prev) => [...prev, { family: draftFamily, modelIdx: draftModelIdx, qty: draftQty, notes: draftNotes.trim(), stage: categoryLabel(draftFamily.category) }]);
    setDraftFamily(null); setDraftModelIdx(0); setDraftQty(1); setDraftNotes("");
    // move to the next chosen process stage automatically, or on to AI
    // review once every stage the visitor picked in step 1 has a machine
    if (wizardCatIdx < processCategories.length - 1) {
      setWizardCatIdx((i) => i + 1);
    } else {
      setCustomStep("ai-review");
    }
  }
  function removeMachine(i: number) {
    setMachines((prev) => prev.filter((_, j) => j !== i));
  }

  function categoryLabel(slug: CategorySlug): string {
    return categories.find((c) => c.slug === slug)?.name.replace(" Machines", "").replace(" & Lab Lines", "") ?? slug;
  }

  function toggleProcessCategory(slug: CategorySlug) {
    setProcessCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  }

  function startMachineWizard() {
    if (processCategories.length === 0) return;
    setWizardCatIdx(0);
    setDraftFamily(null);
    setCustomStep("machine");
  }

  function wizardBack() {
    if (wizardCatIdx > 0) {
      setWizardCatIdx((i) => i - 1);
      setDraftFamily(null);
    } else {
      setCustomStep("process");
    }
  }

  const lineStatus = useMemo(
    () => evaluateLineStatus(machines.map((m) => m.family.category)),
    [machines]
  );

  async function uploadPartImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setPartImages((prev) => [...prev, j.url]);
      toast.success(tToast("photoUploaded"));
    } catch {
      toast.error(tToast("photoUploadFailed"), { description: tToast("photoUploadFailedDesc") });
    } finally {
      setUploading(false);
    }
  }
  function addPart() {
    if (!partName.trim()) return;
    setParts((prev) => [...prev, { name: partName.trim(), machine: "", machineSlug: "", quantity: partQty, notes: partNotes.trim(), images: partImages }]);
    setPartName(""); setPartQty(1); setPartNotes(""); setPartImages([]);
  }
  function removePart(i: number) {
    setParts((prev) => prev.filter((_, j) => j !== i));
  }

  // ── AI review chat callbacks ──────────────────────────────────────────
  function aiAddMachine(slug: string) {
    const fam = families.find((f) => f.slug === slug);
    if (!fam) return;
    setMachines((prev) => [...prev, { family: fam, modelIdx: 0, qty: 1, notes: "" }]);
  }
  function aiEditMachineQty(index: number, qty: number) {
    setMachines((prev) => prev.map((m, i) => (i === index ? { ...m, qty: Math.max(1, qty) } : m)));
  }
  function aiEditMachineNotes(index: number, notes: string) {
    setMachines((prev) => prev.map((m, i) => (i === index ? { ...m, notes } : m)));
  }
  function aiAddPart(name: string) {
    setParts((prev) => [...prev, { name, machine: "", machineSlug: "", quantity: 1, notes: "", images: [] }]);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      setImages((prev) => [...prev, j.url]);
      toast.success(tToast("photoUploaded"));
    } catch {
      toast.error(tToast("photoUploadFailed"), { description: tToast("photoUploadFailedDesc") });
    } finally {
      setUploading(false);
    }
  }

  const canReview = machines.length > 0;

  function applyTemplate(tpl: LineTemplate) {
    const filled: MachineEntry[] = tpl.steps
      .map((step): MachineEntry | null => {
        const fam = families.find((f) => f.slug === step.slug);
        if (!fam) return null;
        return { family: fam, modelIdx: 0, qty: 1, notes: "", stage: step.stage };
      })
      .filter((m): m is MachineEntry => m !== null);
    setMachines(filled);
    setParts([]);
    setCustomStep("summary");
    setView("custom");
    router.replace(`${pathname}?view=custom`);
  }

  async function send() {
    setSending(true); setSendError("");
    try {
      const flow = selectedTemplate ? `production-line:template:${selectedTemplate.id}` : "production-line:custom";
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "talk-to-engineer",
          name: form.name, company: form.company, email: form.email, phone: form.phone, country: form.country, message: form.message,
          images,
          machines: machines.map((m) => ({
            slug: m.family.slug, name: m.family.name, series: m.family.series,
            model: m.family.models[m.modelIdx], qty: m.qty, notes: m.notes,
          })),
          parts: parts.map((p) => ({
            name: p.name, machine: p.machine, machineSlug: p.machineSlug,
            quantity: p.quantity, notes: p.notes, images: p.images,
          })),
          source: typeof window !== "undefined" ? (sessionStorage.getItem("cx_source") ?? "direct") : "direct",
          flow,
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
    return familiesByCategory(insightFamily.category).filter((f) => f.slug !== insightFamily.slug);
  }, [insightFamily]);

  const summaryMachines: SummaryMachine[] = useMemo(
    () => machines.map((m) => ({
      slug: m.family.slug, name: m.family.name, series: m.family.series,
      model: m.family.models[m.modelIdx], stage: m.stage, qty: m.qty, notes: m.notes,
    })),
    [machines]
  );

  const reviewRows = useMemo<ReviewRow[]>(() => [
    { key: "name", label: t("reviewRows.name"), value: form.name, onChange: (v) => setForm((f) => ({ ...f, name: v })) },
    { key: "email", label: t("reviewRows.email"), value: form.email, onChange: (v) => setForm((f) => ({ ...f, email: v })) },
    { key: "company", label: t("reviewRows.company"), value: form.company, placeholder: t("optional"), onChange: (v) => setForm((f) => ({ ...f, company: v })) },
    { key: "message", label: t("reviewRows.message"), value: form.message, kind: "textarea", placeholder: t("optional"), onChange: (v) => setForm((f) => ({ ...f, message: v })) },
  ], [form, t]);

  function backToHub() {
    setSelectedTemplate(null);
    setMachines([]);
    setParts([]);
    setProcessCategories([]);
    setWizardCatIdx(0);
    setCustomStep("process");
    goTo("hub");
  }

  // ── success screen — shared by both paths ─────────────────────────────
  if (sent) {
    return (
      <>
        <style suppressHydrationWarning>{chatStyles}</style>
        <div className="ci-page">
          <div className="ci-shell" style={{ gridTemplateColumns: "1fr" }}>
            <div className="ci-success">
              <div className="ci-success__icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="var(--brand-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h1 className="ci-success__title">{t("successTitle", { name: form.name })}</h1>
              <p className="ci-success__sub">{t("successSub", { email: form.email })}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── HUB ─────────────────────────────────────────────────────────────
  if (view === "hub") {
    return (
      <>
        <style suppressHydrationWarning>{chatStyles}</style>
        <style suppressHydrationWarning>{`
          .plb-hub { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 clamp(1.5rem, 4vw, 3rem) clamp(4rem, 7vw, 7rem); }
          .plb-hub__header { text-align: center; margin-bottom: clamp(2.75rem, 6vw, 4.5rem); }
          .plb-hub__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
          @media (max-width: 700px) { .plb-hub__grid { grid-template-columns: 1fr; } }
          .plb-hub__card {
            position: relative; display: flex; flex-direction: column;
            background: var(--bg-surface); border: 1px solid var(--bg-line); border-radius: 1.25rem;
            overflow: hidden; cursor: pointer; text-align: left; padding: 0; width: 100%;
            transition: border-color .2s, transform .2s, box-shadow .2s;
          }
          .plb-hub__card:hover { border-color: var(--brand-teal); transform: translateY(-3px); box-shadow: 0 16px 40px -20px rgba(43,191,179,.3); }
          .plb-hub__card-img-wrap { position: relative; width: 100%; aspect-ratio: 16/10; background: var(--bg-raise); }
          .plb-hub__card-img { object-fit: contain; padding: 8%; }
          .plb-hub__card-body { padding: 1.25rem 1.4rem 1.5rem; }
          .plb-hub__card-badge {
            display: inline-flex; align-items: center; gap: .4rem; font-family: var(--ff-mono);
            font-size: .62rem; letter-spacing: .16em; text-transform: uppercase; color: var(--brand-teal); margin-bottom: .6rem;
          }
          .plb-hub__card-badge::before { content: "●"; font-size: .5rem; }
          .plb-hub__card-title { font-family: var(--ff-display); font-size: 1.3rem; color: var(--ink); margin: 0 0 .4rem; line-height: 1.1; }
          .plb-hub__card-desc { font-size: .85rem; color: var(--ink-60); line-height: 1.55; margin: 0; }
          .plb-hub__custom {
            display: flex; align-items: center; gap: 1.25rem;
            background: var(--bg-surface); border: 1px dashed var(--brand-teal); border-radius: 1.25rem;
            padding: clamp(1.5rem, 3vw, 2rem); cursor: pointer; width: 100%; text-align: left;
            transition: background .2s, transform .2s;
          }
          .plb-hub__custom:hover { background: rgba(43,191,179,.06); transform: translateY(-2px); }
          .plb-hub__custom-icon {
            flex-shrink: 0; width: 56px; height: 56px; border-radius: 1rem;
            background: rgba(43,191,179,.1); border: 1px solid rgba(43,191,179,.25);
            display: flex; align-items: center; justify-content: center; color: var(--brand-teal);
          }
        `}</style>
        <div className="ci-page">
          <div className="plb-hub">
            <div className="plb-hub__header">
              <div className="ci-eyebrow" style={{ justifyContent: "center" }}>{t("hub.eyebrow")}</div>
              <h1 className="ci-h1">{t("hub.titlePrefix")} <em>{t("hub.titleEm")}</em></h1>
              <p style={{ color: "var(--ink-60)", maxWidth: "52ch", margin: "1rem auto 0", lineHeight: 1.7 }}>{t("hub.sub")}</p>
            </div>

            <div className="plb-hub__grid">
              {lineTemplates.map((tpl) => (
                <button key={tpl.id} type="button" className="plb-hub__card" onClick={() => goTo("template", tpl)}>
                  <div className="plb-hub__card-img-wrap">
                    <Image src={tpl.heroImage} alt={tpl.name} fill sizes="(max-width: 700px) 90vw, 480px" className="plb-hub__card-img" />
                  </div>
                  <div className="plb-hub__card-body">
                    <div className="plb-hub__card-badge">{t("hub.templateCardBadge")}</div>
                    <h2 className="plb-hub__card-title">{tpl.name}</h2>
                    <p className="plb-hub__card-desc">{tpl.tagline}</p>
                  </div>
                </button>
              ))}
            </div>

            <button type="button" className="plb-hub__custom" onClick={() => goTo("custom")}>
              <span className="plb-hub__custom-icon">
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h2 className="plb-hub__card-title" style={{ marginBottom: ".3rem" }}>{t("hub.customCardTitle")}</h2>
                <p className="plb-hub__card-desc">{t("hub.customCardDesc")}</p>
              </div>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── TEMPLATE SHOWCASE ───────────────────────────────────────────────
  if (view === "template" && selectedTemplate) {
    return (
      <>
        <style suppressHydrationWarning>{chatStyles}</style>
        <div className="ci-page">
          <div className="ci-shell" style={{ gridTemplateColumns: "1fr", maxWidth: 900 }}>
            <LineTemplateShowcase
              template={selectedTemplate}
              onUseThisLine={() => applyTemplate(selectedTemplate)}
              onBack={backToHub}
            />
          </div>
        </div>
      </>
    );
  }

  // ── CUSTOM BUILD / SUMMARY / DETAILS ─────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{chatStyles}</style>
      <style suppressHydrationWarning>{`
        .plb-wizard-bar {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .plb-wizard-steps { display: flex; align-items: center; gap: .4rem; }
        .plb-wizard-dot {
          width: 26px; height: 26px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-mono); font-size: .68rem; font-weight: 700;
          background: var(--bg-surface); border: 1.5px solid var(--bg-line); color: var(--ink-35);
          transition: border-color .2s, background .2s, color .2s;
        }
        .plb-wizard-dot--on { border-color: var(--brand-teal); background: var(--brand-teal); color: #04211e; }
        .plb-wizard-dot--done { border-color: rgba(43,191,179,.4); color: var(--brand-teal); }

        .plb-ai-status {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .4rem .8rem; border-radius: 999px;
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .04em;
          border: 1px solid var(--bg-line); background: var(--bg-surface); color: var(--ink-60);
        }
        .plb-ai-status__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-35); flex-shrink: 0; }
        .plb-ai-status--analyzing .plb-ai-status__dot { background: var(--brand-teal); animation: plb-pulse 1.4s ease-in-out infinite; }
        .plb-ai-status--analyzing { border-color: rgba(43,191,179,.3); color: var(--brand-teal); }
        .plb-ai-status--optimized .plb-ai-status__dot { background: var(--brand-teal); }
        .plb-ai-status--optimized { border-color: rgba(43,191,179,.35); color: var(--brand-teal); }
        .plb-ai-status--mismatch .plb-ai-status__dot { background: #f59e0b; }
        .plb-ai-status--mismatch { border-color: rgba(245,158,11,.4); color: #f59e0b; }
        @keyframes plb-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

        .plb-ai-note {
          display: flex; gap: .6rem; align-items: flex-start;
          background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.25);
          border-radius: .875rem; padding: .8rem 1rem; margin-bottom: 1.25rem;
          font-size: .82rem; color: var(--ink-60); line-height: 1.6;
        }

        .plb-process-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: .85rem; }
        .plb-process-card {
          position: relative; display: flex; flex-direction: column; gap: .35rem;
          text-align: left; padding: 1.1rem 1.2rem; border-radius: 1rem;
          background: var(--bg-raise); border: 1.5px solid var(--bg-line); cursor: pointer;
          transition: border-color .15s, background .15s, transform .15s;
        }
        .plb-process-card:hover { transform: translateY(-2px); }
        .plb-process-card--on { border-color: var(--brand-teal); background: rgba(43,191,179,.06); }
        .plb-process-card__num {
          position: absolute; top: .7rem; right: .7rem;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--brand-teal); color: #04211e;
          font-family: var(--ff-mono); font-size: .68rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .plb-process-card__name { font-family: var(--ff-display); font-size: 1.05rem; color: var(--ink); }
        .plb-process-card__tagline { font-size: .78rem; color: var(--ink-60); }

        .plb-machine-cards {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: .75rem;
          max-height: 400px; overflow-y: auto; padding: .15rem;
        }
        .plb-machine-card {
          display: flex; flex-direction: column; text-align: left;
          background: var(--bg-raise); border: 1.5px solid var(--bg-line);
          border-radius: .875rem; padding: .6rem; cursor: pointer;
          transition: border-color .15s, transform .15s;
        }
        .plb-machine-card:hover { border-color: rgba(43,191,179,.5); transform: translateY(-2px); }
        .plb-machine-card--on { border-color: var(--brand-teal); background: rgba(43,191,179,.06); }
        .plb-machine-card__img-wrap {
          position: relative; width: 100%; aspect-ratio: 4/3; border-radius: .6rem;
          overflow: hidden; background: var(--bg-surface); margin-bottom: .55rem; display: block;
        }
        .plb-machine-card__img { object-fit: contain; }
        .plb-machine-card__series {
          font-family: var(--ff-mono); font-size: .58rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .15rem;
        }
        .plb-machine-card__name { font-size: .82rem; color: var(--ink); line-height: 1.3; font-weight: 600; }
      `}</style>
      <div className="ci-page">
        <div className="ci-shell">
          <div>
            {customStep === "process" ? (
              <button type="button" className="ci-back" onClick={backToHub}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t("backLink")}
              </button>
            ) : (
              <button
                type="button"
                className="ci-back"
                onClick={() => {
                  if (customStep === "machine") wizardBack();
                  else setCustomStep(customStep === "details" ? "summary" : customStep === "summary" ? "ai-review" : "machine");
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t("back")}
              </button>
            )}
            <div className="ci-heading">
              <div className="ci-eyebrow">{t("custom.eyebrow")}</div>
              <h1 className="ci-h1">{t("custom.titlePrefix")} <em>{t("custom.titleEm")}</em></h1>
            </div>

            {/* ── wizard progress + live AI status — visible from the
                machine-picking step onward, replaces the old single
                everything-at-once page with a numbered flow ── */}
            {(customStep === "machine" || customStep === "ai-review" || customStep === "summary" || customStep === "details") && (
              <div className="plb-wizard-bar">
                <div className="plb-wizard-steps">
                  {(["machine", "ai-review", "summary", "details"] as CustomStep[]).map((s, i) => {
                    const order: CustomStep[] = ["machine", "ai-review", "summary", "details"];
                    const curIdx = order.indexOf(customStep);
                    return (
                      <span key={s} className={`plb-wizard-dot${i === curIdx ? " plb-wizard-dot--on" : i < curIdx ? " plb-wizard-dot--done" : ""}`}>
                        {i < curIdx ? "✓" : i + 1}
                      </span>
                    );
                  })}
                </div>
                <div className={`plb-ai-status plb-ai-status--${lineStatus.status}`}>
                  <span className="plb-ai-status__dot" />
                  <span className="plb-ai-status__label">
                    {lineStatus.status === "mismatch" ? t("custom.aiStatusMismatch")
                      : lineStatus.status === "optimized" ? t("custom.aiStatusOptimized")
                      : lineStatus.status === "analyzing" ? t("custom.aiStatusAnalyzing")
                      : t("custom.aiStatusEmpty")}
                  </span>
                </div>
              </div>
            )}
            {(customStep === "machine" || customStep === "ai-review" || customStep === "summary" || customStep === "details") && lineStatus.status === "mismatch" && (
              <div className="plb-ai-note" role="status">{lineStatus.message}</div>
            )}

            <div className="ci-convo">
              {customStep === "process" && (
                <Section title={t("custom.processSection")} subtitle={t("custom.processSubtitle")}>
                  <div className="plb-process-grid">
                    {categories.map((cat) => {
                      const on = processCategories.includes(cat.slug as CategorySlug);
                      const orderNum = processCategories.indexOf(cat.slug as CategorySlug);
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          className={`plb-process-card${on ? " plb-process-card--on" : ""}`}
                          onClick={() => toggleProcessCategory(cat.slug as CategorySlug)}
                        >
                          {on && <span className="plb-process-card__num">{orderNum + 1}</span>}
                          <span className="plb-process-card__name">{cat.name}</span>
                          <span className="plb-process-card__tagline">{cat.tagline}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="ci-submit-bar">
                    <button type="button" className="ci-submit-bar__btn" disabled={processCategories.length === 0} onClick={startMachineWizard}>
                      {t("custom.startBuildingCta")}
                    </button>
                  </div>
                </Section>
              )}

              {customStep === "machine" && currentWizardCat && (
                <Section
                  title={t("custom.machineStepTitle", { num: wizardCatIdx + 1, total: processCategories.length, category: categoryLabel(currentWizardCat) })}
                  subtitle={t("custom.machineStepSubtitle")}
                >
                  {machines.filter((m) => m.family.category === currentWizardCat).map((m, i) => (
                    <EntryRow
                      key={i}
                      title={`${m.family.name} (${m.family.models[m.modelIdx]}) × ${m.qty}`}
                      meta={m.notes || undefined}
                      onRemove={() => removeMachine(machines.indexOf(m))}
                    />
                  ))}

                  <div className="plb-machine-cards">
                    {familiesByCategory(currentWizardCat).map((f) => (
                      <button
                        key={f.slug}
                        type="button"
                        className={`plb-machine-card${draftFamily?.slug === f.slug ? " plb-machine-card--on" : ""}`}
                        onClick={() => { setDraftFamily(f); setDraftModelIdx(0); }}
                      >
                        <span className="plb-machine-card__img-wrap">
                          <Image src={familyImage(f)} alt={f.name} fill sizes="180px" className="plb-machine-card__img" />
                        </span>
                        <span className="plb-machine-card__series">{f.series}</span>
                        <span className="plb-machine-card__name">{f.name}</span>
                      </button>
                    ))}
                  </div>

                  {draftFamily && (
                    <>
                      {draftFamily.models.length > 1 && (
                        <Field label={t("custom.model")}>
                          <select value={draftModelIdx} onChange={(e) => setDraftModelIdx(parseInt(e.target.value, 10))}>
                            {draftFamily.models.map((m, i) => <option key={m} value={i}>{m}</option>)}
                          </select>
                        </Field>
                      )}
                      <div className="ci-row">
                        <Field label={t("custom.quantity")}>
                          <div className="ci-qty">
                            <button type="button" className="ci-qty__btn" onClick={() => setDraftQty((q) => Math.max(1, q - 1))}>−</button>
                            <span className="ci-qty__val">{draftQty}</span>
                            <button type="button" className="ci-qty__btn" onClick={() => setDraftQty((q) => q + 1)}>+</button>
                          </div>
                        </Field>
                        <Field label={t("custom.customNotes")} hint={t("custom.customNotesHint")}>
                          <input type="text" placeholder={t("optional")} value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} />
                        </Field>
                      </div>
                      <AddAnotherButton onClick={addMachine}>
                        {wizardCatIdx < processCategories.length - 1 ? t("custom.addAndContinue") : t("custom.addAndFinish")}
                      </AddAnotherButton>
                    </>
                  )}
                </Section>
              )}

              {customStep === "machine" && (
                <Section title={t("custom.partsSection")} subtitle={t("custom.partsSubtitle")}>
                  {parts.map((p, i) => (
                    <EntryRow
                      key={i}
                      title={`${p.name} · qty ${p.quantity}`}
                      meta={[p.notes, p.images.length ? `${p.images.length} photo${p.images.length > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ") || undefined}
                      onRemove={() => removePart(i)}
                    />
                  ))}

                  <Field label={t("custom.partName")} hint={t("custom.partNameHint")}>
                    <input type="text" placeholder={t("custom.partNamePlaceholder")} value={partName} onChange={(e) => setPartName(e.target.value)} />
                  </Field>

                  {partName.trim() && (
                    <>
                      <div className="ci-row">
                        <Field label={t("custom.quantity")}>
                          <div className="ci-qty">
                            <button type="button" className="ci-qty__btn" onClick={() => setPartQty((q) => Math.max(1, q - 1))}>−</button>
                            <span className="ci-qty__val">{partQty}</span>
                            <button type="button" className="ci-qty__btn" onClick={() => setPartQty((q) => q + 1)}>+</button>
                          </div>
                        </Field>
                        <Field label={t("custom.specsRefNumbers")}>
                          <input type="text" placeholder={t("optional")} value={partNotes} onChange={(e) => setPartNotes(e.target.value)} />
                        </Field>
                      </div>
                      <Field label={t("custom.referencePhoto")}>
                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                          {partImages.map((src, i) => (
                            <Image key={i} src={src} alt="" width={40} height={40} style={{ objectFit: "cover", borderRadius: 8, border: "1px solid var(--bg-line)" }} />
                          ))}
                          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                            style={{ padding: ".5rem .8rem", borderRadius: ".6rem", border: "1px dashed var(--bg-line)", background: "var(--bg-raise)", color: "var(--ink-60)", fontSize: ".8rem", cursor: "pointer" }}>
                            {uploading ? t("custom.uploading") : t("custom.addPhoto")}
                          </button>
                          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPartImage(f); e.target.value = ""; }} />
                        </div>
                      </Field>
                      <AddAnotherButton onClick={addPart}>{t("custom.addPartToLine")}</AddAnotherButton>
                    </>
                  )}

                  {!draftFamily && (
                    <div className="ci-submit-bar">
                      <button type="button" className="ci-submit-bar__btn" disabled={!canReview} onClick={() => setCustomStep("ai-review")}>
                        {t("custom.continueButton")}
                      </button>
                    </div>
                  )}
                </Section>
              )}

              {customStep === "ai-review" && (
                <Section title={t("custom.aiReviewSection")} subtitle={t("custom.aiReviewSubtitle")}>
                  <AiReviewChat
                    machines={machines.map((m) => ({ slug: m.family.slug, name: m.family.name, series: m.family.series, model: m.family.models[m.modelIdx], qty: m.qty, notes: m.notes }))}
                    parts={parts.map((p) => ({ name: p.name, machine: p.machine, quantity: p.quantity, notes: p.notes }))}
                    onAddMachine={aiAddMachine}
                    onEditMachineQty={aiEditMachineQty}
                    onEditMachineNotes={aiEditMachineNotes}
                    onAddPart={aiAddPart}
                    onContinue={() => setCustomStep("summary")}
                  />
                </Section>
              )}

              {customStep === "summary" && (
                <Section title={t("summary.title")} subtitle={t("summary.subtitle")}>
                  <LineSummaryCard
                    machines={summaryMachines}
                    parts={parts.map((p) => ({ name: p.name, machine: p.machine, quantity: p.quantity, notes: p.notes }))}
                  />
                  <div className="ci-submit-bar">
                    <button type="button" className="ci-submit-bar__btn" onClick={() => setCustomStep("details")}>
                      {t("summary.continueButton")}
                    </button>
                  </div>
                </Section>
              )}

              {customStep === "details" && (
                <Section title={t("custom.yourDetails")}>
                  <div className="ci-row">
                    <Field label={t("custom.name")} required>
                      <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                    </Field>
                    <Field label={t("custom.email")} required>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                    </Field>
                  </div>
                  <div className="ci-row">
                    <Field label={t("custom.company")}>
                      <input type="text" placeholder={t("optional")} value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                    </Field>
                    <Field label={t("custom.phone")}>
                      <input type="tel" placeholder={t("optional")} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                    </Field>
                  </div>
                  <Field label={t("custom.message")} hint={t("custom.messageHint")}>
                    <textarea rows={3} placeholder={t("optional")} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                  </Field>
                  <Field label={t("custom.referencePhotos")}>
                    <ImageGallery
                      images={images}
                      uploading={uploading}
                      onAdd={() => generalFileRef.current?.click()}
                      onRemove={(i) => setImages((prev) => prev.filter((_, j) => j !== i))}
                    />
                  </Field>
                  <input ref={generalFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                </Section>
              )}

              {customStep === "details" && sendError && <div className="ci-error" role="alert">{sendError}</div>}

              {customStep === "details" && (!reviewing ? (
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
                  onRemoveImage={(i) => setImages((prev) => prev.filter((_, j) => j !== i))}
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
              machines.length === 0 ? { text: <>{t("custom.tipEmpty")}</> } :
              canReview ? { text: <>{t("custom.tipReady")}</> } :
              { text: <>{t("custom.tipDefault")}</> }
            }
          />
        </div>
      </div>
    </>
  );
}

export default function ProductionLinePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-base)" }} />}>
      <ProductionLineInner />
    </Suspense>
  );
}
