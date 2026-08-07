import { Schema, model, models } from "mongoose";

export interface ChatMessageDoc {
  role: "user" | "assistant";
  content: string;
  at: Date;
}

// Structured UI actions ASHA's reply can carry — shared between the local
// answer engine (lib/localAgent.ts), the chat route, and the widget
// (components/ChatWidget.tsx) that renders them.
export type ChatAction =
  | { type: "navigate"; slug: string }
  | { type: "show_machines"; slugs: string[] }
  | { type: "compare"; slugs: string[]; specLabels: string[] }
  | { type: "quick_replies"; options: string[] };

export interface PendingInquiryDoc {
  stage: "name" | "email" | "qty" | "done";
  slug?: string;
  machineName?: string;
  name?: string;
  email?: string;
  qty?: number;
}

export interface HookDraft {
  subject: string;
  body: string;
  generatedAt: Date;
  // "failed" marks a session where Groq drafting errored out — without it,
  // lib/leadDrafts.ts's `hookDraft: null` candidate query would keep
  // re-selecting (and re-failing on) the same session every throttle
  // window forever, crowding out real leads from its limited per-run slots.
  status: "pending" | "sent" | "dismissed" | "failed";
  sentAt?: Date;
}

export interface IChatSession {
  sessionId: string;
  messages: ChatMessageDoc[];
  contactCaptured?: { name?: string; email?: string; phone?: string };
  pendingInquiry?: PendingInquiryDoc | null;
  // Guards lib/leadNotify.ts from sending more than one "lead captured"
  // heads-up email per session, even though the guided flow can re-touch
  // pendingInquiry.email across several turns.
  leadNotified?: boolean;
  // Set the moment leadNotified flips true — lib/leadDrafts.ts (triggered
  // opportunistically from app/api/track/route.ts on real visitor traffic,
  // not on a schedule) waits a few minutes past this before drafting the
  // outreach email, so the draft reflects a more complete conversation
  // instead of firing the instant an email is typed.
  leadCapturedAt?: Date | null;
  // AI-drafted outreach email to the visitor — never auto-sent, an admin
  // reviews/edits and sends it from the analytics session detail panel.
  hookDraft?: HookDraft | null;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<ChatMessageDoc>({
  role:    { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  at:      { type: Date, default: Date.now },
}, { _id: false });

const PendingInquirySchema = new Schema<PendingInquiryDoc>({
  stage:       { type: String, enum: ["name", "email", "qty", "done"], required: true },
  slug:        { type: String },
  machineName: { type: String },
  name:        { type: String },
  email:       { type: String },
  qty:         { type: Number },
}, { _id: false });

const HookDraftSchema = new Schema<HookDraft>({
  subject:     { type: String, required: true },
  body:        { type: String, required: true },
  generatedAt: { type: Date, required: true },
  status:      { type: String, enum: ["pending", "sent", "dismissed", "failed"], default: "pending" },
  sentAt:      { type: Date },
}, { _id: false });

const ChatSessionSchema = new Schema<IChatSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages:  { type: [ChatMessageSchema], default: [] },
  contactCaptured: {
    name:  { type: String },
    email: { type: String },
    phone: { type: String },
  },
  pendingInquiry: { type: PendingInquirySchema, default: null },
  leadNotified: { type: Boolean, default: false },
  leadCapturedAt: { type: Date, default: null },
  hookDraft: { type: HookDraftSchema, default: null },
  // TTL index: Mongo deletes the document 180 days after createdAt,
  // automatically — extended from the original 7 days so chat transcripts
  // stay around long enough for the admin analytics "AI chat activity" view.
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

const ChatSession = models.ChatSession ?? model<IChatSession>("ChatSession", ChatSessionSchema);
export default ChatSession;
