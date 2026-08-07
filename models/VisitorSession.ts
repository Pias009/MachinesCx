import { Schema, model, models } from "mongoose";

export interface PageViewEntry {
  path: string;
  enteredAt: Date;
  durationMs: number;
}

export interface AiInsight {
  text: string;
  intentSignal: "high" | "medium" | "low";
  generatedAt: Date;
  basedOnPageCount: number;
  basedOnMessageCount: number;
}

export interface IVisitorSession {
  sessionId: string;
  ip: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
  clientTimezone?: string;
  connectionType?: string;
  referrer?: string;
  source?: string;
  landingPath?: string;
  locale?: string;
  pageViews: PageViewEntry[];
  totalDurationMs: number;
  chatOpened: boolean;
  aiInsight?: AiInsight | null;
  firstSeen: Date;
  lastSeen: Date;
}

const PageViewSchema = new Schema<PageViewEntry>({
  path:       { type: String, required: true },
  enteredAt:  { type: Date, required: true },
  durationMs: { type: Number, default: 0 },
}, { _id: false });

const AiInsightSchema = new Schema<AiInsight>({
  text:               { type: String, required: true },
  intentSignal:       { type: String, enum: ["high", "medium", "low"], required: true },
  generatedAt:        { type: Date, required: true },
  basedOnPageCount:   { type: Number, required: true },
  basedOnMessageCount:{ type: Number, required: true },
}, { _id: false });

const VisitorSessionSchema = new Schema<IVisitorSession>({
  sessionId:     { type: String, required: true, unique: true, index: true },
  ip:            { type: String, default: "" },
  countryCode:   { type: String, default: "" },
  region:        { type: String, default: "" },
  city:          { type: String, default: "" },
  latitude:      { type: String, default: "" },
  longitude:     { type: String, default: "" },
  timezone:      { type: String, default: "" },
  userAgent:     { type: String, default: "" },
  browser:       { type: String, default: "" },
  os:            { type: String, default: "" },
  device:        { type: String, default: "" },
  screenWidth:   { type: Number },
  screenHeight:  { type: Number },
  viewportWidth: { type: Number },
  viewportHeight:{ type: Number },
  language:      { type: String, default: "" },
  clientTimezone:{ type: String, default: "" },
  connectionType:{ type: String, default: "" },
  referrer:      { type: String, default: "" },
  source:        { type: String, default: "" },
  landingPath:   { type: String, default: "" },
  locale:        { type: String, default: "" },
  pageViews:     { type: [PageViewSchema], default: [] },
  totalDurationMs: { type: Number, default: 0 },
  chatOpened:    { type: Boolean, default: false },
  aiInsight:     { type: AiInsightSchema, default: null },
  firstSeen:     { type: Date, default: Date.now },
  // TTL index: Mongo deletes the document 180 days after lastSeen — long
  // enough for real behavioral analysis, short enough not to accumulate
  // visitor IPs/UAs indefinitely. Keyed off lastSeen (not firstSeen) so a
  // sliding window keeps active/returning visitors alive rather than
  // expiring them on a fixed clock from their very first visit.
  lastSeen:      { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

const VisitorSession = models.VisitorSession ?? model<IVisitorSession>("VisitorSession", VisitorSessionSchema);
export default VisitorSession;
