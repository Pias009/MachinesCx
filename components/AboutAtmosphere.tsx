"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Moody fbm-noise "smoke" canvas + dot-grid texture, used as an atmospheric
 * section background. GSAP ScrollTrigger gates the render loop (only ticks
 * while the section is on screen) and drives the reveal/parallax — cheap
 * to keep mounted on a long page like /about.
 */
export default function AboutAtmosphere() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // low-res noise buffer, upscaled onto the visible canvas — cheap + soft grain
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d");
    if (!bctx) return;
    const BW = 200, BH = 120;
    buf.width = BW; buf.height = BH;

    let cw = 0, ch = 0;
    const resize = () => {
      cw = host.clientWidth; ch = host.clientHeight;
      canvas.width = cw; canvas.height = ch;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const noise = (x: number, y: number) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const fbm = (x: number, y: number) => {
      let val = 0, amp = 0.5, freq = 1;
      for (let i = 0; i < 4; i++) {
        val += amp * noise(x * freq, y * freq);
        freq *= 2.02; amp *= 0.55;
      }
      return val;
    };

    let mouseX = -1000, mouseY = -1000;
    const onMove = (e: MouseEvent) => {
      const r = host.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width;
      mouseY = (e.clientY - r.top) / r.height;
    };
    const onLeave = () => { mouseX = -1000; mouseY = -1000; };
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) {
      host.addEventListener("mousemove", onMove);
      host.addEventListener("mouseleave", onLeave);
    }

    const img = bctx.createImageData(BW, BH);
    const data = img.data;
    let t = 0;

    const render = () => {
      t += reduceMotion ? 0 : 0.0018;

      for (let y = 0; y < BH; y++) {
        const ny = y / BH;
        for (let x = 0; x < BW; x++) {
          const nx = x / BW;

          const qx = fbm(nx * 2.2 + t * 0.6, ny * 2.2 - t * 0.3);
          const qy = fbm(nx * 2.2 + 5.2 - t * 0.4, ny * 2.2 + 1.3 + t * 0.2);

          let wx = nx + qx * 0.35 - t * 0.05;
          let wy = ny + qy * 0.35;

          if (mouseX > -500) {
            const dx = nx - mouseX, dy = (ny - mouseY) * (BH / BW);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const R = 0.22;
            if (dist < R) {
              const push = (1 - dist / R) * 0.09;
              wx += (dx / (dist + 0.0001)) * push;
              wy += (dy / (dist + 0.0001)) * push;
            }
          }

          let n = fbm(wx * 2.6, wy * 2.6);
          n = Math.pow(Math.max(0, n), 1.6);

          const idx = (y * BW + x) * 4;
          // near-black -> brand teal (#2bbfb3), matches the site's --brand-teal
          data[idx] = 8 + n * 35;
          data[idx + 1] = 14 + n * 177;
          data[idx + 2] = 20 + n * 159;
          data[idx + 3] = Math.min(255, n * 200);
        }
      }
      bctx.putImageData(img, 0, 0);

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(buf, 0, 0, cw, ch);
    };

    // drive the loop off GSAP's ticker (shared rAF, auto lag-smoothing) and
    // only run it while the section is actually in view.
    let ticking = false;
    const start = () => { if (!ticking) { gsap.ticker.add(render); ticking = true; } };
    const stop = () => { if (ticking) { gsap.ticker.remove(render); ticking = false; } };

    render(); // paint first frame immediately so there's no blank flash
    if (!reduceMotion) start();

    let st: ReturnType<typeof gsap.to>["scrollTrigger"] | undefined;
    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      gsap.set([canvas, gridRef.current], { opacity: 0 });
      gsap.to([canvas, gridRef.current], {
        opacity: 1,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: { trigger: host, start: "top 90%" },
      });

      st = ScrollTrigger.create({
        trigger: host,
        start: "top bottom",
        end: "bottom top",
        onEnter: start,
        onEnterBack: start,
        onLeave: stop,
        onLeaveBack: stop,
      });

      if (!reduceMotion) {
        gsap.to(canvas, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 0.6 },
        });
      }
    })();

    return () => {
      stop();
      ro.disconnect();
      if (canHover) {
        host.removeEventListener("mousemove", onMove);
        host.removeEventListener("mouseleave", onLeave);
      }
      st?.kill();
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "blur(0.6px)" }} />
      <div
        ref={gridRef}
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
