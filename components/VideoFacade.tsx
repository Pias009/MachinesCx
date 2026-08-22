"use client";

import { useState } from "react";
import Image from "next/image";
import type { MachineVideo } from "@/lib/machinesData";

export default function VideoFacade({ video }: { video: MachineVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Fallback thumbnail if thumbnailUrl is missing or external placeholder
  const thumbUrl =
    video.thumbnailUrl && !video.thumbnailUrl.includes("placeholder")
      ? video.thumbnailUrl
      : `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--brand-teal)]/30 bg-[var(--bg-surface)] p-6 sm:p-8" data-reveal>
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--brand-teal)]">
          <span>🎬 Live Factory Demonstration</span>
          <span>•</span>
          <span>Quality FAT Inspection</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "var(--ff-display)" }}>
          {video.title}
        </h3>
        <p className="text-[0.92rem] text-[var(--ink-60)] leading-relaxed">
          {video.description}
        </p>
      </div>

      {/* Player Container / Façade */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--bg-line)] bg-black shadow-2xl">
        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative h-full w-full flex items-center justify-center text-left focus:outline-none"
            aria-label={`Play video: ${video.title}`}
          >
            {/* Thumbnail Image */}
            <Image
              src={thumbUrl}
              alt={video.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            {/* Big Centered Play Button */}
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--brand-teal)]/60 bg-[var(--brand-teal)]/20 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--brand-teal)] group-hover:text-black">
              <svg className="w-8 h-8 fill-current text-[var(--brand-teal)] group-hover:text-black translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="rounded-md border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-white">
                HD Factory Floor Test
              </span>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end text-white">
              <div className="space-y-1">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--brand-teal)]">
                  Wenzhou Ashal Innomach OEM Facility
                </span>
              </div>
              {video.duration && (
                <span className="rounded-md border border-white/20 bg-black/70 px-2.5 py-1 font-mono text-xs text-white">
                  {video.duration.replace("PT", "").replace("M", "m ").replace("S", "s")}
                </span>
              )}
            </div>
          </button>
        ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full rounded-2xl border-0"
          />
        )}
      </div>
    </div>
  );
}
