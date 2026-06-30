"use client";
import { useEffect, useRef } from "react";

// WebGL fragment shader — infinite industrial grid tunnel
// Matches brand: dark teal, engineering grid, precision vibe
const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_scroll;

#define PI 3.14159265

// Smooth step utility
float ss(float e0, float e1, float x){ x=clamp((x-e0)/(e1-e0),0.0,1.0); return x*x*(3.0-2.0*x); }

// Teal brand color
vec3 teal = vec3(0.169, 0.749, 0.702);  // #2bbfb3

// Grid line function
float grid(vec2 uv, float scale, float thickness){
  vec2 g = abs(fract(uv * scale) - 0.5);
  float line = min(g.x, g.y);
  return 1.0 - smoothstep(0.0, thickness, line);
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = (fc - u_res * 0.5) / min(u_res.x, u_res.y);

  float t = u_time * 0.18 + u_scroll * 0.4;

  // ── Perspective tunnel ──────────────────────────────────────────
  // Project onto a receding grid floor
  float depth  = 1.0 / (abs(uv.y + 0.15) + 0.04);
  float xFloor = uv.x * depth;
  float zFloor = t * 1.2 + depth;

  // Primary grid
  float g1 = grid(vec2(xFloor, zFloor), 1.0, 0.04 * depth * 0.12);

  // Secondary finer grid
  float g2 = grid(vec2(xFloor, zFloor), 4.0, 0.018 * depth * 0.12);

  // Perspective falloff
  float fade = ss(0.0, 0.5, 1.0 / depth * 0.06);

  float gridVal = (g1 * 0.9 + g2 * 0.35) * fade;

  // ── Vertical scan lines ─────────────────────────────────────────
  float scan = abs(fract(uv.x * 18.0) - 0.5);
  scan = 1.0 - smoothstep(0.0, 0.06, scan);
  scan *= 0.06 * ss(0.0, 0.3, 1.0 - abs(uv.y));

  // ── Horizontal moving accent lines ─────────────────────────────
  float hl = 0.0;
  for(float i = 0.0; i < 3.0; i++){
    float speed = 0.3 + i * 0.18;
    float pos   = fract(t * speed + i * 0.33);
    float yLine = mix(-0.6, 0.6, pos);
    float dist  = abs(uv.y - yLine);
    hl += (1.0 - smoothstep(0.0, 0.012, dist)) * (0.5 + i * 0.15) * 0.4;
  }

  // ── Center energy core ──────────────────────────────────────────
  float r = length(uv + vec2(0.0, 0.06));
  float pulse = 0.5 + 0.5 * sin(t * 2.2);
  float core = (0.018 * (0.7 + pulse * 0.3)) / (r * r + 0.001);
  core = clamp(core, 0.0, 1.0);

  // ── Corner accent dots ──────────────────────────────────────────
  vec2 corners[4];
  corners[0] = vec2(-0.7, -0.38);
  corners[1] = vec2( 0.7, -0.38);
  corners[2] = vec2(-0.7,  0.38);
  corners[3] = vec2( 0.7,  0.38);
  float dots = 0.0;
  for(int j = 0; j < 4; j++){
    float d = length(uv - corners[j]);
    float blink = 0.5 + 0.5 * sin(t * 1.8 + float(j) * 1.3);
    dots += (1.0 - smoothstep(0.0, 0.018, d)) * blink * 0.7;
  }

  // ── Compose ────────────────────────────────────────────────────
  vec3 col = vec3(0.031, 0.086, 0.078);  // base dark teal bg #080E0D

  // Grid layer
  col += teal * gridVal * 0.55;

  // Scan lines
  col += teal * scan;

  // Horizontal moving lines
  col += teal * hl;

  // Core glow
  col += teal * core * 0.9;

  // Corner dots
  col += teal * dots;

  // Radial vignette
  float vig = 1.0 - smoothstep(0.3, 1.2, length(uv * vec2(1.0, 1.6)));
  col *= vig * 0.85 + 0.15;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function IndustrialBg({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width  = Math.round(canvas.offsetWidth  * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const locP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(locP);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

    const uRes    = gl.getUniformLocation(prog, "u_res");
    const uTime   = gl.getUniformLocation(prog, "u_time");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");

    const frame = (now: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 0.001);
      gl.uniform1f(uScroll, scrollRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        display: "block", pointerEvents: "none",
      }}
    />
  );
}
