import Groq from "groq-sdk";
import { categories, families } from "@/lib/products";
import type { ChatMessageDoc } from "@/models/ChatSession";
import type { LocalAnswer } from "@/lib/localAgent";
import { geminiJsonCompletion } from "@/lib/gemini";
import { getBrainResponse, saveBrainResponse, hashMessages } from "@/lib/aiBrain";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
// Active fallback model if primary Groq model fails
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
 * Low-level helper shared by ASHA's chat, admin inquiry roadmaps, analytics insights,
 * and order-review assistants: checks the local AI Brain first (0 tokens), then tries Gemini 3.6 Flash,
 * then falls back to Groq/OpenRouter.
 */
export async function groqJsonCompletion(
  messages: GroqChatMsg[],
  opts: { maxTokens?: number; temperature?: number; bypassCache?: boolean } = {},
): Promise<string> {
  const promptHash = hashMessages(messages);

  // 1. Check local AI Brain (Zero token usage, <2ms response)
  if (!opts.bypassCache) {
    const cached = await getBrainResponse(promptHash);
    if (cached) {
      return cached;
    }
  }

  let resultText = "";

  // 2. Try Primary Gemini AI Model
  if (process.env.GEMINI_API_KEY) {
    try {
      resultText = await geminiJsonCompletion(messages, opts);
    } catch (geminiErr) {
      console.error("groqJsonCompletion: Gemini failed, falling back to Groq:", geminiErr);
    }
  }

  // 3. Fall back to Groq Models
  if (!resultText) {
    try {
      const client = getClient();
      const modelsToTry = [MODEL, FALLBACK_MODEL].filter((m, i, arr) => arr.indexOf(m) === i);
      let lastErr: unknown;

      for (const model of modelsToTry) {
        try {
          const completion = await client.chat.completions.create({
            model,
            messages,
            temperature: opts.temperature ?? 0.4,
            max_tokens: opts.maxTokens ?? 1024,
            response_format: { type: "json_object" },
          });
          const raw = completion.choices?.[0]?.message?.content || "";
          if (raw) {
            resultText = raw;
            break;
          }
        } catch (e) {
          lastErr = e;
          continue;
        }
      }
    } catch (groqInitErr) {
      console.error("groqJsonCompletion: Groq client init failed:", groqInitErr);
    }
  }

  if (!resultText) {
    throw new Error("AI Completion service failed — exhausted all Gemini and Groq models.");
  }

  // Save successful response into AI Brain for future zero-token instant reuse
  saveBrainResponse(promptHash, "ai_completion", resultText).catch(() => {});

  return resultText;
}



// Names + series only, no specs — a message naming any specific machine or
// model number is already caught by lib/localAgent.ts's findMachines() and
// answered locally with real spec data before this ever reaches Groq (see
// isBasicQuery), so Groq only needs enough of the catalog to recognize and
// reference machines by name, not recite their full spec sheets. Keeping
// full specs here was the main contributor to blowing the free-tier
// tokens-per-minute limit a few turns into a real conversation.
function buildCatalogBlock(): string {
  const lines: string[] = [];
  for (const c of categories) {
    const catFamilies = families.filter(f => f.category === c.slug);
    lines.push(`[${c.name}] ${catFamilies.map(f => f.name).join(", ")}`);
  }
  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are ASHA, the AI sales & technical assistant for ASHAL INNOMACH, a plastics processing machinery manufacturer (film blowing, bag making, recycling, printing lines).

You are knowledgeable and capable well beyond a spec lookup tool: answer any question the visitor asks — how a process works (e.g. how blown film extrusion works, what a granulator does), industry/material questions (plastics, resins, output units), general business questions about working with ASHAL INNOMACH, troubleshooting-style questions, or general knowledge questions unrelated to machinery. Be substantive and specific, not a generic chatbot deflecting to "I can only help with machines." If a question is genuinely outside anything useful you can say, answer as best you can and gently note your specialty is ASHAL INNOMACH's machinery.

The PRODUCTS list below has names only, grouped by category — NOT specs, NOT model numbers, NOT capacities. If the visitor names a specific machine, that message never reaches you (a separate system answers it from the real spec sheet). If a visitor asks a spec/number question you land on anyway, do NOT invent a figure — tell them to name the machine directly (e.g. "ask me about the ABCDE-2200") and it'll pull the exact numbers. You may still name/recommend machines from the list by name and category.

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

export type FlowStage = "name" | "email" | "qty";

export interface FlowClassification {
  intent: "answer" | "cancel" | "question" | "unclear";
  /** Cleaned value (name / email / quantity) when intent === "answer". */
  value: string | null;
  /** Short answer to relay to the visitor when intent === "question". */
  reply: string | null;
}

const FLOW_FIELD_LABEL: Record<FlowStage, string> = {
  name: "their full name",
  email: "their email address",
  qty: "the quantity (a number) they want",
};

/**
 * Classifies a single reply inside ASHA's guided name → email → qty inquiry
 * flow. Used as the smart fallback when lib/localAgent.ts's cheap regex
 * checks can't confidently tell a real answer apart from filler ("ok"), a
 * cancel request, or an unrelated question — regex kept misjudging these
 * (e.g. "yeah sure" read as a name), so ambiguous replies now get a real
 * LLM judgment call instead of another hand-tuned heuristic.
 */
export async function classifyFlowReply(
  stage: FlowStage,
  message: string,
  machineName: string,
): Promise<FlowClassification> {
  const prompt = `You are classifying ONE visitor reply inside a guided sales-inquiry chat. They were just asked for ${FLOW_FIELD_LABEL[stage]} regarding "${machineName}".

Classify the reply into exactly one intent:
- "answer": a plausible, genuine ${stage}. Put it cleaned of filler/stray punctuation into "value".
- "cancel": they want to stop or back out of this inquiry (e.g. "cancel", "nevermind", "not interested", "stop", "forget it", "I changed my mind").
- "question": they're asking something unrelated instead of answering (e.g. "how do I install this?", "what's the warranty?", "does it ship to Brazil?"). Put a short, honest, helpful answer in "reply" — if you don't actually know, say so briefly, never invent facts.
- "unclear": pure filler/acknowledgement with no real content ("ok", "yes", "sure", "hi", a random word) — not a real ${stage}, not a cancel, not a real question.

Reply ONLY with this JSON: {"intent":"answer","value":"...","reply":null} — pick the one matching intent, keep the other two fields null.`;

  const messages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: prompt },
    { role: "user", content: message },
  ];

  try {
    const raw = await groqJsonCompletion(messages, { maxTokens: 300, temperature: 0.1 });
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { intent: "unclear", value: null, reply: null };
    const parsed = JSON.parse(jsonMatch[0]);
    const intent: FlowClassification["intent"] =
      parsed.intent === "answer" || parsed.intent === "cancel" || parsed.intent === "question"
        ? parsed.intent
        : "unclear";
    return {
      intent,
      value: typeof parsed.value === "string" ? parsed.value : null,
      reply: typeof parsed.reply === "string" ? parsed.reply : null,
    };
  } catch {
    return { intent: "unclear", value: null, reply: null };
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
