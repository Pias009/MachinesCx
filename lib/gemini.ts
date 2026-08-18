export interface GeminiChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Executes a JSON-oriented completion request against Google Gemini AI API
 * (gemini-3.6-flash). Used for admin inquiry roadmaps, chatbot replies,
 * session insights, lead outreach drafts, and inquiry reviews.
 */
export async function geminiJsonCompletion(
  messages: GeminiChatMsg[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemMsgs = messages.filter(m => m.role === "system");
  const nonSystemMsgs = messages.filter(m => m.role !== "system");

  const systemInstruction =
    systemMsgs.length > 0
      ? { parts: [{ text: systemMsgs.map(m => m.content).join("\n\n") }] }
      : undefined;

  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const m of nonSystemMsgs) {
    const role = m.role === "assistant" ? "model" : "user";
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n\n" + m.content;
    } else {
      contents.push({ role, parts: [{ text: m.content }] });
    }
  }

  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "Please process according to system instructions." }] });
  }

  const payload = {
    systemInstruction,
    contents,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 2048,
    },
  };

  const timeoutMs = opts.timeoutMs ?? 30000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini API HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "";
    if (!text) {
      throw new Error("Gemini returned empty text response");
    }
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
