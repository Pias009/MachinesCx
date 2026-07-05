// ---------------------------------------------------------------------------
// Rule-based ASHA answer engine — no LLM, no API key, no network call. Reads
// the live catalogue (lib/products.ts, backed by data/products.json) and
// composes replies entirely from real fields, so it can never hallucinate a
// spec. Trades free-form fluency for zero cost and total reliability.
// ---------------------------------------------------------------------------
import { categories, families, type ProductFamily, type CategorySlug } from "@/lib/products";
import type { ChatAction, PendingInquiryDoc as PendingInquiry } from "@/models/ChatSession";

export interface LocalAnswer {
  text: string;
  actions: ChatAction[];
  pendingInquiry?: PendingInquiry | null; // null clears it
  /** Set when the guided flow just completed — route creates the real Inquiry doc. */
  completedInquiry?: { name: string; email: string; qty: number; slug: string; machineName: string };
}

const CATEGORY_SYNONYMS: Record<CategorySlug, string[]> = {
  "film-blowing": ["film blowing", "film-blowing", "blown film", "blowing", "film"],
  "bag-making": ["bag making", "bag-making", "bags", "bagmaking"],
  recycling: ["recycling", "recycle", "granulator", "pelletizing", "pelletizer"],
  printing: ["printing", "print", "flexo", "flexographic"],
};

const GREETING_WORDS = ["hi", "hello", "hey", "yo", "good morning", "good afternoon", "good evening"];
const COMPARE_WORDS = ["compare", " vs ", " vs.", "versus", "difference between"];
const SPEC_WORDS = ["spec", "specs", "specification", "details", "tell me about"];
const BUY_WORDS = ["buy", "order", "purchase", "quote", "price", "cost", "inquire", "inquiry", "interested in"];
const RECOMMEND_WORDS = ["recommend", "suggest", "which machine", "what machine", "best for", "need a machine", "best selling", "best seller", "popular"];
// Generic "show me what you have" browsing requests — catches phrasings that
// name "machine(s)" but no specific one, so they get a helpful category list
// instead of falling through to the "I didn't catch that" dead end.
const LIST_WORDS = ["show me", "list", "what machines", "give me", "what do you have", "what is the machine", "what to do", "options", "all machines", "everything you"];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s.\-/]/g, " ").replace(/\s+/g, " ").trim();
}

/** Cheap fuzzy containment: true if `needle`'s words mostly appear in `haystack`. */
function fuzzyIncludes(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (h.includes(n) || n.includes(h)) return true;
  const words = n.split(" ").filter(w => w.length > 2);
  if (words.length === 0) return false;
  const hits = words.filter(w => h.includes(w)).length;
  return hits / words.length >= 0.6;
}

// Words too generic to count as a machine-name match on their own — every
// bag-making machine's name contains "bag machine", every printing machine's
// name contains "press", etc., so a lone hit on these must not trigger a
// specific-machine match; only a series/slug/model number should.
const GENERIC_NAME_WORDS = new Set([
  "machine", "line", "series", "system", "unit", "press", "bag", "film",
  "blowing", "printing", "recycling", "extrusion", "layer", "converter",
]);

function findMachines(message: string): ProductFamily[] {
  const msg = normalize(message);
  const scored = families
    .map(f => {
      // Strong signal: series, slug, or an exact model number appears.
      const strongCandidates = [f.series, f.slug.replace(/-/g, " "), ...f.models];
      const strongHit = strongCandidates.some(c => c && msg.includes(normalize(c)));
      if (strongHit) return { f, hit: true };

      // Weaker signal: the full name matches, but only if it's not just
      // generic category words (e.g. "bag machine" alone must not match
      // every bag-making machine — require a distinguishing word too).
      const nameWords = normalize(f.name).split(" ").filter(w => w.length > 2);
      const distinguishing = nameWords.filter(w => !GENERIC_NAME_WORDS.has(w));
      const distinguishingHit = distinguishing.length > 0 && distinguishing.some(w => msg.includes(w));
      return { f, hit: distinguishingHit && fuzzyIncludes(msg, f.name) };
    })
    .filter(x => x.hit)
    .map(x => x.f);
  return scored;
}

function findCategory(message: string): CategorySlug | null {
  const msg = normalize(message);
  for (const cat of categories) {
    const synonyms = CATEGORY_SYNONYMS[cat.slug] ?? [cat.slug];
    if (synonyms.some(s => msg.includes(s))) return cat.slug;
  }
  return null;
}

function parseNumericTarget(message: string): number | null {
  const match = message.match(/(\d+(?:\.\d+)?)\s*(kg\/h|kg|ton|tons|mm|m\/min)/i);
  return match ? parseFloat(match[1]) : null;
}

/** Extracts a "N colors/colours" qualifier (e.g. "8 colors", "6-colour") for printing machine matching. */
function parseColorTarget(message: string): number | null {
  const match = message.match(/(\d+)\s*[-\s]?(colou?rs?|c\b)/i);
  return match ? parseInt(match[1], 10) : null;
}

/** Finds the family whose spec exactly matches a numeric qualifier, scoped to a category if given. */
function findByExactSpec(labelPattern: RegExp, target: number, category: CategorySlug | null): ProductFamily[] {
  const pool = category ? families.filter(f => f.category === category) : families;
  return pool.filter(f => {
    const spec = f.specs.find(s => labelPattern.test(s.label));
    return spec?.values.some(v => parseFloat(v.replace(/,/g, "")) === target);
  });
}

function specSummary(f: ProductFamily): string {
  const topSpecs = f.specs.slice(0, 4).map(s => `${s.label}: ${s.values.join(" / ")}`).join("; ");
  return `${f.name} (${f.series}) — ${f.tagline || "no tagline set"}. Models: ${f.models.join(", ")}. ${topSpecs}.`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Advances a guided name → email → qty inquiry flow already in progress. */
function continueInquiryFlow(message: string, pending: PendingInquiry): LocalAnswer {
  const trimmed = message.trim();

  if (pending.stage === "name") {
    if (!trimmed) return { text: "I'll need your name to send this along — what's your name?", actions: [], pendingInquiry: pending };
    const next: PendingInquiry = { ...pending, name: trimmed, stage: "email" };
    return { text: `Thanks, ${trimmed}! What's the best email to reach you at?`, actions: [], pendingInquiry: next };
  }

  if (pending.stage === "email") {
    if (!EMAIL_RE.test(trimmed)) {
      return { text: "That doesn't look like a valid email — could you double check it?", actions: [], pendingInquiry: pending };
    }
    const next: PendingInquiry = { ...pending, email: trimmed, stage: "qty" };
    return { text: `Got it. How many units of ${pending.machineName ?? "this machine"} are you looking for? (Just say a number, or "1" if you're not sure yet.)`, actions: [], pendingInquiry: next };
  }

  if (pending.stage === "qty") {
    const num = parseInt(trimmed.match(/\d+/)?.[0] ?? "1", 10);
    const qty = Number.isFinite(num) && num > 0 ? num : 1;
    return {
      text: `Perfect — I've sent your inquiry for ${qty} × ${pending.machineName ?? "this machine"} to our team. Someone will reach out to ${pending.email} shortly. Anything else I can help with?`,
      actions: [],
      pendingInquiry: null,
      completedInquiry: {
        name: pending.name ?? "",
        email: pending.email ?? "",
        qty,
        slug: pending.slug ?? "",
        machineName: pending.machineName ?? pending.slug ?? "Unspecified machine",
      },
    };
  }

  return { text: "Let's start over — what would you like to inquire about?", actions: [], pendingInquiry: null };
}

function startInquiryFlow(machine: ProductFamily | undefined): LocalAnswer {
  const pending: PendingInquiry = { stage: "name", slug: machine?.slug, machineName: machine?.name };
  const machineText = machine ? ` for the ${machine.name}` : "";
  return {
    text: `Happy to help set up an inquiry${machineText}! First — what's your name?`,
    actions: [],
    pendingInquiry: pending,
  };
}

export function answerLocally(rawMessage: string, pendingInquiry: PendingInquiry | null | undefined): LocalAnswer {
  // A guided inquiry flow in progress takes priority over intent matching —
  // the visitor is answering a direct question, not asking a new one.
  if (pendingInquiry && pendingInquiry.stage !== "done") {
    return continueInquiryFlow(rawMessage, pendingInquiry);
  }

  const msg = normalize(rawMessage);
  const categoryQuickReplies = categories.map(c => c.name);

  if (GREETING_WORDS.some(g => msg === g || msg.startsWith(g + " ") || msg.startsWith(g + ","))) {
    return {
      text: "Hi, I'm ASHA. What are you looking for today — a specific machine, or should I show you a category to start?",
      actions: [{ type: "quick_replies", options: categoryQuickReplies }],
    };
  }

  const matchedMachines = findMachines(rawMessage);
  const isCompare = COMPARE_WORDS.some(w => msg.includes(w));
  const isBuy = BUY_WORDS.some(w => msg.includes(w));
  const isSpec = SPEC_WORDS.some(w => msg.includes(w));
  const isRecommend = RECOMMEND_WORDS.some(w => msg.includes(w));
  const isList = LIST_WORDS.some(w => msg.includes(w));
  const category = findCategory(rawMessage);
  const outputTarget = parseNumericTarget(rawMessage);
  const colorTarget = parseColorTarget(rawMessage);

  if (isBuy) {
    return startInquiryFlow(matchedMachines[0]);
  }

  if (isCompare && matchedMachines.length >= 2) {
    const [a, b] = matchedMachines;
    const sharedLabels = a.specs.map(s => s.label).filter(label => b.specs.some(s => s.label === label));
    const specLabels = sharedLabels.slice(0, 4);
    return {
      text: `Comparing ${a.name} and ${b.name}:\n\n${specSummary(a)}\n\n${specSummary(b)}`,
      actions: [{ type: "compare", slugs: [a.slug, b.slug], specLabels }],
    };
  }

  if (matchedMachines.length >= 2 && !isCompare) {
    // Multiple machines named without "compare" — show them all as cards.
    return {
      text: `Found ${matchedMachines.length} machines matching that: ${matchedMachines.map(f => f.name).join(", ")}.`,
      actions: [{ type: "show_machines", slugs: matchedMachines.slice(0, 5).map(f => f.slug) }],
    };
  }

  if (matchedMachines.length === 1) {
    const f = matchedMachines[0];
    return {
      text: isSpec || true ? specSummary(f) : f.tagline,
      actions: [{ type: "show_machines", slugs: [f.slug] }],
    };
  }

  // Compare/recommend intent with a category + qualifier but no exact machine
  // names — e.g. "compare your multi-layer options", "best printing machine
  // with 8 colors". Resolve within the detected category by the qualifier
  // instead of silently degrading into a plain category listing.
  if ((isCompare || isRecommend) && (category || outputTarget !== null || colorTarget !== null)) {
    let candidates: ProductFamily[] = category ? families.filter(f => f.category === category) : families;

    if (colorTarget !== null) {
      const byColor = findByExactSpec(/colou?rs?/i, colorTarget, category);
      if (byColor.length > 0) candidates = byColor;
    } else if (outputTarget !== null) {
      candidates = [...candidates].sort((a, b) => {
        const closest = (f: ProductFamily) => {
          const spec = f.specs.find(s => /output|capacity|speed/i.test(s.label));
          const nums = spec?.values.map(v => parseFloat(v.replace(/,/g, ""))).filter(n => !Number.isNaN(n)) ?? [];
          return nums.length ? Math.min(...nums.map(n => Math.abs(n - outputTarget))) : Infinity;
        };
        return closest(a) - closest(b);
      });
    }

    const picked = candidates.slice(0, isCompare ? 2 : 3);
    if (picked.length >= 2 && isCompare) {
      const [a, b] = picked;
      const sharedLabels = a.specs.map(s => s.label).filter(label => b.specs.some(s => s.label === label));
      return {
        text: `Comparing ${a.name} and ${b.name}:\n\n${specSummary(a)}\n\n${specSummary(b)}`,
        actions: [{ type: "compare", slugs: [a.slug, b.slug], specLabels: sharedLabels.slice(0, 4) }],
      };
    }
    if (picked.length > 0) {
      const qualifierText = colorTarget !== null ? `${colorTarget}-color` : outputTarget !== null ? `~${outputTarget} output` : "";
      return {
        text: `Best fit${qualifierText ? ` for ${qualifierText}` : ""}: ${picked.map(f => f.name).join(", ")}.`,
        actions: [{ type: "show_machines", slugs: picked.map(f => f.slug) }],
      };
    }
  }

  if (category) {
    const inCat = families.filter(f => f.category === category);
    const catMeta = categories.find(c => c.slug === category);
    return {
      text: `Here's what we have in ${catMeta?.name ?? category}: ${inCat.map(f => f.name).join(", ")}. Ask me about any one by name for full specs.`,
      actions: [{ type: "show_machines", slugs: inCat.slice(0, 5).map(f => f.slug) }],
    };
  }

  if (isRecommend) {
    if (outputTarget !== null) {
      const ranked = families
        .map(f => {
          const outputSpec = f.specs.find(s => /output|capacity|speed/i.test(s.label));
          const nums = outputSpec?.values.map(v => parseFloat(v.replace(/,/g, ""))).filter(n => !Number.isNaN(n)) ?? [];
          const closest = nums.length ? Math.min(...nums.map(n => Math.abs(n - outputTarget))) : Infinity;
          return { f, closest };
        })
        .sort((a, b) => a.closest - b.closest)
        .slice(0, 3)
        .map(x => x.f);
      return {
        text: `Closest matches to ~${outputTarget} on output/capacity: ${ranked.map(f => f.name).join(", ")}.`,
        actions: [{ type: "show_machines", slugs: ranked.map(f => f.slug) }],
      };
    }
    return {
      text: "Tell me a target output (e.g. \"200 kg/h\"), a category, or a machine name and I'll point you to the right fit.",
      actions: [{ type: "quick_replies", options: categoryQuickReplies }],
    };
  }

  if (isList) {
    return {
      text: `We carry ${families.length} machines across four categories — pick one below, or name a machine directly and I'll pull up its specs.`,
      actions: [{ type: "quick_replies", options: categoryQuickReplies }],
    };
  }

  return {
    text: "I'm not sure which machine or category you mean yet — pick one below, or tell me a machine name directly (e.g. \"ABCDE-2200\").",
    actions: [{ type: "quick_replies", options: categoryQuickReplies }],
  };
}
