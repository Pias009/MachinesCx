# ASHA — AI Sales Helper Agent

## Overview

ASHA (AI Sales Helper Agent) is a dual-engine chatbot embedded on every page. It answers questions about the machine catalogue, compares products, and runs a guided inquiry flow — all without a separate training step.

```
User → ChatWidget → POST /api/chat → isBasicQuery()?
  → YES → answerLocally()   (rule-based, instant, zero cost)
  → NO  → answerWithOpenRouter() with 10s timeout
            → fails/timeout → falls back to answerLocally()
  → Save to MongoDB → NDJSON stream → ChatWidget renders it
```

---

## Architecture (3 tiers)

### 1. Frontend — `components/ChatWidget.tsx`

Floating chat panel (hard-hat launcher button, bottom-right). Features:
- Persistent session via `sessionId` in `localStorage` (UUID)
- Message history loaded from `GET /api/chat?sessionId=` on open
- Renders rich actions inline:
  - **Machine cards** (`show_machines`) — thumbnails + name + "Inquire" button
  - **Comparison charts** (`compare`) — grouped bar charts + spec table
  - **Quick-reply chips** (`quick_replies`) — clickable category options
  - **Navigate** (`navigate`) — auto-redirects to product page
- Expandable panel (small ↔ large mode)
- Tooltip promo on first visit
- Global open API: `window.dispatchEvent(new CustomEvent("asha:open", { detail: { prefillMessage } }))`

### 2. API Route — `app/api/chat/route.ts`

**`POST /api/chat`** — accepts `{ sessionId, message }`, returns NDJSON:
```json
{"type":"delta","text":"..."}
{"type":"final","text":"...","actions":[...]}
```

Flow:
1. Connect to MongoDB, find or create session by `sessionId`
2. Push user message to session history
3. If `isBasicQuery()` → skip LLM, use `answerLocally()`
4. Else → `Promise.race([answerWithOpenRouter(), 10s timeout])`
   - LLM succeeds → use parsed reply
   - LLM fails/timeout → fallback to `answerLocally()`
5. Push assistant reply to session, save to MongoDB
6. If `completedInquiry` returned → call `createInquiry()` (saves to MongoDB + emails admin)
7. Return NDJSON stream

**`GET /api/chat?sessionId=`** — returns `{ messages: [...] }` for history.

**`GET /api/chat/machines?slugs=a,b,c`** — returns machine summaries for card rendering.

### 3. Answer Engines

#### Primary: OpenRouter LLM — `lib/openrouter.ts`

| Config | Value |
|---|---|
| Base URL | `https://openrouter.ai/api/v1` |
| Primary model | `liquid/lfm-2.5-1.2b-instruct:free` (or `OPENROUTER_MODEL` env) |
| Fallback models | `meta-llama/llama-3.3-70b-instruct:free`, `llama-3.2-3b-instruct:free`, `gemma-4-26b-a4b-it:free`, `qwen/qwen3-coder:free` |
| Retry strategy | Try primary + 1 fallback (max 2 total) |
| Timeout per model | 7s (AbortController) |
| Temperature | 0.3 |
| Max tokens | 2048 |

System prompt includes:
- Full product catalogue as context (built live from `lib/products.ts`)
- JSON-only response format instruction
- Available actions (`quick_replies`, `show_machines`, `compare`)
- Guided inquiry flow protocol

All replies must be valid JSON: `{"text":"...","actions":[],"pendingInquiry":null,"completedInquiry":null}`

#### Fallback: Rule-Based Engine — `lib/localAgent.ts`

Zero-cost, zero-hallucination engine. Reads live catalogue data directly.

Triggers (checked in order):
1. **Active inquiry flow** — continues name/email/qty collection
2. **Greetings** — welcome message + category quick-replies
3. **Identity questions** — "who are you" → brand intro
4. **Buy intent** — starts guided inquiry flow
5. **Compare** (≥2 machines named) — inline comparison + chart action
6. **Multiple machines matched** — card grid
7. **Single machine matched** — full spec summary + card
8. **Category match** — lists all machines in category
9. **Recommend** with qualifier — filters by output/capacity/colors
10. **List/show** — category quick-replies
11. **Fallback** — "I'm not sure" + category quick-replies

Fuzzy matching: normalizes input, checks series/slug/model numbers (strong), then distinguishing name words (weak). Ignores generic words like "machine", "film", "bag".

#### Available (not wired): Grok — `lib/grok.ts`

xAI Grok API client (`grok-4-fast`). Supports streaming and non-streaming. OpenAI-compatible. Not currently connected to the chat route but available for future use.

---

## Knowledge / Context

### `lib/chatKnowledge.ts`
Builds a compact text block from the live product catalogue (`data/products.json` via `lib/products.ts`). Grouped by category, includes model names, specs per model, installation steps, delivery timelines. No separate ingestion/training — data is live every request.

### `data/products.json`
Full catalogue with typed structure: categories, families, models, specs, images, installation steps, delivery guide. Editable via admin panel at `/cx-ops-x7k9q2/`.

---

## Database

### `models/ChatSession.ts` — MongoDB
```typescript
{
  sessionId: string;          // UUID, unique indexed
  messages: { role, content, at }[];
  pendingInquiry: {           // guided flow state
    stage: "name"|"email"|"qty"|"done";
    slug?: string;
    machineName?: string;
    name?: string;
    email?: string;
    qty?: number;
  } | null;
  createdAt: Date;            // TTL index: auto-deletes after 7 days
}
```

### `models/Inquiry.ts` — MongoDB
Created by both the contact form and ASHA's guided inquiry flow. Source-tracked (`"direct"` vs chat).

### `lib/inquiries.ts`
Shared logic: validates input, saves to MongoDB, sends admin notification email via Resend. Used by both the contact form route and the chat route.

---

## Key Files

| File | Purpose |
|---|---|
| `components/ChatWidget.tsx` | Chat UI — panel, messages, cards, charts, quick replies |
| `app/api/chat/route.ts` | POST/GET endpoints for chat messages |
| `app/api/chat/machines/route.ts` | GET machine summaries for card/chart rendering |
| `lib/openrouter.ts` | OpenRouter LLM client with retry + timeout |
| `lib/localAgent.ts` | Rule-based fallback engine (no API key needed) |
| `lib/chatKnowledge.ts` | Catalogue context builder for LLM system prompt |
| `lib/grok.ts` | xAI Grok client (available, not wired) |
| `lib/inquiries.ts` | Shared inquiry creation (form + chat) |
| `models/ChatSession.ts` | Chat session Mongoose schema |
| `data/products.json` | Full machine catalogue |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM |
| `OPENROUTER_MODEL` | Model override (default: `liquid/lfm-2.5-1.2b-instruct:free`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `RESEND_API_KEY` | Email sending (inquiry notifications) |
| `ADMIN_EMAIL` / `INQUIRY_NOTIFY_EMAIL` | Where inquiry notifications go |
| `GROK_API_KEY` | xAI key (optional, for Grok) |
| `GROK_MODEL` | Grok model (default: `grok-4-fast`) |

---

## Extending / Modifying

- **Add a new machine** → edit `data/products.json`. Available to ASHA immediately — no ingestion step.
- **Add a new intent pattern** → edit `lib/localAgent.ts` (add keyword lists + handler).
- **Change LLM model** → set `OPENROUTER_MODEL` env var, or edit the `FALLBACK_MODELS` array.
- **Wire up Grok** → update `app/api/chat/route.ts` to call `grokChat()` or `streamGrokChat()`.
- **Change chat UI** → `components/ChatWidget.tsx` — all styles are co-located `<style jsx>`.
