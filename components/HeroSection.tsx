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

        // Fade out typography during the first 30% of the scroll
        const titleEl = trackEl.querySelector(".hero-title") as HTMLElement;
        if (titleEl) {
          const fadeProgress = Math.min(1, self.progress / 0.3);
          titleEl.style.opacity = (1 - fadeProgress).toString();
          titleEl.style.transform = `translateY(${fadeProgress * -50}px)`;
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
      {/* ── Overlay UI (Navbar) floating glassmorphism ────────────────── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
        <div className="flex items-center justify-between gap-12 px-8 py-3 rounded-full bg-white/40 backdrop-blur-md border border-neutral-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-black">
          <h1 className="text-lg font-bold uppercase tracking-widest font-sans">
            HAK
          </h1>
          <nav className="flex gap-8 text-xs uppercase tracking-widest font-mono font-medium">
            <a href="#home" className="hover:opacity-60 transition-opacity cursor-pointer">Home</a>
            <a href="#works" className="hover:opacity-60 transition-opacity cursor-pointer">Works</a>
            <a href="#contact" className="hover:opacity-60 transition-opacity cursor-pointer">Contact</a>
          </nav>
        </div>
      </div>

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
          {/* ── Large Typography Overlay ─────────────────────────────────── */}
          <div className="absolute top-[20%] left-0 w-full px-8 md:px-16 z-40 pointer-events-none mix-blend-exclusion text-white hero-title">
            <h2 className="text-[4rem] md:text-[8rem] leading-[0.9] font-bold uppercase tracking-tighter mix-blend-difference text-white">
              Creative<br/>
              <span className="ml-[10%]">Engineering</span>
            </h2>
            <div className="mt-8 ml-[10%] flex gap-4 text-xs font-mono tracking-widest uppercase opacity-70">
              <p>[01] Hardware</p>
              <p>[02] Software</p>
            </div>
          </div>

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
