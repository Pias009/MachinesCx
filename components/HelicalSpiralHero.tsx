"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

/* ── Helical ribbon: stacked architectural floor-plate slices ── */
function HelixRibbon() {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, normals, uvs, indices } = useMemo(() => {
    const SLICES   = 120;   // number of plate segments
    const TURNS    = 2.8;   // how many full 360° turns
    const RADIUS   = 1.6;   // helix radius
    const HEIGHT   = 5.5;   // total vertical span
    const THICKNESS = 0.055; // plate thickness (Y)
    const DEPTH    = 0.72;  // radial depth of each plate

    const positions: number[] = [];
    const normals:   number[] = [];
    const uvs:       number[] = [];
    const indices:   number[] = [];

    let vi = 0; // vertex index counter

    for (let i = 0; i < SLICES; i++) {
      const t0 = i       / SLICES;
      const t1 = (i + 1) / SLICES;

      const angle0 = t0 * TURNS * Math.PI * 2;
      const angle1 = t1 * TURNS * Math.PI * 2;

      const y0 = t0 * HEIGHT - HEIGHT / 2;
      const y1 = t1 * HEIGHT - HEIGHT / 2;

      // Four corners of the plate in XZ plane (radial strip)
      const innerR = RADIUS - DEPTH;
      const outerR = RADIUS;

      // We build each slice as a box: 4 faces
      // Top face of plate i
      const corners = [
        // top face (y + THICKNESS/2)
        { x: Math.cos(angle0) * innerR, y: y0 + THICKNESS, z: Math.sin(angle0) * innerR },
        { x: Math.cos(angle0) * outerR, y: y0 + THICKNESS, z: Math.sin(angle0) * outerR },
        { x: Math.cos(angle1) * outerR, y: y1 + THICKNESS, z: Math.sin(angle1) * outerR },
        { x: Math.cos(angle1) * innerR, y: y1 + THICKNESS, z: Math.sin(angle1) * innerR },
        // bottom face (y)
        { x: Math.cos(angle0) * innerR, y: y0, z: Math.sin(angle0) * innerR },
        { x: Math.cos(angle0) * outerR, y: y0, z: Math.sin(angle0) * outerR },
        { x: Math.cos(angle1) * outerR, y: y1, z: Math.sin(angle1) * outerR },
        { x: Math.cos(angle1) * innerR, y: y1, z: Math.sin(angle1) * innerR },
      ];

      // push vertices
      const base = vi;
      for (const c of corners) {
        positions.push(c.x, c.y, c.z);
        normals.push(0, 1, 0); // approximate — recomputed
        uvs.push(0, 0);
      }
      vi += 8;

      // top face
      indices.push(base+0, base+1, base+2,  base+0, base+2, base+3);
      // bottom face
      indices.push(base+4, base+6, base+5,  base+4, base+7, base+6);
      // outer edge
      indices.push(base+1, base+5, base+6,  base+1, base+6, base+2);
      // inner edge
      indices.push(base+0, base+3, base+7,  base+0, base+7, base+4);
      // leading edge
      indices.push(base+0, base+4, base+5,  base+0, base+5, base+1);
      // trailing edge
      indices.push(base+3, base+2, base+6,  base+3, base+6, base+7);
    }

    return { positions, normals, uvs, indices };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal",   new THREE.Float32BufferAttribute(normals,   3));
    geo.setAttribute("uv",       new THREE.Float32BufferAttribute(uvs,       2));
    geo.setIndex(indices);
    geo.computeVertexNormals(); // smooth normals
    return geo;
  }, [positions, normals, uvs, indices]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.18;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#f4f4f2"
          roughness={0.25}
          metalness={0.08}
          side={THREE.DoubleSide}
          envMapIntensity={0.9}
        />
      </mesh>
    </group>
  );
}

/* ── Scene wrapper ── */
function Scene() {
  return (
    <>
      {/* Soft neutral environment for white material shading */}
      <Environment preset="studio" />

      {/* Key light — top-right, warm */}
      <directionalLight position={[4, 8, 4]} intensity={1.8} color="#fff8f0" castShadow />
      {/* Fill light — left, cool */}
      <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#e8f0ff" />
      {/* Subtle under-fill */}
      <pointLight position={[0, -4, 2]} intensity={0.4} color="#ffffff" />
      <ambientLight intensity={0.5} />

      <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.25}>
        <HelixRibbon />
      </Float>
    </>
  );
}

/* ── Public component ── */
export default function HelicalSpiralHero({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
