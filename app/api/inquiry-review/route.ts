import { NextRequest } from "next/server";
import { families, type ProductFamily } from "@/lib/products";
import { groqJsonCompletion } from "@/lib/groq";

export const runtime = "nodejs";

const BASE = "https://openrouter.ai/api/v1";
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";
const FALLBACK_MODELS = [
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

interface OrderMachine { slug: string; name: string; series: string; model: string; qty: number; notes: string }
interface OrderPart { name: string; machine: string; quantity: number; notes: string }
interface ReviewMsg { role: "user" | "assistant"; content: string }

interface Suggestion {
  type: "add_machine" | "edit_machine_qty" | "edit_machine_notes" | "add_part";
  slug?: string;      // for add_machine / edit_machine_*
  index?: number;      // index into the current machines[] array, for edits
  qty?: number;
  notes?: string;
  name?: string;       // for add_part
  reason: string;      // short human-readable "why", shown on the suggestion chip
}

interface ReviewAnswer {
  text: string;
  suggestions: Suggestion[];
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

function buildOrderBlock(machines: OrderMachine[], parts: OrderPart[]): string {
  const lines: string[] = [];
  if (machines.length === 0 && parts.length === 0) {
    lines.push("(nothing added yet)");
  }
  machines.forEach((m, i) => {
    lines.push(`Machine ${i}: ${m.name} (${m.series}), model ${m.model}, qty ${m.qty}${m.notes ? `, notes: "${m.notes}"` : ""} [slug: ${m.slug}]`);
  });
  parts.forEach((p, i) => {
    lines.push(`Part ${i}: ${p.name} × ${p.quantity}${p.machine ? ` for ${p.machine}` : ""}${p.notes ? `, notes: "${p.notes}"` : ""}`);
  });
  return lines.join("\n");
}

function buildCatalogBlock(machines: OrderMachine[]): string {
  // Only surface machines from categories already touched by the order,
  // plus a short cross-category sample, so the prompt stays small.
  const touchedCats = new Set(machines.map(m => families.find((f: ProductFamily) => f.slug === m.slug)?.category).filter(Boolean));
  const relevant = families.filter((f: ProductFamily) => touchedCats.has(f.category));
  const rest = families.filter((f: ProductFamily) => !touchedCats.has(f.category)).slice(0, 8);
  const pool = [...relevant, ...rest];
  return pool.map((f: ProductFamily) => `${f.slug}: ${f.name} (${f.series}, ${f.category}) — ${f.tagline}`).join("\n");
}

const SYSTEM_PROMPT = (orderBlock: string, catalogBlock: string) => `You are an engineering assistant helping a customer review a machinery order before they submit it. Be concise, friendly, and specific — reference their actual picks, not generic advice.

CURRENT ORDER:
${orderBlock}

CATALOGUE (slug: Name (Series, category) — tagline):
${catalogBlock}

Reply ONLY with strict JSON: {"text":"your reply","suggestions":[]}

Each suggestion is one of:
{"type":"add_machine","slug":"catalog-slug","reason":"short reason"}
{"type":"edit_machine_qty","index":0,"qty":2,"reason":"short reason"}
{"type":"edit_machine_notes","index":0,"notes":"new notes text","reason":"short reason"}
{"type":"add_part","name":"part name","reason":"short reason"}

RULES:
- Only suggest machines that exist in the CATALOGUE list above, by exact slug.
- Only use "index" values that exist in the CURRENT ORDER's Machine list.
- Ask at most one clarifying question per reply — do not interrogate.
- If the order looks complete and sensible, say so plainly and suggest nothing.
- Keep "text" to 2-4 sentences.
- Never invent specs or prices.`;

function parseReviewJson(raw: string): ReviewAnswer | null {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch {
    return null;
  }
}

async function callGroq(messages: { role: "system" | "user" | "assistant"; content: string }[]): Promise<ReviewAnswer> {
  const raw = await groqJsonCompletion(messages, { maxTokens: 700, temperature: 0.4 });
  const parsed = parseReviewJson(raw);
  if (!parsed) throw new Error("Groq: could not parse JSON response");
  return parsed;
}

async function callOpenRouter(messages: { role: "system" | "user" | "assistant"; content: string }[]): Promise<ReviewAnswer> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter(m => m !== PRIMARY_MODEL)].slice(0, 3);
  const TIMEOUT_MS = 8000;
  let lastErr: unknown;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${BASE}/chat/completions`, {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getApiKey()}` },
        body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 700 }),
      });
    } catch {
      clearTimeout(timer);
      lastErr = "timeout / network";
      continue;
    }
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      let raw = (msg?.content || msg?.reasoning || "").trim();
      if (!raw) continue;
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          text: typeof parsed.text === "string" ? parsed.text : "",
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        };
      } catch {
        continue;
      }
    }
    lastErr = res.status;
    // 404 means this specific model id is gone/renamed — try the next model
    // instead of aborting, since a retired free-tier model shouldn't take
    // down the whole fallback chain. Only bail early on auth failures.
    if (res.status === 401 || res.status === 403) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
    }
  }
  throw new Error(`OpenRouter exhausted all models — last status ${lastErr}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const machines = (body?.machines ?? []) as OrderMachine[];
  const parts = (body?.parts ?? []) as OrderPart[];
  const history = (body?.history ?? []) as ReviewMsg[];

  if (!Array.isArray(machines) || !Array.isArray(parts) || !Array.isArray(history)) {
    return Response.json({ error: "machines, parts and history are required" }, { status: 400 });
  }

  const orderBlock = buildOrderBlock(machines, parts);
  const catalogBlock = buildCatalogBlock(machines);
  const apiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT(orderBlock, catalogBlock) },
    ...history.map(m => ({ role: m.role, content: m.content })),
  ];
  // First turn: no user message yet — ask the model to open with a review.
  if (history.length === 0) {
    apiMessages.push({ role: "user", content: "Please review my order and share any thoughts or questions." });
  }

  try {
    let answer: ReviewAnswer;
    try {
      answer = await callGroq(apiMessages);
    } catch (groqErr) {
      console.error("inquiry-review: Groq unavailable, falling back to OpenRouter:", groqErr);
      answer = await callOpenRouter(apiMessages);
    }
    // Guard against a hallucinated slug/index slipping through.
    const validSlugs = new Set(families.map((f: ProductFamily) => f.slug));
    const suggestions = answer.suggestions.filter(s => {
      if (s.type === "add_machine") return !!s.slug && validSlugs.has(s.slug);
      if (s.type === "edit_machine_qty" || s.type === "edit_machine_notes") return typeof s.index === "number" && s.index >= 0 && s.index < machines.length;
      if (s.type === "add_part") return !!s.name;
      return false;
    });
    return Response.json({ text: answer.text, suggestions });
  } catch (e) {
    console.error("inquiry-review: OpenRouter unavailable:", e);
    return Response.json({
      text: "I couldn't reach the review assistant right now — no problem, you can skip this and continue, or try again in a moment.",
      suggestions: [],
      unavailable: true,
    });
  }
}
