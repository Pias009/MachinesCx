import { connectDB } from "@/lib/mongodb";
import CmsSection from "@/models/CmsSection";

export const CMS_SECTIONS = [
  "products",
  "machine-catalog",
  "production-line",
  "flexo-strip",
  "printing-showcase",
  "scrollhome-bags",
] as const;

export type CmsSection = (typeof CMS_SECTIONS)[number];

export function isCmsSection(s: string): s is CmsSection {
  return (CMS_SECTIONS as readonly string[]).includes(s);
}

export async function readSection(section: CmsSection): Promise<unknown> {
  await connectDB();
  const doc = await CmsSection.findOne({ section }).lean();
  if (!doc) throw new Error(`section "${section}" not found in database`);
  return doc.data;
}

export async function writeSection(section: CmsSection, data: unknown): Promise<void> {
  if (typeof data !== "object" || data === null) throw new Error("payload must be an object");
  await connectDB();
  await CmsSection.updateOne(
    { section },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true },
  );
}
