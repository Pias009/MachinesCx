// Run: node scripts/seed.mjs
// Seeds MongoDB with initial CMS data from the JSON files in data/

import mongoose from "mongoose";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const sections = [
  "products",
  "home-hero",
  "machine-catalog",
  "production-line",
  "flexo-strip",
  "printing-showcase",
  "scrollhome-bags",
];

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collection = db.collection("cmssections");

  for (const section of sections) {
    const filePath = join(DATA_DIR, `${section}.json`);
    let data;
    try {
      const raw = readFileSync(filePath, "utf8");
      data = JSON.parse(raw);
    } catch (err) {
      console.warn(`  ⚠  Could not read ${section}.json, skipping`);
      continue;
    }

    await collection.updateOne(
      { section },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true },
    );
    console.log(`  ✓ ${section}`);
  }

  console.log("Done — all sections seeded.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
