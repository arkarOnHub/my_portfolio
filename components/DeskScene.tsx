"use client";

import { useRef, useEffect, MutableRefObject } from "react";
import { useGLTF, useProgress } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";

// ─── Types ──────────────────────────────────────────────────────────────────
interface DeskSceneProps {
  /** Scroll progress from 0 (start) to 1 (laptop fills screen) */
  scrollProgressRef: MutableRefObject<number>;
}

// ─── Camera Keyframes ────────────────────────────────────────────────────────
//
// These define the cinematic dolly-in path.
// t=0 → wide establishing shot (creator silhouette)
// t=1 → punched in to fill viewport with laptop screen
//
// All coordinates are in Three.js world space (Y-up).
// Fine-tune Z_CLOSE and TARGET_CLOSE once you can inspect the GLB in browser.
//
const CAM_START_POS  = new THREE.Vector3(0,   1.9,  5.5);
const CAM_END_POS    = new THREE.Vector3(0.006, 1.08, -0.18);

const LOOK_START = new THREE.Vector3(0, 1.3, 0);
const LOOK_END   = new THREE.Vector3(0.006, 1.08, -1);   // punch through

// Easing: smooth cubic so the dolly decelerates as it approaches the screen
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Material override: force matte-white on every mesh ─────────────────────
const MATTE_WHITE = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#f8f8f8"),
  roughness: 1.0,
  metalness: 0.0,
});

// Laptop-screen emissive material — cool glow, visible in backlit scene
const SCREEN_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#c8e8ff"),
  emissive: new THREE.Color("#a0ccee"),
  emissiveIntensity: 0.6,
  roughness: 0.4,
  metalness: 0.05,
});

// ─── Preload ─────────────────────────────────────────────────────────────────
useGLTF.preload("/models/hero_section_sittingAtDesk.glb");

// ─── Model Component ─────────────────────────────────────────────────────────
function DeskModel() {
  const { scene } = useGLTF("/models/hero_section_sittingAtDesk.glb") as GLTF & {
    scene: THREE.Group;
  };

  useEffect(() => {
    // Walk every mesh and apply matte-white override.
    // Name-match "screen" meshes to apply the glow material instead.
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      // Identify laptop screen by name (common naming: "Screen", "Display", etc.)
      const name = child.name.toLowerCase();
      const isScreen =
        name.includes("screen") ||
        name.includes("display") ||
        name.includes("monitor") ||
        name.includes("laptop_screen");

      if (isScreen) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        console.log("FOUND SCREEN MESH:", name, pos);
      }

      child.material = isScreen ? SCREEN_MATERIAL : MATTE_WHITE;
      child.castShadow = true;
      child.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} />;
}

// ─── Main Scene ──────────────────────────────────────────────────────────────
export default function DeskScene({ scrollProgressRef }: DeskSceneProps) {
  const { camera } = useThree();
  const screenLightRef = useRef<THREE.PointLight>(null!);

  // Temp vectors — allocated once, reused every frame
  const _pos    = useRef(new THREE.Vector3());
  const _lookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    const raw = scrollProgressRef.current ?? 0;
    const t   = easeInOutCubic(Math.max(0, Math.min(1, raw)));

    // Interpolate camera position
    _pos.current.lerpVectors(CAM_START_POS, CAM_END_POS, t);
    camera.position.copy(_pos.current);

    // Interpolate lookAt target
    _lookAt.current.lerpVectors(LOOK_START, LOOK_END, t);
    camera.lookAt(_lookAt.current);

    // Increase screen glow intensity as camera approaches
    if (screenLightRef.current) {
      screenLightRef.current.intensity = 0.4 + t * 2.2;
    }
  });

  return (
    <>
      {/* ── Lighting ──────────────────────────────────────────────── */}

      {/* Barely-there ambient so matte white surfaces aren't pure black */}
      <ambientLight intensity={0.04} />

      {/* Strong backlight: creates dramatic silhouette against white bg */}
      <directionalLight
        position={[0, 6, -8]}
        intensity={4.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Slight fill from above-front to prevent complete silhouette darkness */}
      <directionalLight
        position={[0, 4, 6]}
        intensity={0.12}
        color="#e8f2ff"
      />

      {/* Laptop screen glow — positioned at approximate screen center */}
      <pointLight
        ref={screenLightRef}
        position={[0, 1.28, 0.5]}
        intensity={0.4}
        color="#b8deff"
        distance={2.5}
        decay={2}
      />

      {/* Subtle rim light from the left for surface edge definition */}
      <directionalLight
        position={[-4, 2, 1]}
        intensity={0.08}
        color="#ffffff"
      />

      {/* ── Model ──────────────────────────────────────────────────── */}
      <DeskModel />
    </>
  );
}
