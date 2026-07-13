"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

const VS = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Teal palette — matches logo color #2BBFB3
const FS = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y -= 0.5;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 col = vec3(0.0);

  for (float i = 1.0; i <= 6.0; i++) {
    float t = u_time * 0.3 + i * 0.15;
    float y = sin(uv.x * (1.5 + i * 0.2) + t) * 0.15 * cos(t * 0.5);
    y += cos(uv.x * (1.0 + i * 0.3) - t * 0.8) * 0.1;
    float glow = (0.0012 * i) / abs(uv.y - y);
    // Teal palette: #2BBFB3 = vec3(0.17, 0.75, 0.70)
    vec3 c = vec3(0.04 + i * 0.01, 0.38 + i * 0.06, 0.36 + i * 0.05);
    col += c * glow;
  }

  gl_FragColor = vec4(col, 1.0);
}`;

export default function HeroSplash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth  * Math.min(window.devicePixelRatio, 2);
      canvas.height = canvas.offsetHeight * Math.min(window.devicePixelRatio, 2);
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function shader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER,   VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_resolution");

    function frame(t: number) {
      gl!.uniform1f(uTime, t * 0.001);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .hs {
          position: relative;
          background: var(--bg-base);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Colorful decorative circles */
        .hs__shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .hs__shape--1 {
          width: min(50vw, 600px);
          height: min(50vw, 600px);
          top: -10%;
          right: -5%;
          background: radial-gradient(circle, rgba(43,191,179,0.15) 0%, transparent 70%);
          animation: hs-float 8s ease-in-out infinite;
        }
        .hs__shape--2 {
          width: min(30vw, 400px);
          height: min(30vw, 400px);
          bottom: 5%;
          left: -8%;
          background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
          animation: hs-float 11s ease-in-out infinite reverse;
        }
        .hs__shape--3 {
          width: min(20vw, 260px);
          height: min(20vw, 260px);
          top: 40%;
          left: 45%;
          background: radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%);
          animation: hs-float 14s ease-in-out infinite 2s;
        }
        @keyframes hs-float {
          0%,100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(10px, -20px) scale(1.03); }
          66%      { transform: translate(-8px, 15px) scale(0.97); }
        }

        /* WebGL canvas — pointer-events none so scroll passes through */
        .hs__canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: .45;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        /* dark bottom fade */
        .hs__fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 220px;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent, var(--bg-base));
        }

        /* ── Light mode overrides ── */
        [data-theme="light"] .hs__canvas {
          mix-blend-mode: darken;
          opacity: 0.45;
        }
        [data-theme="light"] .hs__h1  { color: var(--slate) !important; }
        [data-theme="light"] .hs__h1 em { color: var(--brand-teal) !important; }
        [data-theme="light"] .hs__desc { color: var(--slate-60) !important; }
        [data-theme="light"] .hs__btn-secondary {
          color: var(--slate-60) !important;
          border-color: rgba(13,34,32,0.2) !important;
        }
        [data-theme="light"] .hs__btn-secondary:hover {
          border-color: var(--brand-teal) !important;
          color: var(--brand-teal) !important;
        }

        /* Red top accent line — same as SiteNav */
        .hs::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--brand-red);
          z-index: 10;
        }

        /* hero content */
        .hs__main {
          position: relative;
          z-index: 5;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 1.5rem 8rem;
        }

        .hs__h1 {
          font-family: var(--ff-display);
          font-size: clamp(3.5rem, 8vw, 6rem);
          line-height: .88;
          letter-spacing: .01em;
          color: var(--ink);
          margin: 0 0 1.75rem;
          text-wrap: balance;
        }
        .hs__h1 em {
          font-style: normal;
          color: var(--brand-teal);
          display: block;
        }

        .hs__desc {
          font-family: var(--ff-body);
          font-size: clamp(.95rem, 1.1vw, 1rem);
          color: var(--ink-60);
          line-height: 1.7;
          max-width: 38ch;
          margin: 0 0 2.5rem;
          letter-spacing: .01em;
        }

        .hs__actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Primary — filled red, square (matches .btn--hot) */
        .hs__btn-primary {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: .85rem 1.75rem;
          background: var(--brand-red);
          color: #fff;
          font-family: var(--ff-mono);
          font-size: .78rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid var(--brand-red);
          transition: background .18s, box-shadow .18s;
          white-space: nowrap;
        }
        .hs__btn-primary:hover {
          background: #1fa39a;
          box-shadow: 0 4px 20px rgba(43,191,179,0.45);
        }

        /* Secondary — ghost, square (matches .btn--ghost) */
        .hs__btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: .85rem 1.75rem;
          background: transparent;
          color: var(--ink-60);
          border: 1px solid var(--ink-15);
          font-family: var(--ff-mono);
          font-size: .78rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: border-color .18s, color .18s;
          white-space: nowrap;
        }
        .hs__btn-secondary:hover {
          border-color: var(--brand-red);
          color: var(--brand-red);
        }

        @media(prefers-reduced-motion:reduce){
          .hs__canvas { display: none; }
        }

        @media(max-width:640px){
          .hs { min-height: 70vh; }
          .hs__main { padding: 2.5rem 1.25rem 3rem; }
          .hs__h1 { font-size: clamp(2rem, 9vw, 3rem); margin-bottom: 1rem; }
          .hs__desc { font-size: 0.88rem; max-width: 100%; margin-bottom: 1.5rem; }
          .hs__fade { height: 120px; }
        }
        @media(max-width:480px){
          .hs { min-height: 60vh; }
          .hs__main { padding: 2rem 1rem 2.5rem; }
          .hs__actions { flex-direction: column; width: 100%; }
          .hs__btn-primary, .hs__btn-secondary { width: 100%; justify-content: center; padding: .75rem 1rem; }
          .hs__h1 { font-size: clamp(1.8rem, 9vw, 2.4rem); }
        }
      `}</style>

      <section className="hs" aria-label="Wenzhou Asal Innomach — Hero">

        {/* Decorative floating shapes */}
        <div className="hs__shape hs__shape--1" aria-hidden="true" />
        <div className="hs__shape hs__shape--2" aria-hidden="true" />
        <div className="hs__shape hs__shape--3" aria-hidden="true" />

        {/* WebGL wisp background */}
        <canvas ref={canvasRef} className="hs__canvas" aria-hidden="true" />

        {/* bottom fade */}
        <div className="hs__fade" aria-hidden="true" />

        {/* Hero copy — nav is handled by SiteNav (fixed, always on top) */}
        <main className="hs__main">
          <h1 className="hs__h1">
            Built for the floor.
            <em>Proven worldwide.</em>
          </h1>

          <p className="hs__desc">
            Industrial plastic-processing lines — built in Wenzhou,
            running in 80+ countries.
          </p>

          <div className="hs__actions">
            <Link href="/products" className="hs__btn-primary">
              Explore machines
            </Link>
            <Link href="/contact" className="hs__btn-secondary">
              Request a quote
            </Link>
          </div>
        </main>

      </section>
    </>
  );
}
