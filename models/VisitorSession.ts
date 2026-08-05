import { Schema, model, models } from "mongoose";

export interface PageViewEntry {
  path: string;
  enteredAt: Date;
  durationMs: number;
}

export interface IVisitorSession {
  sessionId: string;
  ip: string;
  countryCode?: string;
  region?: string;
  city?: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  referrer?: string;
  source?: string;
  landingPath?: string;
  locale?: string;
  pageViews: PageViewEntry[];
  totalDurationMs: number;
  chatOpened: boolean;
  firstSeen: Date;
  lastSeen: Date;
}

const PageViewSchema = new Schema<PageViewEntry>({
  path:       { type: String, required: true },
  enteredAt:  { type: Date, required: true },
  durationMs: { type: Number, default: 0 },
}, { _id: false });

const VisitorSessionSchema = new Schema<IVisitorSession>({
  sessionId:     { type: String, required: true, unique: true, index: true },
  ip:            { type: String, default: "" },
  countryCode:   { type: String, default: "" },
  region:        { type: String, default: "" },
  city:          { type: String, default: "" },
  userAgent:     { type: String, default: "" },
  browser:       { type: String, default: "" },
  os:            { type: String, default: "" },
  device:        { type: String, default: "" },
  referrer:      { type: String, default: "" },
  source:        { type: String, default: "" },
  landingPath:   { type: String, default: "" },
  locale:        { type: String, default: "" },
  pageViews:     { type: [PageViewSchema], default: [] },
  totalDurationMs: { type: Number, default: 0 },
  chatOpened:    { type: Boolean, default: false },
  firstSeen:     { type: Date, default: Date.now },
  // TTL index: Mongo deletes the document 180 days after firstSeen — long
  // enough for real behavioral analysis, short enough not to accumulate
  // visitor IPs/UAs indefinitely.
  lastSeen:      { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

const VisitorSession = models.VisitorSession ?? model<IVisitorSession>("VisitorSession", VisitorSessionSchema);
export default VisitorSession;
