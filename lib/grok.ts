// ---------------------------------------------------------------------------
// xAI Grok API client — OpenAI-compatible chat completions, streamed.
// GROK_API_KEY is read lazily (only when a chat is actually sent), matching
// the lib/resend.ts pattern, so the app still boots without it configured.
// ---------------------------------------------------------------------------

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = process.env.GROK_MODEL || "grok-4-fast";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getApiKey(): string {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error("GROK_API_KEY is not set — add it to .env.local (get one at https://console.x.ai)");
  return key;
}

/** Streams a Grok chat completion. Yields text chunks as they arrive. */
export async function* streamGrokChat(messages: ChatMessage[]): AsyncGenerator<string> {
  const res = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages,
      stream: true,
      temperature: 0.4,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Grok API error ${res.status}: ${detail.slice(0, 500)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        // partial/non-JSON chunk — skip
      }
    }
  }
}

/** Non-streaming variant, used where a single string result is simpler. */
export async function grokChat(messages: ChatMessage[]): Promise<string> {
  let out = "";
  for await (const chunk of streamGrokChat(messages)) out += chunk;
  return out;
}
