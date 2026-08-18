import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import AiBrain from "@/models/AiBrain";

// In-Memory L1 Cache for immediate zero-latency hits
const l1Cache = new Map<string, string>();
const MAX_L1_SIZE = 500;

export function hashMessages(messages: { role: string; content: string }[]): string {
  const norm = messages
    .map(m => `${m.role}:${m.content.trim().toLowerCase().replace(/\s+/g, " ")}`)
    .join("|");
  return crypto.createHash("sha256").update(norm).digest("hex");
}

/**
 * Checks if a response for the given prompt hash is already learned and stored
 * in memory or MongoDB. If found, returns the cached text, bypassing AI API calls
 * completely to save tokens and eliminate rate limits.
 */
export async function getBrainResponse(promptHash: string): Promise<string | null> {
  // 1. Check L1 Memory Cache
  if (l1Cache.has(promptHash)) {
    return l1Cache.get(promptHash)!;
  }

  // 2. Check MongoDB Persistent Brain
  try {
    await connectDB();
    const doc = await AiBrain.findOne({ promptHash }).lean();
    if (doc?.response) {
      if (l1Cache.size >= MAX_L1_SIZE) {
        const firstKey = l1Cache.keys().next().value;
        if (firstKey) l1Cache.delete(firstKey);
      }
      l1Cache.set(promptHash, doc.response);

      AiBrain.updateOne(
        { promptHash },
        { $inc: { hitCount: 1 }, $set: { lastUsedAt: new Date() } }
      ).catch(() => {});

      return doc.response;
    }
  } catch (err) {
    console.error("aiBrain: error querying cache:", err);
  }

  return null;
}

/**
 * Stores a successful AI API response into memory and MongoDB so future identical
 * or repeated requests reuse the learned response without spending tokens.
 */
export async function saveBrainResponse(
  promptHash: string,
  category: string,
  response: string
): Promise<void> {
  if (!response || !promptHash) return;

  if (l1Cache.size >= MAX_L1_SIZE) {
    const firstKey = l1Cache.keys().next().value;
    if (firstKey) l1Cache.delete(firstKey);
  }
  l1Cache.set(promptHash, response);

  try {
    await connectDB();
    await AiBrain.findOneAndUpdate(
      { promptHash },
      {
        $set: {
          category,
          response,
          lastUsedAt: new Date(),
        },
        $inc: { hitCount: 1 },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("aiBrain: error saving response:", err);
  }
}
