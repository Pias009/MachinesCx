"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SHAPES = [
  (p: THREE.Vector3, s: number) => <icosahedronGeometry args={[s]} />,
  (p: THREE.Vector3, s: number) => <octahedronGeometry args={[s]} />,
  (p: THREE.Vector3, s: number) => <torusGeometry args={[s, s * 0.3, 12, 18]} />,
  (p: THREE.Vector3, s: number) => <torusKnotGeometry args={[s, s * 0.35, 48, 8]} />,
];

const COLORS = ["#2bbfb3", "#1fa39a", "#5cd4cc", "#ffffff"];

function Shape({
  index,
  pos,
  scale,
  color,
  speed,
}: {
  index: number;
  pos: THREE.Vector3;
  scale: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const seed = useRef(Math.random() * 100);
  const rotSpeed = useRef(0.2 + Math.random() * 0.4);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = seed.current + performance.now() * 0.001 * speed;
    ref.current.position.y = pos.y + Math.sin(t * 0.5) * 0.5;
    ref.current.rotation.x += delta * rotSpeed.current * 0.3;
    ref.current.rotation.y += delta * rotSpeed.current * 0.5;
    ref.current.rotation.z += delta * rotSpeed.current * 0.2;
  });

  const geom = SHAPES[index % SHAPES.length](pos, scale);

  return (
    <mesh ref={ref} position={pos} scale={scale}>
      {geom}
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.15}
        roughness={0.3}
        metalness={0.1}
        wireframe={index % 3 === 2}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += (mouse.current.y * 0.02 - groupRef.current.rotation.x) * delta * 0.5;
    groupRef.current.rotation.y += (mouse.current.x * 0.02 - groupRef.current.rotation.y) * delta * 0.5;
  });

  const shapes = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 3 + Math.random() * 4;
    const pos = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * r,
      Math.sin(phi) * Math.sin(theta) * r * 0.6,
      Math.cos(phi) * r
    );
    shapes.push(
      <Shape
        key={i}
        index={i}
        pos={pos}
        scale={0.3 + Math.random() * 0.5}
        color={COLORS[i % COLORS.length]}
        speed={0.15 + Math.random() * 0.25}
      />
    );
  }

  return <group ref={groupRef}>{shapes}</group>;
}

export default function ThreeBackground() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  if (!mounted || !isLight) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0.5,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[0.5, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
