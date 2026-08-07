import { Schema, model, models } from "mongoose";

// Tiny key/value marker collection — currently just holds "when did we last
// opportunistically check for lead drafts to generate" (see lib/leadDrafts.ts),
// so that check can be throttled without a scheduled job.
export interface ISystemState {
  key: string;
  value: Date;
}

const SystemStateSchema = new Schema<ISystemState>({
  key:   { type: String, required: true, unique: true, index: true },
  value: { type: Date, required: true },
});

const SystemState = models.SystemState ?? model<ISystemState>("SystemState", SystemStateSchema);
export default SystemState;
