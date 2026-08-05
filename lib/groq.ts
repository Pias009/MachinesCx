import Groq from "groq-sdk";
import { categories, families } from "@/lib/products";
import type { ChatMessageDoc } from "@/models/ChatSession";
import type { LocalAnswer } from "@/lib/localAgent";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
// Smaller/faster model kept as a same-provider fallback if the primary model
// errors or is deprecated — avoids a full drop to OpenRouter for a transient issue.
const FALLBACK_MODEL = "llama-3.1-8b-instant";

function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey });
}

interface GroqChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Low-level helper shared by ASHA's chat and order-review assistants: tries
 * the primary model then the fast fallback model, returns raw JSON text.
 */
export async function groqJsonCompletion(
  messages: GroqChatMsg[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const client = getClient();
  const modelsToTry = [MODEL, FALLBACK_MODEL].filter((m, i, arr) => arr.indexOf(m) === i);
  let lastErr: unknown;

  for (const model of modelsToTry) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 2048,
        response_format: { type: "json_object" },
      });
      const raw = completion.choices?.[0]?.message?.content || "";
      if (raw) return raw;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw new Error(`Groq exhausted all models — last error: ${String(lastErr)}`);
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

const SYSTEM_PROMPT = `You are ASHA, the AI sales & technical assistant for ASHAL INNOMACH, a plastics processing machinery manufacturer (film blowing, bag making, recycling, printing lines).

You are knowledgeable and capable well beyond a spec lookup tool: answer any question the visitor asks — machine specs, how a process works (e.g. how blown film extrusion works, what a granulator does), industry/material questions (plastics, resins, output units), general business questions about working with ASHAL INNOMACH, comparisons, troubleshooting-style questions, or general knowledge questions unrelated to machinery. Be substantive and specific, not a generic chatbot deflecting to "I can only help with machines." If a question is genuinely outside anything useful you can say, answer as best you can and gently note your specialty is ASHAL INNOMACH's machinery.

For facts about ASHAL INNOMACH's own machines, ONLY use the PRODUCTS catalog below — never invent a spec, model number, or capability that isn't listed. For general/world knowledge, answer from your own knowledge normally.

Format the "text" value for a chat bubble, never as a dense wall of prose:
- Wrap key numbers, specs, model names, and other load-bearing terms in **double asterisks** so they stand out.
- Whenever you're listing 2+ items — specs, options, steps, considerations, pros/cons — put each on its own line starting with "- ". Do not bury a list inside one paragraph.
- Keep paragraphs short: 1-3 sentences, then break or list. A multi-part answer should read as short paragraph(s) + bullets, not one long block.
- Use only "- " bullets and **bold** — no headers, no numbered lists, no tables, no markdown links.

Reply ONLY with this JSON format (no prose outside the JSON): {"text":"reply","actions":[],"pendingInquiry":null,"completedInquiry":null}

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

RULES: Use the catalog only for ASHAL INNOMACH's own machine facts — never invent specs. Show machines when the user names one or a category. Compare for "compare X and Y". Start the inquiry flow when the user wants to buy. For anything else (how things work, general questions, advice), answer helpfully and in depth using your own knowledge, still wrapped in the same JSON envelope with empty actions.`;

interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

function extractJson(raw: string): LocalAnswer | null {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      text: parsed.text || "",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      pendingInquiry: parsed.pendingInquiry ?? null,
      completedInquiry: parsed.completedInquiry ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function answerWithGroq(
  messages: ChatMessageDoc[],
  pendingInquiry: LocalAnswer["pendingInquiry"],
): Promise<LocalAnswer> {
  const statusNote = pendingInquiry
    ? `[Inquiry in progress: stage=${pendingInquiry.stage}, machine=${pendingInquiry.machineName || pendingInquiry.slug || "—"}]`
    : "[No active inquiry]";

  const apiMessages: ChatMsg[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: statusNote },
    ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const raw = await groqJsonCompletion(apiMessages);
  const parsed = extractJson(raw);
  if (!parsed) throw new Error("Groq: could not parse JSON response");
  return parsed;
}
