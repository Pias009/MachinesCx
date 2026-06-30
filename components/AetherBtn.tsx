"use client";
import { useEffect, useRef, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2  u_res;
uniform float u_time,u_heat,u_flash;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02+vec2(17.3,9.1);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 p=uv*vec2(u_res.x/u_res.y,1.)*2.1;
  float t=u_time,heat=u_heat+u_flash*1.3;
  vec2 q=vec2(fbm(p+vec2(0,t*.32)),fbm(p+vec2(5.2,t*.27)));
  vec2 r=vec2(fbm(p+1.7*q+vec2(1.7,9.2)+t*.12),fbm(p+1.6*q+vec2(8.3,2.8)+t*.09));
  float v=fbm(p+2.1*r);
  float m=v*1.4+heat*.22;
  vec3 c1=vec3(.004,.008,.035),c2=vec3(.04,.08,.35),c3=vec3(0.,.6,1.),c4=vec3(.7,.9,1.);
  vec3 col=mix(c1,c2,smoothstep(.2,.52,m));
  col=mix(col,c3,smoothstep(.52,.8,m));
  col=mix(col,c4,smoothstep(.82,1.02,m));
  float vein=exp(-abs(q.x-q.y)*9.);
  col+=c3*vein*(.12+heat*.25);
  vec2 e=uv*(1.-uv);
  col*=mix(.5,1.,pow(e.x*e.y*16.,.28));
  col*=.78+heat*.5;
  col+=vec3(.82,.94,1.)*u_flash*.4*(.3+v);
  gl_FragColor=vec4(col,1.);
}`;

export default function AetherBtn({ children, style }: Props) {
  const wrapRef   = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({ heat: 0, heatTarget: 0, erupt: 0, churn: 0, last: 0 });
  const rafRef    = useRef<number>(0);
  const reduced   = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  const onEnter = useCallback(() => { stateRef.current.heatTarget = 1; }, []);
  const onLeave = useCallback(() => { stateRef.current.heatTarget = 0; }, []);
  const onDown  = useCallback(() => { stateRef.current.erupt = 1;      }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl");
    if (!gl) { canvas.style.display = "none"; return; }

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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const locP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(locP);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uHeat  = gl.getUniformLocation(prog, "u_heat");
    const uFlash = gl.getUniformLocation(prog, "u_flash");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w   = Math.max(1, Math.round(wrap!.clientWidth  * dpr));
      const h   = Math.max(1, Math.round(wrap!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w; canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }

    stateRef.current.last = performance.now();

    function frame(now: number) {
      const s  = stateRef.current;
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last   = now;
      s.heat  += (s.heatTarget - s.heat) * Math.min(1, dt * 6);
      s.erupt *= Math.exp(-3.2 * dt);
      s.churn += dt * (0.35 + s.heat * 1.1 + s.erupt * 2.2);
      resize();
      gl!.uniform2f(uRes,   canvas!.width, canvas!.height);
      gl!.uniform1f(uTime,  reduced ? 6.0 : s.churn);
      gl!.uniform1f(uHeat,  s.heat);
      gl!.uniform1f(uFlash, s.erupt);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced]);

  return (
    <span
      ref={wrapRef}
      className="aether-btn"
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="aether-btn__canvas" />
      {children}
    </span>
  );
}
