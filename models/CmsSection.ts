import mongoose, { Schema, model, models } from "mongoose";

export interface ICmsSection {
  section: string;
  data: Record<string, unknown>;
  updatedAt: Date;
}

const CmsSectionSchema = new Schema<ICmsSection>({
  section: { type: String, required: true, unique: true, index: true },
  data:    { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const CmsSection = models.CmsSection ?? model<ICmsSection>("CmsSection", CmsSectionSchema);
export default CmsSection;
