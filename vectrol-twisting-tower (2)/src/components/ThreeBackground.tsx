import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SceneConfig } from '../types';

interface ThreeBackgroundProps {
  config: SceneConfig;
  currentView: string;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ config, currentView }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    group: THREE.Group;
    lights: {
      hemi: THREE.HemisphereLight;
      ambient: THREE.AmbientLight;
      key: THREE.DirectionalLight;
    };
    loadedModel?: THREE.Object3D;
  } | null>(null);

  const configRef = useRef(config);
  configRef.current = config;

  const pointerRef = useRef({ x: 0, y: 0 });
  const easedRef = useRef({ x: 0, y: 0, scroll: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    renderer.setClearColor(0x000000, 0); // transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe9ebee, 0.035);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const group = new THREE.Group();
    scene.add(group);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xb6bbc2, 1.0);
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 45;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    key.shadow.bias = -0.0006;

    scene.add(hemi, ambient, key);

    sceneRef.current = { scene, camera, renderer, group, lights: { hemi, ambient, key } };

    // Pointer move listener
    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // Resize listener
    const handleResize = () => {
      if (!canvasRef.current || !sceneRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      sceneRef.current.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      sceneRef.current.renderer.setSize(width, height);
      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation loop
    const clock = new THREE.Clock();
    let animId: number;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      if (!sceneRef.current) return;

      const { renderer: ren, scene: scn, camera: cam, group: grp } = sceneRef.current;
      const t = clock.getElapsedTime();
      const cfg = configRef.current;

      easedRef.current.x += (pointerRef.current.x - easedRef.current.x) * 0.05;
      easedRef.current.y += (pointerRef.current.y - easedRef.current.y) * 0.05;

      const docHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const targetScroll = reducedMotion ? 0 : window.scrollY / docHeight;
      easedRef.current.scroll += (targetScroll - easedRef.current.scroll) * 0.06;

      if (!reducedMotion) {
        if (cfg.autoRotate) {
          grp.rotation.y = t * (cfg.speed * 0.15) + easedRef.current.x * (cfg.tiltIntensity * 0.4) + easedRef.current.scroll * Math.PI * 1.1;
        } else {
          grp.rotation.y = easedRef.current.x * (cfg.tiltIntensity * 0.8) + easedRef.current.scroll * Math.PI * 1.1;
        }
        grp.rotation.z = -0.10 + easedRef.current.y * (cfg.tiltIntensity * 0.08);
      }

      cam.position.x = easedRef.current.x * (cfg.tiltIntensity * 0.3);
      cam.position.y = -easedRef.current.y * (cfg.tiltIntensity * 0.3) - easedRef.current.scroll * 1.7;
      cam.lookAt(0, -easedRef.current.scroll * 1.0, 0);

      ren.render(scn, cam);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Geometry / Material / Uploaded Model whenever config changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { group, scene } = sceneRef.current;

    // Clear previous group children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    // If there is an uploaded GLTF/GLB model
    if (config.uploadedModelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        config.uploadedModelUrl,
        (gltf) => {
          const model = gltf.scene;
          // Scale and center model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scale = 4.5 / maxDim;
            model.scale.setScalar(scale);
          }
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.wireframe = config.wireframe;
              }
            }
          });
          group.add(model);
        },
        undefined,
        (err) => console.error('Failed to load GLTF:', err)
      );
      return;
    }

    // Material
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.color),
      roughness: config.roughness,
      metalness: config.metalness,
      wireframe: config.wireframe
    });

    const N = config.plates;
    const GAP = config.gap;
    const twistRad = THREE.MathUtils.degToRad(config.twistAngle);

    if (config.preset === 'tower') {
      const plateGeo = new THREE.BoxGeometry(4.8, 0.06, 1.5);
      for (let i = 0; i < N; i++) {
        const m = new THREE.Mesh(plateGeo, mat);
        const k = i - N / 2;
        m.position.y = k * GAP;
        m.position.x = Math.sin(i * config.waveFrequency) * config.waveAmplitude;
        m.position.z = Math.cos(i * config.waveFrequency) * (config.waveAmplitude * 0.75);
        m.rotation.y = i * twistRad;
        const taper = Math.max(0.2, 1 - (Math.abs(k) / N) * 0.35);
        m.scale.x = taper;
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
      }
    } else if (config.preset === 'helix') {
      const ribbonGeo = new THREE.BoxGeometry(3.6, 0.04, 0.4);
      for (let i = 0; i < N; i++) {
        const m1 = new THREE.Mesh(ribbonGeo, mat);
        const m2 = new THREE.Mesh(ribbonGeo, mat);
        const k = i - N / 2;
        const angle = i * twistRad * 1.5;

        m1.position.set(Math.cos(angle) * 1.6, k * GAP, Math.sin(angle) * 1.6);
        m1.rotation.y = -angle;
        m1.castShadow = true;
        m1.receiveShadow = true;

        m2.position.set(Math.cos(angle + Math.PI) * 1.6, k * GAP, Math.sin(angle + Math.PI) * 1.6);
        m2.rotation.y = -(angle + Math.PI);
        m2.castShadow = true;
        m2.receiveShadow = true;

        group.add(m1, m2);
      }
    } else if (config.preset === 'monolith') {
      const slabGeo = new THREE.BoxGeometry(3.2, 0.1, 3.2);
      for (let i = 0; i < Math.min(N, 60); i++) {
        const m = new THREE.Mesh(slabGeo, mat);
        const k = i - Math.min(N, 60) / 2;
        m.position.y = k * (GAP * 1.5);
        m.rotation.y = i * twistRad * 0.5;
        const s = 1 + Math.sin(i * 0.15) * 0.3;
        m.scale.set(s, 1, s);
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
      }
    } else if (config.preset === 'lattice') {
      const ringGeo = new THREE.TorusGeometry(1.8, 0.04, 12, 36);
      for (let i = 0; i < Math.min(N, 45); i++) {
        const m = new THREE.Mesh(ringGeo, mat);
        const k = i - Math.min(N, 45) / 2;
        m.position.y = k * (GAP * 1.8);
        m.rotation.x = Math.PI / 2 + Math.sin(i * 0.2) * 0.3;
        m.rotation.z = i * twistRad;
        const scale = 0.6 + Math.abs(Math.sin(i * 0.12)) * 0.8;
        m.scale.setScalar(scale);
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
      }
    }
  }, [
    config.plates,
    config.twistAngle,
    config.gap,
    config.waveAmplitude,
    config.waveFrequency,
    config.color,
    config.roughness,
    config.metalness,
    config.wireframe,
    config.preset,
    config.uploadedModelUrl
  ]);

  return (
    <>
      <canvas ref={canvasRef} id="scene" className="fixed inset-0 z-0 block pointer-events-auto" aria-hidden="true" />
      <div
        className="fixed inset-0 z-1 pointer-events-none transition-opacity duration-500"
        style={{
          background: 'radial-gradient(120% 95% at 45% 45%, transparent 58%, rgba(22,26,32,0.06) 100%)'
        }}
        aria-hidden="true"
      />
    </>
  );
};
