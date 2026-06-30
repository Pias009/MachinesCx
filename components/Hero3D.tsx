"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// shared scroll value
let scrollProgress = 0;

// ─── molten ember field ───────────────────────────────────────────────────
function Embers({ count = 340 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const hot = new THREE.Color("#e11d48");
    const warm = new THREE.Color("#C8A96E");
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9 - 2;
      spd[i] = 0.2 + Math.random() * 0.8;
      const c = Math.random() > 0.5 ? hot : warm;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return { positions: pos, speeds: spd, colors: col };
  }, [count]);

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 0.4; // drift up
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0015; // shimmer
      if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.02 + scrollProgress * 0.4;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + scrollProgress * 0.25;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Hero3D({ onScroll }: { onScroll?: (v: number) => void }) {
  useEffect(() => {
    const driver = document.getElementById("scroll-root");
    if (!driver) return;
    const handler = () => {
      const rect = driver.getBoundingClientRect();
      const total = driver.offsetHeight - window.innerHeight;
      const clamped = Math.max(0, Math.min(1, -rect.top / total));
      scrollProgress = clamped;
      onScroll?.(clamped);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [onScroll]);

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 46 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <Embers />
    </Canvas>
  );
}
