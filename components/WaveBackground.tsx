"use client";
import { useEffect, useRef } from "react";

// Light-theme hero background — a drifting particle network (dots + nearby
// connecting lines) with a subtle pointer-driven parallax tilt. Same visual
// behavior as the previous three.js/@react-three/fiber version, but on
// plain Canvas 2D — no WebGL scene graph needed for 2D dots and lines, and
// it drops ~650KB of three.js from every light-theme (default-theme) first
// visit. See WispBackground.tsx for the dark-theme sibling, same rationale.

const COUNT = 72;
const LINK_DIST = 130; // px, at 1x scale — matches the old 3D LINK_DIST proportionally
const DOT_COLOR = "43,52,51";   // #2b3433
const SPIN_SPEED = 0.05;        // radians/sec, matches old auto-rotation rate

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
}

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pointerRef = useRef({ x: 0, y: 0 }); // -1..1, tracks cursor for parallax tilt

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0, height = 0, dpr = 1;
    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() * 2 - 1) * 0.02,
      vy: (Math.random() * 2 - 1) * 0.02,
    }));

    function onPointerMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let spin = 0;
    let last = performance.now();

    function frame(t: number) {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      ctx!.clearRect(0, 0, width, height);

      // drift + wrap, in normalized [0,1] space
      for (const p of particles) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x > 1) p.x = 0; else if (p.x < 0) p.x = 1;
        if (p.y > 1) p.y = 0; else if (p.y < 0) p.y = 1;
      }

      spin += dt * SPIN_SPEED;
      const tiltX = pointerRef.current.x * 6; // px, subtle parallax matching the old rotation feel
      const tiltY = pointerRef.current.y * 4;
      const drift = Math.sin(spin) * 4;

      // connecting lines — only draw pairs within LINK_DIST, same O(n²)
      // proximity check the three.js version used
      ctx!.strokeStyle = `rgba(${DOT_COLOR},0.15)`;
      ctx!.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ax = a.x * width + tiltX + drift, ay = a.y * height + tiltY;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const bx = b.x * width + tiltX + drift, by = b.y * height + tiltY;
          const dx = ax - bx, dy = ay - by;
          if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
            ctx!.beginPath();
            ctx!.moveTo(ax, ay);
            ctx!.lineTo(bx, by);
            ctx!.stroke();
          }
        }
      }

      // dots — soft radial glow per point, matching the old texture-mapped points
      for (const p of particles) {
        const x = p.x * width + tiltX + drift, y = p.y * height + tiltY;
        const g = ctx!.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, `rgba(${DOT_COLOR},0.85)`);
        g.addColorStop(1, `rgba(${DOT_COLOR},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, 5, 0, Math.PI * 2);
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    if (reduced) {
      // one static frame — no continuous rAF loop under reduced-motion
      frame(performance.now());
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", background: "#ffffff" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
