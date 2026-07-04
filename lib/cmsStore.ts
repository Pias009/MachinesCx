// ---------------------------------------------------------------------------
// Server-side CMS store — whitelisted JSON files under data/.
// Used by the admin data API (read/write) and the public content API (read).
// ---------------------------------------------------------------------------
import { promises as fs } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");

export async function readSection(section: CmsSection): Promise<unknown> {
  const raw = await fs.readFile(path.join(DATA_DIR, `${section}.json`), "utf8");
  return JSON.parse(raw);
}

export async function writeSection(section: CmsSection, data: unknown): Promise<void> {
  const file = path.join(DATA_DIR, `${section}.json`);
  const json = JSON.stringify(data, null, 2);
  // basic sanity: must be an object and parse back
  if (typeof data !== "object" || data === null) throw new Error("payload must be an object");
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, file);
}
