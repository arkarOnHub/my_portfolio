"use client";

import { useRef, useEffect, MutableRefObject } from "react";
import { useGLTF } from "@react-three/drei";
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
const CAM_SCREEN_POS = new THREE.Vector3(0.006, 1.08, -0.18);
const CAM_END_POS    = new THREE.Vector3(0.006, 1.08, -2.5); // Punched through the white screen into void

const LOOK_START   = new THREE.Vector3(0, 1.3, 0);
const LOOK_SCREEN  = new THREE.Vector3(0.006, 1.08, -1);
const LOOK_THROUGH = new THREE.Vector3(0.006, 1.08, -5);

// Easing: smooth cubic
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

import ProjectTunnel from "./ProjectTunnel";

// ─── Main Scene ──────────────────────────────────────────────────────────────
export default function DeskScene({ scrollProgressRef }: DeskSceneProps) {
  const { camera } = useThree();
  const screenLightRef = useRef<THREE.PointLight>(null!);

  // Temp vectors — allocated once, reused every frame
  const _pos    = useRef(new THREE.Vector3());
  const _lookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    const raw = scrollProgressRef.current ?? 0;
    
    // Phase 1: Dolly to Screen (scroll 0.0 -> 0.116)
    const p1 = Math.max(0, Math.min(1, raw / 0.116));
    const t1 = easeInOutCubic(p1);

    // Phase 2: Lock on screen (0.116 -> 0.216) - slight drift to keep it alive
    const p2 = Math.max(0, Math.min(1, (raw - 0.116) / 0.1));
    
    // Phase 3: Punch through screen (0.216 -> 0.283)
    const p3 = Math.max(0, Math.min(1, (raw - 0.216) / 0.067));
    const t3 = easeInOutCubic(p3);

    // Phase 4: Tunnel Journey (0.283 -> 1.0)
    const p4 = Math.max(0, Math.min(1, (raw - 0.283) / 0.717));

    if (raw < 0.216) {
      // Interpolate to screen
      _pos.current.lerpVectors(CAM_START_POS, CAM_SCREEN_POS, t1);
      _lookAt.current.lerpVectors(LOOK_START, LOOK_SCREEN, t1);
      
      // Inject slight drift during lock phase
      _pos.current.z -= p2 * 0.05; 
      
      camera.position.copy(_pos.current);
      camera.lookAt(_lookAt.current);
    } else {
      // Punch through the screen into the void
      // We start from where Phase 2 left off
      const driftZ = CAM_SCREEN_POS.z - 0.05;
      const startThroughX = _pos.current.set(CAM_SCREEN_POS.x, CAM_SCREEN_POS.y, driftZ);

      _pos.current.lerpVectors(startThroughX, CAM_END_POS, t3);
      _lookAt.current.lerpVectors(LOOK_SCREEN, LOOK_THROUGH, t3);
      
      // Phase 4: Z-Axis Tunnel 
      // The camera moves from z = -2.5 to z = -50 as p4 goes from 0 to 1
      if (p4 > 0) {
         const tunnelZ = -2.5 - (p4 * 47.5);
         _pos.current.z = tunnelZ;
         _lookAt.current.z = tunnelZ - 2.5; // Always looking slightly ahead
      }

      camera.position.copy(_pos.current);
      camera.lookAt(_lookAt.current);
    }

    // Adjust screen light intensity based on camera proximity
    if (screenLightRef.current) {
      screenLightRef.current.intensity = 0.4 + t1 * 2.2 - t3 * 2.6; // fades out as we punch through
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
      <ProjectTunnel />
    </>
  );
}
