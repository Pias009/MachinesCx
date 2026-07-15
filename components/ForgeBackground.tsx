"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ForgeBackground({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.offsetWidth, mount.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.6 : 0.85;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    if (isLight) {
      // ── LIGHT MODE: bright factory hall ──
      scene.background = new THREE.Color(0xe8f4f3);
      scene.fog = new THREE.FogExp2(0xddf0ee, 0.018);
    } else {
      // ── DARK MODE: night floor ──
      scene.background = new THREE.Color(0x060d0c);
      scene.fog = new THREE.Fog(0x060d0c, 18, 55);
    }

    const camera = new THREE.PerspectiveCamera(55, mount.offsetWidth / mount.offsetHeight, 0.1, 100);
    camera.position.set(0, 3.2, 10);
    camera.lookAt(0, 0, -6);

    // ── Floor ──
    const floorMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xd4e8e5 : 0x0a1614,
      roughness: isLight ? 0.75 : 0.92,
      metalness: isLight ? 0.05 : 0.08,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 80), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Grid ──
    const grid = new THREE.GridHelper(
      80, 40,
      isLight ? 0x8bbfbb : 0x1a3532,
      isLight ? 0xb0d8d4 : 0x112220
    );
    grid.position.y = 0.01;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    (grid.material as THREE.LineBasicMaterial).opacity = isLight ? 0.3 : 0.32;
    scene.add(grid);

    // ── Columns ──
    const colMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xbad8d5 : 0x0d1c1a,
      roughness: 0.85,
      metalness: isLight ? 0.15 : 0.2,
    });
    [[-8,-5],[8,-5],[-14,-15],[14,-15],[-20,-28],[20,-28]].forEach(([x,z]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8, 0.5), colMat);
      col.position.set(x, 4, z);
      col.castShadow = true;
      scene.add(col);
    });

    // ── Beams ──
    const beamMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xc2dedd : 0x0d1c1a,
      roughness: 0.8,
      metalness: isLight ? 0.2 : 0.3,
    });
    [-5, -15].forEach(z => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(18, 0.18, 0.18), beamMat);
      beam.position.set(0, 7.5, z);
      scene.add(beam);
    });

    // ── Light rigs ──
    const rigMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x9ec8c5 : 0x1a2828,
      roughness: 0.65,
      metalness: 0.6,
    });
    [-6, -14, -24].forEach(z => {
      const rig = new THREE.Mesh(new THREE.BoxGeometry(12, 0.08, 0.35), rigMat);
      rig.position.set(0, 6.8, z);
      scene.add(rig);
      [-4, 0, 4].forEach(x => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), rigMat);
        cone.position.set(x, 6.5, z);
        scene.add(cone);
      });
    });

    // ── Lighting ──
    if (isLight) {
      // Bright daylight hall
      scene.add(new THREE.AmbientLight(0xffffff, 1.8));

      const sun = new THREE.DirectionalLight(0xfff5ee, 2.2);
      sun.position.set(5, 20, 8);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.far = 60;
      sun.shadow.camera.left = -20;
      sun.shadow.camera.right = 20;
      sun.shadow.camera.top = 20;
      sun.shadow.camera.bottom = -30;
      scene.add(sun);

      // Soft teal fill bounce off floor
      const tealFill = new THREE.HemisphereLight(0xe8faf9, 0xc5e8e5, 0.9);
      scene.add(tealFill);

      // Overhead spots — warm white
      [-6, -14, -24].forEach(z => {
        const spot = new THREE.SpotLight(0xfff8f0, 1.2, 16, Math.PI / 5, 0.5, 1.5);
        spot.position.set(0, 6.5, z);
        spot.target.position.set(0, 0, z);
        scene.add(spot); scene.add(spot.target);
      });
    } else {
      // Dark industrial
      scene.add(new THREE.AmbientLight(0x0a1a18, 0.6));

      const key = new THREE.DirectionalLight(0x2bbfb3, 0.7);
      key.position.set(0, 12, 8);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.far = 60;
      key.shadow.camera.left  = -20; key.shadow.camera.right = 20;
      key.shadow.camera.top   =  20; key.shadow.camera.bottom = -30;
      scene.add(key);

      const warm = new THREE.PointLight(0x3d1a0a, 1.8, 25);
      warm.position.set(-6, 1.5, 2); scene.add(warm);

      const cool = new THREE.PointLight(0x0d3530, 2.2, 30);
      cool.position.set(6, 2, -4); scene.add(cool);

      [-6, -14, -24].forEach(z => {
        const spot = new THREE.SpotLight(0x2bbfb3, 1.4, 16, Math.PI / 5, 0.6, 1.5);
        spot.position.set(0, 6.5, z);
        spot.target.position.set(0, 0, z);
        scene.add(spot); scene.add(spot.target);
      });
    }

    function onResize() {
      if (!mount) return;
      camera.aspect = mount.offsetWidth / mount.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.offsetWidth, mount.offsetHeight);
    }
    window.addEventListener("resize", onResize, { passive: true });

    let rafId: number;
    let t = 0;
    function frame() {
      rafId = requestAnimationFrame(frame);
      t += 0.004;
      camera.position.z = 10 - scrollRef.current * 4;
      camera.position.x = Math.sin(t * 0.4) * 0.4;
      camera.position.y = 3.2 + Math.sin(t * 0.25) * 0.12;
      camera.lookAt(Math.sin(t * 0.3) * 0.2, 0, -6);
      renderer.render(scene, camera);
    }
    frame();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [isLight]);

  return (
      <div
        ref={mountRef}
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
  );
}
