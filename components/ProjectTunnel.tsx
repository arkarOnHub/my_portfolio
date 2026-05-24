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
  mobilePosition,
  mobileTextPosition,
}: {
  modelPath: string;
  position: [number, number, number];
  scale?: number;
  title: string;
  description: string;
  textPosition?: [number, number, number];
  mobilePosition?: [number, number, number];
  mobileTextPosition?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const textRef = useRef<HTMLDivElement>(null!);
  const { scene } = useGLTF(modelPath) as GLTF & { scene: THREE.Group };
  const { pointer, size } = useThree();
  const isMobile = size.width < 768;

  const actualPosition: [number, number, number] = isMobile
    ? (mobilePosition ?? [0, -1.5, position[2]])
    : position;

  const actualTextPosition: [number, number, number] = isMobile
    ? (mobileTextPosition ?? [0, 3.5, 0])
    : textPosition;

  // Clone scene so multiple uses don't share the same exact object (though we only use each once here)
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = MATTE_WHITE;
        child.material.transparent = true;
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
    
    // Pointer offset for position (without doubling base position)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, pointer.x * 0.5, 0.05);

    // Fade text based on distance (mobile reaches full opacity closer to center)
    const dist = Math.abs(state.camera.position.z - position[2]);
    const near = isMobile ? 8.5 : 5;
    const far = isMobile ? 12 : 12;
    let opacity = 1 - (dist - near) / (far - near);
    opacity = THREE.MathUtils.clamp(opacity, 0, 1);

    // Fade model earlier than text
    const modelNear = isMobile ? 6.5 : 4;
    const modelFar = isMobile ? 12 : 12;
    let modelOpacity = 1 - (dist - modelNear) / (modelFar - modelNear);
    modelOpacity = THREE.MathUtils.clamp(modelOpacity, 0, 1);
    if (textRef.current) textRef.current.style.opacity = opacity.toString();

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.opacity = modelOpacity;
      }
    });
  });

  return (
    <group position={actualPosition}>
      {/* The rotating model */}
      <group ref={groupRef} scale={scale}>
        <primitive object={scene} />
      </group>
      
      {/* The floating text beside it */}
      <Html
        position={actualTextPosition}
        transform
        distanceFactor={4}
        className="pointer-events-none"
      >
        <div 
          ref={textRef} 
          className={`bg-white/40 backdrop-blur-md border border-neutral-200 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.05)] text-black transition-opacity duration-75 ${isMobile ? 'w-[320px] p-6' : 'w-[450px] p-8'}`}
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
  mobilePosition,
}: {
  title: string;
  description: string;
  position: [number, number, number];
  mobilePosition?: [number, number, number];
}) {
  const textRef = useRef<HTMLDivElement>(null!);
  const { size } = useThree();
  const isMobile = size.width < 768;

  const actualPosition: [number, number, number] = isMobile
    ? (mobilePosition ?? [0, 0, position[2]])
    : position;

  useFrame((state) => {
    // Fade text based on distance (mobile reaches full opacity closer to center)
    const dist = Math.abs(state.camera.position.z - position[2]);
    const near = isMobile ? 8.5 : 5;
    const far = isMobile ? 12 : 12;
    let opacity = 1 - (dist - near) / (far - near);
    opacity = THREE.MathUtils.clamp(opacity, 0, 1);
    if (textRef.current) textRef.current.style.opacity = opacity.toString();
  });

  return (
    <group position={actualPosition}>
      <Html
        transform
        distanceFactor={4} // Scales the HTML based on camera distance
        className="pointer-events-none" // We don't want it blocking 3D clicks unless we make it interactive
      >
        <div 
          ref={textRef}
          className={`bg-white/40 backdrop-blur-md border border-neutral-200 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.05)] text-black transition-opacity duration-75 ${isMobile ? 'w-[320px] p-6' : 'w-[600px] p-10'}`}
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
        scale={0.75} // adjust scale as needed
        mobilePosition={[0, -0.5, -15]}
        mobileTextPosition={[0, 1.8, 0]}
        title="Project 1"
        description="A six-axis robotic arm designed for precision assembly and advanced manufacturing. Complete hardware and software integration."
        textPosition={[-4.5, 0, 0]} // Place text to the left of the model
      />

      {/* Project 2: Software (Left) */}
      <SoftwareProject
        title="Project 2"
        description="A fluid, high-performance architecture for next-generation web applications. Built with scale and aesthetic purity in mind."
        position={[-2.5, 1, -25]}
        mobilePosition={[0, 1.3, -25]}
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
        mobilePosition={[0, 1.3, -45]}
      />
    </>
  );
}

// Preload the models
useGLTF.preload("/models/robotarm.glb");
useGLTF.preload("/models/self_balancing_robot.glb");
