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

export interface IChatSession {
  sessionId: string;
  messages: ChatMessageDoc[];
  contactCaptured?: { name?: string; email?: string; phone?: string };
  pendingInquiry?: PendingInquiryDoc | null;
  // Guards lib/leadNotify.ts from sending more than one "lead captured"
  // heads-up email per session, even though the guided flow can re-touch
  // pendingInquiry.email across several turns.
  leadNotified?: boolean;
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
  // TTL index: Mongo deletes the document 180 days after createdAt,
  // automatically — extended from the original 7 days so chat transcripts
  // stay around long enough for the admin analytics "AI chat activity" view.
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

const ChatSession = models.ChatSession ?? model<IChatSession>("ChatSession", ChatSessionSchema);
export default ChatSession;
