"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 72;
const BOUNDS = { x: 9, y: 5, z: 4 };
const LINK_DIST = 2.5;

function makeDotTexture() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.95)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function ParticleField() {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  const dotTex = useMemo(() => makeDotTexture(), []);

  const { positions, velocities, linePositions, maxLines } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * BOUNDS.x;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * BOUNDS.y;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * BOUNDS.z;
      velocities[i * 3] = (Math.random() * 2 - 1) * 0.12;
      velocities[i * 3 + 1] = (Math.random() * 2 - 1) * 0.12;
      velocities[i * 3 + 2] = (Math.random() * 2 - 1) * 0.12;
    }
    const maxLines = (COUNT * (COUNT - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 2 * 3);
    return { positions, velocities, linePositions, maxLines };
  }, []);

  const pointsGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const linesGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [linePositions]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // drift + wrap inside the bounds
    for (let i = 0; i < COUNT; i++) {
      for (let a = 0; a < 3; a++) {
        const idx = i * 3 + a;
        positions[idx] += velocities[idx] * dt;
        const b = a === 0 ? BOUNDS.x : a === 1 ? BOUNDS.y : BOUNDS.z;
        if (positions[idx] > b) positions[idx] = -b;
        else if (positions[idx] < -b) positions[idx] = b;
      }
    }
    pointsGeom.attributes.position.needsUpdate = true;

    // reconnect nearby particles
    let n = 0;
    const ld = LINK_DIST * LINK_DIST;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < ld && n < maxLines) {
          const o = n * 6;
          linePositions[o] = positions[i * 3];
          linePositions[o + 1] = positions[i * 3 + 1];
          linePositions[o + 2] = positions[i * 3 + 2];
          linePositions[o + 3] = positions[j * 3];
          linePositions[o + 4] = positions[j * 3 + 1];
          linePositions[o + 5] = positions[j * 3 + 2];
          n++;
        }
      }
    }
    linesGeom.setDrawRange(0, n * 2);
    linesGeom.attributes.position.needsUpdate = true;

    // slow auto-rotation + subtle pointer tilt
    spin.current += dt * 0.05;
    if (group.current) {
      group.current.rotation.y = spin.current + state.pointer.x * 0.18;
      group.current.rotation.x = -state.pointer.y * 0.12;
    }
  });

  return (
    <group ref={group}>
      <points geometry={pointsGeom}>
        <pointsMaterial
          map={dotTex}
          size={0.32}
          sizeAttenuation
          color={"#2b3433"}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={linesGeom}>
        <lineBasicMaterial color={"#2b3433"} transparent opacity={0.15} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export default function WaveBackground() {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#ffffff"]} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
