"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Builds a twisted, ribbed ribbon: a tube swept along a helical curve, then
   corrugated with sinusoidal ridges around its circumference so it catches
   light as many thin fins rather than one smooth pipe — the fluted look
   in the reference image. */
function buildRibbonGeometry({
  radius,
  length,
  turns,
  tubeRadius,
  ridges,
  ridgeDepth,
  seed,
}: {
  radius: number;
  length: number;
  turns: number;
  tubeRadius: number;
  ridges: number;
  ridgeDepth: number;
  seed: number;
}) {
  const pathSegments = 220;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= pathSegments; i++) {
    const t = i / pathSegments;
    const angle = t * Math.PI * 2 * turns + seed;
    const wobble = Math.sin(t * Math.PI * 3 + seed) * radius * 0.18;
    pts.push(
      new THREE.Vector3(
        Math.cos(angle) * (radius + wobble),
        (t - 0.5) * length,
        Math.sin(angle) * (radius + wobble)
      )
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);

  const tubularSegments = 260;
  const radialSegments = 48;
  const geom = new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, false);

  // corrugate: push vertices in/out around the tube circumference to form ribs
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const normal = geom.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const u = i % (radialSegments + 1); // position around circumference
    const ridgeAngle = (u / radialSegments) * Math.PI * 2;
    const disp = Math.sin(ridgeAngle * ridges) * ridgeDepth;
    pos.setX(i, pos.getX(i) + normal.getX(i) * disp);
    pos.setY(i, pos.getY(i) + normal.getY(i) * disp);
    pos.setZ(i, pos.getZ(i) + normal.getZ(i) * disp);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

function Ribbon({
  color,
  roughness,
  metalness,
  opts,
  rotationSpeed,
  tiltBase,
}: {
  color: string;
  roughness: number;
  metalness: number;
  opts: Parameters<typeof buildRibbonGeometry>[0];
  rotationSpeed: number;
  tiltBase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => buildRibbonGeometry(opts), [opts]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * rotationSpeed;
    ref.current.rotation.x =
      tiltBase + state.pointer.y * 0.15;
    ref.current.rotation.z =
      state.pointer.x * 0.08;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene({ isLight }: { isLight: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = 0.5 + state.pointer.x * 0.12;
  });

  const ribbons = useMemo(
    () => [
      { radius: 1.05, length: 3.6, turns: 1.5, tubeRadius: 0.46, ridges: 22, ridgeDepth: 0.065, seed: 0 },
      { radius: 0.78, length: 3.1, turns: 1.9, tubeRadius: 0.34, ridges: 18, ridgeDepth: 0.05, seed: 2.1 },
      { radius: 0.55, length: 2.6, turns: 2.3, tubeRadius: 0.22, ridges: 16, ridgeDepth: 0.04, seed: 4.4 },
    ],
    []
  );

  const palette = isLight
    ? { colors: ["#c3ccca", "#b3bebc", "#a3b0ad"], roughness: 0.32, metalness: 0.35 }
    : { colors: ["#1c3733", "#224540", "#28524b"], roughness: 0.3, metalness: 0.4 };

  return (
    <group ref={group} position={[2.6, -0.3, 0]} rotation={[0.4, 0.5, 0.15]}>
      {ribbons.map((opts, i) => (
        <Ribbon
          key={i}
          opts={opts}
          color={palette.colors[i]}
          roughness={palette.roughness}
          metalness={palette.metalness}
          rotationSpeed={0.06 + i * 0.02}
          tiltBase={0.4 - i * 0.1}
        />
      ))}
    </group>
  );
}

export default function RibbonBackground({ isLight = false }: { isLight?: boolean }) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isLight ? 0.7 : 0.25} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={isLight ? 2.4 : 1.6}
          color={isLight ? "#ffffff" : "#6fe0d3"}
        />
        <directionalLight
          position={[-4, -2, 3]}
          intensity={isLight ? 0.9 : 1.1}
          color={isLight ? "#c9d6d5" : "#2bbfb3"}
        />
        <directionalLight
          position={[0, -4, -3]}
          intensity={isLight ? 0.3 : 0.6}
          color={isLight ? "#9fb3b1" : "#0d3530"}
        />
        <Scene isLight={isLight} />
      </Canvas>
    </div>
  );
}
