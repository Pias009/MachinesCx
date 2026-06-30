"use client";
import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => null,
});

export default function HeroCanvas({ onScroll }: { onScroll?: (v: number) => void }) {
  return <Hero3D onScroll={onScroll} />;
}
