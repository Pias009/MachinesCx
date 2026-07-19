"use client";

import { useRef, useEffect } from "react";

export default function ScrollVideo({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = useRef(false);
  const target = useRef(0);
  const smooth = useRef(0);
  const seeking = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const section = canvas.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    const draw = () => {
      if (!ctx || video.readyState < 2) return;
      const section = canvas.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sw = rect.width;
      const sh = rect.height;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(sw / vw, sh / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (sw - dw) / 2;
      const dy = (sh - dh) / 2;
      ctx.clearRect(0, 0, sw, sh);
      ctx.drawImage(video, dx, dy, dw, dh);
    };

    const onScroll = () => {
      const section = canvas.closest("section");
      if (!section || !video.duration) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      target.current = raw * video.duration;
    };

    const tick = () => {
      if (!ready.current) { raf.current = requestAnimationFrame(tick); return; }
      smooth.current += (target.current - smooth.current) * 0.15;
      if (!seeking.current && Math.abs(video.currentTime - smooth.current) > 0.01) {
        seeking.current = true;
        video.currentTime = Math.max(0, Math.min(smooth.current, video.duration));
      }
      raf.current = requestAnimationFrame(tick);
    };

    const onSeeked = () => { seeking.current = false; draw(); };

    video.addEventListener("loadeddata", () => { ready.current = true; resize(); });
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    onScroll();
    raf.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <video ref={videoRef} src={src} muted preload="auto" playsInline style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </>
  );
}
