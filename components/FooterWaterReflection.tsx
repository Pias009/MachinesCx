"use client";
import { useEffect, useRef } from "react";

/* Water-caustics shader for the footer's liquid-glass backdrop — the
   characteristic overlapping, drifting light bands you see refracted
   through moving water. Same WebGL setup as WispBackground.tsx (which
   this borrows its resize/compile boilerplate from), but a caustics
   field instead of a wisp glow, and — unlike that component — actually
   honors prefers-reduced-motion (renders one static frame and stops,
   rather than never checking at all). mix-blend-mode:screen on the
   <canvas> means this reads as a bright shimmer over the dark footer
   and fades to near-invisible over the white light-theme footer,
   without any theme-conditional code needed in the shader itself. */

const VS = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Teal palette — matches brand #2BBFB3. Three overlapping sine fields at
// different frequencies/phases, the classic cheap caustics approximation
// (interference pattern from summed wave fronts), clamped to a soft glow
// rather than the harsh high-contrast look real caustics renders use —
// this needs to read as "ambient light on water," not a swimming-pool floor.
const FS = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

float wave(vec2 uv, float freq, float speed, float angle) {
  vec2 dir = vec2(cos(angle), sin(angle));
  float d = dot(uv, dir);
  return sin(d * freq + u_time * speed);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;

  float c = 0.0;
  c += wave(uv, 8.0,  0.6, 0.3);
  c += wave(uv, 11.0, -0.4, 1.7);
  c += wave(uv, 14.0, 0.5, 2.6);

  // interference peaks → bright caustic lines; everything else falls
  // off fast so the field stays mostly dark/transparent between them
  float caustic = pow(max(c / 3.0, 0.0), 3.0);

  vec3 col = vec3(0.06, 0.55, 0.52) * caustic * 1.4;

  gl_FragColor = vec4(col, caustic * 0.9);
}`;

export default function FooterWaterReflection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function draw(t: number) {
      gl!.uniform1f(uTime, t * 0.001);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function frame(t: number) {
      draw(t);
      rafRef.current = requestAnimationFrame(frame);
    }

    if (reduced) {
      draw(0); // one still frame — no continuous rAF loop
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: 0.55,
      }}
    />
  );
}
