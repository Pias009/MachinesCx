"use client";

import { useRef, useEffect, useCallback } from "react";

interface AutoPlayVideoProps {
  src: string;
  onComplete?: () => void;
}

// Plays the given video once, start to finish, drawn to a canvas so it can
// be object-fit: cover-cropped regardless of the video's native aspect
// ratio. Holds on the last frame once it ends — no scroll-driven scrubbing.
export default function AutoPlayVideo({ src, onComplete }: AutoPlayVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const raf = useRef(0);

  const draw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState < 2) return;
    const section = canvas.closest("section");
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sw = rect.width;
    const sh = rect.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw === 0 || vh === 0 || sw === 0 || sh === 0) return;
    // cover-fit: scale so the video fully covers the section, cropping
    // whichever axis overflows, then center it
    const scale = Math.max(sw / vw, sh / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (sw - dw) / 2;
    const dy = (sh - dh) / 2;
    ctx.clearRect(0, 0, sw, sh);
    ctx.drawImage(video, dx, dy, dw, dh);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const resize = () => {
      const section = canvas.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    let playing = true;
    const tick = () => {
      if (playing && !video.paused && !video.ended) draw();
      raf.current = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      playing = false;
      draw(); // hold on the final frame
      onComplete?.();
    };

    video.addEventListener("loadeddata", resize);
    video.addEventListener("ended", onEnded);
    window.addEventListener("resize", resize);

    resize();
    video.play().catch(() => {});
    raf.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("loadeddata", resize);
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
    };
  }, [onComplete, draw]);

  return (
    <>
      <video ref={videoRef} src={src} muted loop={false} preload="auto" playsInline style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </>
  );
}
