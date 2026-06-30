"use client";

import { useEffect, useRef } from "react";

export default function SectionAnimator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── WebGL drifting particle field ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const vsSrc = `
      attribute vec2  a_pos;
      attribute float a_size;
      attribute float a_speed;
      attribute float a_alpha;
      uniform float u_time;
      varying float v_alpha;
      void main() {
        float y = mod(a_pos.y - u_time * a_speed * 0.06, 1.0);
        vec2 p  = vec2(a_pos.x, y) * 2.0 - 1.0;
        p.y = -p.y;
        gl_Position  = vec4(p, 0.0, 1.0);
        gl_PointSize = a_size;
        v_alpha = a_alpha;
      }
    `;
    const fsSrc = `
      precision mediump float;
      varying float v_alpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float c = 1.0 - smoothstep(0.5, 1.0, d);
        gl_FragColor = vec4(1.0, 1.0, 1.0, c * v_alpha);
      }
    `;

    const mkShader = (t: number, src: string) => {
      const s = gl.createShader(t)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   vsSrc));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog); gl.useProgram(prog);

    const COUNT = 140;
    const pos   = new Float32Array(COUNT * 2);
    const sizes = new Float32Array(COUNT);
    const spds  = new Float32Array(COUNT);
    const alpha = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i*2]   = Math.random();
      pos[i*2+1] = Math.random();
      sizes[i]   = 1 + Math.random() * 2;
      spds[i]    = 0.3 + Math.random() * 0.7;
      alpha[i]   = 0.012 + Math.random() * 0.035;
    }

    const mkBuf = (d: Float32Array) => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
      return b;
    };
    const bPos = mkBuf(pos); const bSz = mkBuf(sizes);
    const bSp  = mkBuf(spds); const bAl = mkBuf(alpha);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aSz  = gl.getAttribLocation(prog, "a_size");
    const aSp  = gl.getAttribLocation(prog, "a_speed");
    const aAl  = gl.getAttribLocation(prog, "a_alpha");
    const uT   = gl.getUniformLocation(prog, "u_time");

    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let raf: number;
    const tick = (t: number) => {
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, t * 0.001);
      ([[ bPos, aPos, 2], [bSz, aSz, 1], [bSp, aSp, 1], [bAl, aAl, 1]] as [WebGLBuffer, number, number][])
        .forEach(([b, a, n]) => {
          gl.bindBuffer(gl.ARRAY_BUFFER, b);
          gl.enableVertexAttribArray(a);
          gl.vertexAttribPointer(a, n, gl.FLOAT, false, 0, 0);
        });
      gl.drawArrays(gl.POINTS, 0, COUNT);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // ── GSAP scroll animations — client-only, after full hydration ──────
  useEffect(() => {
    let ctx: { revert?: () => void } = {};

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Wait for hydration + loading screen — prevents data-sa/style
      // being set before React reconciliation finishes (hydration mismatch)
      await new Promise(r => setTimeout(r, 800));

      ctx = gsap.context(() => {

        // Guards
        const skip = (el: Element) =>
          !!el.closest("[data-loading-screen],[data-no-anim],.ps-ghost-wrap,.sn,.qv-modal") ||
          el.classList.contains("sa-done");

        const mark = (el: Element) => {
          // Use a class instead of data-sa to avoid hydration attribute mismatch
          if (el.classList.contains("sa-done")) return false;
          el.classList.add("sa-done");
          return true;
        };

        const st = (el: Element, start = "top 86%") => ({
          trigger: el,
          start,
          toggleActions: "play none none none",
        });

        // ── 1. Headings — translate Y + fade (NO innerHTML rewrite) ──
        document.querySelectorAll<HTMLElement>("h1,h2,h3").forEach(el => {
          if (skip(el) || !mark(el)) return;
          if (el.closest(".ps-ghost-wrap,.sn__logo,.cat-hero__media")) return;
          gsap.set(el, { opacity: 0, y: 48 });
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.85, ease: "power3.out",
            scrollTrigger: st(el),
          });
        });

        // ── 2. Eyebrow / labels — slide from left ─────────────────────
        document.querySelectorAll<HTMLElement>(".eyebrow,[class*='eyebrow']").forEach(el => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, x: -28 });
          gsap.to(el, {
            opacity: 1, x: 0,
            duration: 0.6, ease: "power3.out",
            scrollTrigger: st(el),
          });
        });

        // ── 3. Cards — stagger from bottom ────────────────────────────
        document.querySelectorAll<HTMLElement>(".pb-card-outer").forEach((el, i) => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, y: 50 });
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.7, ease: "power3.out",
            delay: (i % 4) * 0.09,
            scrollTrigger: st(el, "top 92%"),
          });
        });

        // ── 4. FlexoStrip cards — slide from bottom with clip ─────────
        document.querySelectorAll<HTMLElement>(".fs-card").forEach((el, i) => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, y: 60 });
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.75, ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: st(el, "top 90%"),
          });
        });

        // ── 5. Family blocks — alternating left/right ─────────────────
        document.querySelectorAll<HTMLElement>(".family-block").forEach((el, i) => {
          if (skip(el) || !mark(el)) return;
          const fromLeft = i % 2 === 0;
          gsap.set(el, { opacity: 0, x: fromLeft ? -60 : 60 });
          gsap.to(el, {
            opacity: 1, x: 0,
            duration: 0.85, ease: "power3.out",
            scrollTrigger: st(el, "top 85%"),
          });
        });

        // ── 6. Images — scale + fade ───────────────────────────────────
        document.querySelectorAll<HTMLElement>(
          ".family-block__media img, .machine-stage img"
        ).forEach(el => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, scale: 1.05 });
          gsap.to(el, {
            opacity: 1, scale: 1,
            duration: 1.0, ease: "power2.out",
            scrollTrigger: st(el, "top 88%"),
          });
        });

        // ── 7. Paragraphs — rise + fade ───────────────────────────────
        document.querySelectorAll<HTMLElement>(
          "p:not(.pb-card__name):not(.pb-card__cat):not(.pb-card__series)"
        ).forEach(el => {
          if (skip(el) || !mark(el)) return;
          if (el.closest(".sn,.qv-modal,.ps-ghost-wrap,.footer-bar,.ls-pending")) return;
          gsap.set(el, { opacity: 0, y: 20 });
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.65, ease: "power2.out",
            scrollTrigger: st(el, "top 92%"),
          });
        });

        // ── 8. Spec rows — slide from left with stagger ───────────────
        document.querySelectorAll<HTMLElement>("tr,.qv-spec-row").forEach((el, i) => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, x: -18 });
          gsap.to(el, {
            opacity: 1, x: 0,
            duration: 0.45, ease: "power2.out",
            delay: (i % 8) * 0.04,
            scrollTrigger: st(el, "top 95%"),
          });
        });

        // ── 9. Buttons ────────────────────────────────────────────────
        document.querySelectorAll<HTMLElement>(".btn:not(.sn__cta),.fp-tier-btn").forEach(el => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, y: 16, scale: 0.95 });
          gsap.to(el, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.55, ease: "back.out(1.4)",
            scrollTrigger: st(el, "top 93%"),
          });
        });

        // ── 10. Trust section elements ────────────────────────────────
        document.querySelectorAll<HTMLElement>(".ts-step,.ts-label,.ts-summary,.ts-line").forEach((el, i) => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, y: 28 });
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: 0.65, ease: "power3.out",
            delay: i * 0.07,
            scrollTrigger: st(el),
          });
        });

        // ── 11. News items — alternating slide ────────────────────────
        document.querySelectorAll<HTMLElement>("[class*='news-item'],[class*='news__item']").forEach((el, i) => {
          if (skip(el) || !mark(el)) return;
          gsap.set(el, { opacity: 0, x: i % 2 === 0 ? -40 : 40 });
          gsap.to(el, {
            opacity: 1, x: 0,
            duration: 0.7, ease: "power3.out",
            delay: i * 0.06,
            scrollTrigger: st(el, "top 90%"),
          });
        });

        // ── 12. Footer ────────────────────────────────────────────────
        const footer = document.querySelector<HTMLElement>("footer");
        if (footer && mark(footer)) {
          gsap.set(footer, { opacity: 0, y: 32 });
          gsap.to(footer, {
            opacity: 1, y: 0,
            duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: footer, start: "top 97%", toggleActions: "play none none none" },
          });
        }

        ScrollTrigger.refresh();
      });
    })();

    return () => { ctx.revert?.(); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 0, opacity: 0.45,
      }} />
    </>
  );
}
