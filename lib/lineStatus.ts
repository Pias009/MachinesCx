// ---------------------------------------------------------------------------
// Live, client-side "AI engineer" status for the production-line builder
// wizard — instant heuristic checks shown WHILE the visitor is picking
// machines, distinct from the real OpenRouter-backed AiReviewChat step that
// runs afterward. Kept intentionally simple (sequence/category checks only,
// no network call) so it can update on every keystroke/click with no
// latency; the real AI review still does the deeper pass.
// ---------------------------------------------------------------------------
import type { CategorySlug } from "@/lib/products";

export type LineStatus = "empty" | "analyzing" | "mismatch" | "optimized";

export interface LineStatusResult {
  status: LineStatus;
  message: string;
}

// A sensible production sequence: resin -> film -> print -> convert to bags,
// with recycling able to slot in anywhere (it consumes scrap from any stage).
const SEQUENCE_RANK: Record<CategorySlug, number> = {
  "film-blowing": 0,
  printing: 1,
  "bag-making": 2,
  recycling: 0, // no fixed position — never flagged for ordering
};

export function evaluateLineStatus(categoriesInOrder: CategorySlug[]): LineStatusResult {
  if (categoriesInOrder.length === 0) {
    return { status: "empty", message: "Add a machine to start building your line." };
  }
  if (categoriesInOrder.length === 1) {
    return { status: "analyzing", message: "Looks good so far — add the next stage in your line." };
  }

  // Flag an out-of-order sequence: e.g. bag-making picked before any
  // film-blowing stage exists yet (nothing to convert), or printing after
  // bag-making (printed film should happen before it's cut into bags).
  const withoutRecycling = categoriesInOrder.filter((c) => c !== "recycling");
  for (let i = 1; i < withoutRecycling.length; i++) {
    if (SEQUENCE_RANK[withoutRecycling[i]] < SEQUENCE_RANK[withoutRecycling[i - 1]]) {
      return {
        status: "mismatch",
        message: `${labelFor(withoutRecycling[i])} usually comes before ${labelFor(withoutRecycling[i - 1])} in a real line — double-check the order, or continue if this is intentional.`,
      };
    }
  }

  const hasFilmSource = categoriesInOrder.includes("film-blowing");
  const hasConverter = categoriesInOrder.includes("bag-making");
  if (hasConverter && !hasFilmSource) {
    return {
      status: "mismatch",
      message: "A bag-making machine needs a film source — add a film-blowing machine, or continue if you already have your own film supply.",
    };
  }

  if (categoriesInOrder.length >= 2) {
    return { status: "optimized", message: "This line reads as a coherent, connected setup." };
  }
  return { status: "analyzing", message: "Analyzing your line…" };
}

function labelFor(c: CategorySlug): string {
  const labels: Record<CategorySlug, string> = {
    "film-blowing": "Film blowing",
    printing: "Printing",
    "bag-making": "Bag making",
    recycling: "Recycling",
  };
  return labels[c];
}
