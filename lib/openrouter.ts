import { categories, families } from "@/lib/products";
import type { ChatMessageDoc } from "@/models/ChatSession";
import type { LocalAnswer } from "@/lib/localAgent";

const BASE = "https://openrouter.ai/api/v1";
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "liquid/lfm-2.5-1.2b-instruct:free";
const FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3-coder:free",
];

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  return key;
}

function buildCatalogBlock(): string {
  const lines: string[] = [];
  for (const c of categories) {
    const catFamilies = families.filter(f => f.category === c.slug);
    lines.push(`[${c.name}] ${c.tagline}`);
    for (const f of catFamilies) {
      const topSpecs = f.specs.slice(0, 4).map(s => `${s.label}: ${s.values.join("/")}`).join("; ");
      lines.push(`  ${f.name} (${f.series}) models: ${f.models.join(", ")} — ${topSpecs}`);
    }
  }
  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are ASHA, a sales assistant. Reply ONLY with this JSON format: {"text":"reply","actions":[],"pendingInquiry":null,"completedInquiry":null}

Available actions:
- quick_replies: {"type":"quick_replies","options":["Film Blowing","Bag Making","Recycling","Printing"]}
- show_machines: {"type":"show_machines","slugs":["slug-here"]}
- compare (exactly 2 machines): {"type":"compare","slugs":["s1","s2"],"specLabels":["Width","Output"]}

Inquiry flow (buy/inquire intent):
Step1: {"text":"What's your name?","actions":[],"pendingInquiry":{"stage":"name","slug":"s","machineName":"m"},"completedInquiry":null}
Step2: {"text":"Your email?","actions":[],"pendingInquiry":{"stage":"email","slug":"s","machineName":"m"},"completedInquiry":null}
Step3: {"text":"How many?","actions":[],"pendingInquiry":{"stage":"qty","slug":"s","machineName":"m"},"completedInquiry":null}
Step4 done: {"text":"Inquiry sent!","actions":[],"pendingInquiry":null,"completedInquiry":{"name":"n","email":"e","qty":1,"slug":"s","machineName":"m"}}

PRODUCTS:
${buildCatalogBlock()}

RULES: Use catalog only. Show machines when user names a category. Compare for "compare X and Y". Start inquiry flow when user wants to buy. Never invent specs.`;

interface OpenRouterMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function answerWithOpenRouter(
  messages: ChatMessageDoc[],
  pendingInquiry: LocalAnswer["pendingInquiry"],
): Promise<LocalAnswer> {
  const statusNote = pendingInquiry
    ? `[Inquiry in progress: stage=${pendingInquiry.stage}, machine=${pendingInquiry.machineName || pendingInquiry.slug || "—"}]`
    : "[No active inquiry]";

  const apiMessages: OpenRouterMsg[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: statusNote },
    ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  // Try the primary model + at most one fallback to keep latency tolerable.
  // If both fail, the route falls back to the local engine instead.
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter(m => m !== PRIMARY_MODEL)].slice(0, 2);
  let lastErr: unknown;

  const TIMEOUT_MS = 7000;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${BASE}/chat/completions`, {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });
    } catch {
      clearTimeout(timer);
      // Timeout or network error — skip to next model or bail
      lastErr = "timeout / network";
      continue;
    }
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      let raw = msg?.content || msg?.reasoning || "";
      if (!raw) continue;
      raw = raw.trim();
      // Strip markdown fences if present
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
      // Find the first JSON object in the text if surrounded by non-JSON
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          text: parsed.text || "",
          actions: Array.isArray(parsed.actions) ? parsed.actions : [],
          pendingInquiry: parsed.pendingInquiry ?? null,
          completedInquiry: parsed.completedInquiry ?? undefined,
        };
      } catch {
        continue;
      }
    }

    lastErr = res.status;
    const detail = await res.text().catch(() => "");
    // Only retry on rate-limit / provider errors; bail on bad request/auth
    if (res.status !== 429 && res.status !== 502 && res.status !== 503) {
      throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
    }
  }

  throw new Error(`OpenRouter exhausted all models — last status ${lastErr}`);
}
