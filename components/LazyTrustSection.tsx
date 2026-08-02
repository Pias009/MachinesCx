"use client";
import LazyMount from "@/components/LazyMount";

// Thin client wrapper so the `() => import(...)` loader never has to cross
// the server/client boundary as a prop from the (server) homepage —
// React Server Components can't serialize functions passed that way. See
// LazyMount.tsx for why this needs a raw import() instead of next/dynamic.
export default function LazyTrustSection() {
  return <LazyMount loader={() => import("@/components/TrustSection")} />;
}
