"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import DeskScene from "./DeskScene";
import ScrollHint from "./ScrollHint";

// Register GSAP plugin — safe to call multiple times
gsap.registerPlugin(ScrollTrigger);

// ─── Loading Fallback ────────────────────────────────────────────────────────
function SceneLoader() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0, 0, 0]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  // Shared ref: GSAP writes progress here, useFrame reads it — zero GC
  const scrollProgressRef = useRef<number>(0);

  // Scroll hint visibility
  const [hintVisible, setHintVisible] = useState(true);

  // Refs for DOM nodes
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackRef           = useRef<HTMLDivElement>(null);
  const pinRef             = useRef<HTMLDivElement>(null);

  // Lenis instance ref
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const trackEl  = trackRef.current;
    if (!scrollEl || !trackEl) return;

    // ── 1. Lenis smooth scroll ────────────────────────────────────────────
    const lenis = new Lenis({
      wrapper: scrollEl,
      content: scrollEl,          // Lenis targets the scroll container
      duration: 1.35,
      easing: (t: number) =>
        t === 1 ? 1 : 1 - Math.pow(2, -10 * t), // exponential ease-out
      smoothWheel: true,
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;

    // Sync Lenis with GSAP ticker for ScrollTrigger compatibility
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ── 2. GSAP ScrollTrigger — drive scroll progress ─────────────────────
    //
    // We do NOT use pin:true (which moves DOM nodes and can conflict with sticky).
    // Instead, the heroCanvas uses CSS position:sticky, and ScrollTrigger just
    // reads progress from the track element's scroll range.
    //
    const trigger = ScrollTrigger.create({
      trigger: trackEl,
      scroller: scrollEl,          // must match Lenis wrapper
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,                  // small scrub lag = buttery elastic feel
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;

        // Hide scroll hint after 3% scroll
        if (self.progress > 0.03) {
          setHintVisible(false);
        } else {
          setHintVisible(true);
        }
      },
    });

    return () => {
      trigger.kill();
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return (
    <div
      id="scroll-container"
      ref={scrollContainerRef}
      style={{ height: "100vh", overflowY: "scroll" }}
    >
      {/* ── Scroll Track: 300vh tall — the scroll distance ─────────────── */}
      <div
        ref={trackRef}
        className="hero-scroll-track"
        aria-label="Hero scroll section"
      >
        {/* ── Sticky Canvas Pin ──────────────────────────────────────────── */}
        <div
          ref={pinRef}
          className="hero-canvas-pin"
        >
          {/* ── WebGL Canvas ────────────────────────────────────────────── */}
          <Canvas
            camera={{
              fov: 45,
              near: 0.01,
              far: 100,
              position: [0, 1.9, 5.5],
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              toneMapping: 2,          // THREE.ACESFilmicToneMapping
              toneMappingExposure: 1.1,
            }}
            shadows
            style={{ background: "#ffffff" }}
            dpr={[1, 2]}              // retina on high-DPI, cap at 2x
          >
            <color attach="background" args={["#ffffff"]} />
            <Suspense fallback={<SceneLoader />}>
              <DeskScene scrollProgressRef={scrollProgressRef} />
            </Suspense>
          </Canvas>

          {/* ── Scroll Hint ─────────────────────────────────────────────── */}
          <ScrollHint visible={hintVisible} />
        </div>
      </div>
    </div>
  );
}
