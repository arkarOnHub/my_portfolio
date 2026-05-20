"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";

// ─── Material override: force matte-white on every mesh ─────────────────────
const MATTE_WHITE = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#f8f8f8"),
  roughness: 1.0,
  metalness: 0.0,
});

function HardwareProject({
  modelPath,
  position,
  scale = 1,
  title,
  description,
  textPosition = [-5, 0, 0], // Relative to the group
}: {
  modelPath: string;
  position: [number, number, number];
  scale?: number;
  title: string;
  description: string;
  textPosition?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const textRef = useRef<HTMLDivElement>(null!);
  const { scene } = useGLTF(modelPath) as GLTF & { scene: THREE.Group };
  const { pointer } = useThree();

  // Clone scene so multiple uses don't share the same exact object (though we only use each once here)
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = MATTE_WHITE;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Gentle auto-rotation
    groupRef.current.rotation.y += delta * 0.2;

    // Mouse interaction for rotation (adds on top of auto-rotation)
    const targetY = pointer.y * 0.5; // Mouse Y mapped to rotation
    
    // Smooth dampening towards mouse target
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
    // Note: We don't lerp Y completely to target because of auto-rotation, 
    // instead we can add a slight offset based on pointer.x
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0] + pointer.x * 0.5, 0.05);

    // Fade text based on distance (matching the fog of 5 to 12)
    const dist = Math.abs(state.camera.position.z - position[2]);
    let opacity = 1 - (dist - 5) / (12 - 5);
    opacity = THREE.MathUtils.clamp(opacity, 0, 1);
    if (textRef.current) textRef.current.style.opacity = opacity.toString();
  });

  return (
    <group position={position}>
      {/* The rotating model */}
      <group ref={groupRef} scale={scale}>
        <primitive object={scene} />
      </group>
      
      {/* The floating text beside it */}
      <Html
        position={textPosition}
        transform
        distanceFactor={4}
        className="pointer-events-none"
      >
        <div 
          ref={textRef} 
          className="w-[450px] bg-white/40 backdrop-blur-md p-8 border border-neutral-200 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.05)] text-black transition-opacity duration-75"
          style={{ opacity: 0 }}
        >
          <h3 className="text-3xl font-bold uppercase tracking-tight mb-3">{title}</h3>
          <p className="text-base text-neutral-600 leading-relaxed">
            {description}
          </p>
          <div className="mt-6 flex gap-3">
            <div className="h-2 w-16 bg-neutral-800 rounded-full"></div>
            <div className="h-2 w-4 bg-neutral-300 rounded-full"></div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function SoftwareProject({
  title,
  description,
  position,
}: {
  title: string;
  description: string;
  position: [number, number, number];
}) {
  const textRef = useRef<HTMLDivElement>(null!);

  useFrame((state) => {
    // Fade text based on distance (matching the fog of 5 to 12)
    const dist = Math.abs(state.camera.position.z - position[2]);
    let opacity = 1 - (dist - 5) / (12 - 5);
    opacity = THREE.MathUtils.clamp(opacity, 0, 1);
    if (textRef.current) textRef.current.style.opacity = opacity.toString();
  });

  return (
    <group position={position}>
      <Html
        transform
        distanceFactor={4} // Scales the HTML based on camera distance
        className="pointer-events-none" // We don't want it blocking 3D clicks unless we make it interactive
      >
        <div 
          ref={textRef}
          className="w-[600px] bg-white/40 backdrop-blur-md p-10 border border-neutral-200 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.05)] text-black transition-opacity duration-75"
          style={{ opacity: 0 }}
        >
          <h3 className="text-4xl font-bold uppercase tracking-tight mb-4">{title}</h3>
          <p className="text-lg text-neutral-600 leading-relaxed">
            {description}
          </p>
          <div className="mt-8 flex gap-4">
            <div className="h-12 w-32 bg-neutral-100 rounded-full animate-pulse"></div>
            <div className="h-12 w-32 bg-neutral-100 rounded-full animate-pulse delay-75"></div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function ProjectTunnel() {
  return (
    <>
      {/* Project 1: Robot Arm (Right) */}
      <HardwareProject
        modelPath="/models/robotarm.glb"
        position={[2.5, 1, -15]}
        scale={0.5} // adjust scale as needed
        title="Project 1"
        description="A six-axis robotic arm designed for precision assembly and advanced manufacturing. Complete hardware and software integration."
        textPosition={[-4.5, 0, 0]} // Place text to the left of the model
      />

      {/* Project 2: Software (Left) */}
      <SoftwareProject
        title="Project 2"
        description="A fluid, high-performance architecture for next-generation web applications. Built with scale and aesthetic purity in mind."
        position={[-2.5, 1, -25]}
      />

      {/* Project 3: Balancing Robot (Right) */}
      <HardwareProject
        modelPath="/models/self_balancing_robot.glb"
        position={[2.5, 1, -35]}
        scale={0.8} // adjust scale as needed
        title="Project 3"
        description="A self-balancing inverted pendulum robot leveraging PID control theory and real-time gyro/accelerometer fusion algorithms."
        textPosition={[-4.5, 0, 0]} // Place text to the left of the model
      />

      {/* Project 4: Software (Left) */}
      <SoftwareProject
        title="Project 4"
        description="Generative AI interfaces and spatial computing logic. Bridging the gap between pure data and human-centric design."
        position={[-2.5, 1, -45]}
      />
    </>
  );
}

// Preload the models
useGLTF.preload("/models/robotarm.glb");
useGLTF.preload("/models/self_balancing_robot.glb");
