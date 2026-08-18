import { Schema, model, models } from "mongoose";

export interface IAiBrain {
  promptHash: string;
  category: string;
  response: string;
  hitCount: number;
  lastUsedAt: Date;
  createdAt: Date;
}

const AiBrainSchema = new Schema<IAiBrain>(
  {
    promptHash: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    response: { type: String, required: true },
    hitCount: { type: Number, default: 1 },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const AiBrain = models.AiBrain ?? model<IAiBrain>("AiBrain", AiBrainSchema);
export default AiBrain;
