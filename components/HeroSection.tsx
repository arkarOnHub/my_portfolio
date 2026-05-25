"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import DeskScene from "./DeskScene";
import ScrollHint from "./ScrollHint";
import ContactSection from "./ContactSection";

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

        // Fade out Phase 1 typography early on (0% to 5%)
        const titleEl = trackEl.querySelector(".hero-title") as HTMLElement;
        if (titleEl) {
          const fadeProgress = Math.min(1, self.progress / 0.05);
          titleEl.style.opacity = (1 - fadeProgress).toString();
          titleEl.style.transform = `translateY(${fadeProgress * -50}px)`;
        }

        // Phase 2 Bridge Text reveal (11.6% to 16.6%) and fade out (21.6% to 26.6%)
        const bridgeEl = trackEl.querySelector(".bridge-text") as HTMLElement;
        if (bridgeEl) {
          let bridgeOpacity = 0;
          let bridgeScale = 0.9;
          
          if (self.progress >= 0.116 && self.progress < 0.166) {
            // Fade in and scale up
            const p = (self.progress - 0.116) / 0.05;
            bridgeOpacity = p;
            bridgeScale = 0.9 + (p * 0.1);
          } else if (self.progress >= 0.166 && self.progress <= 0.216) {
            // Hold screen
            bridgeOpacity = 1;
            bridgeScale = 1;
          } else if (self.progress > 0.216 && self.progress <= 0.266) {
            // Fade out and scale down (punch through)
            const p = (self.progress - 0.216) / 0.05;
            bridgeOpacity = 1 - p;
            bridgeScale = 1 - (p * 0.2);
          }
          
          bridgeEl.style.opacity = bridgeOpacity.toString();
          bridgeEl.style.transform = `scale(${bridgeScale})`;
        }

        // Phase 4 The Arrival: 0.84 -> 0.95
        // Canvas fade out (0.84 -> 0.85)
        const canvasWrapper = trackEl.querySelector(".canvas-wrapper") as HTMLElement;
        if (canvasWrapper) {
          if (self.progress >= 0.84 && self.progress <= 0.85) {
             const p = (self.progress - 0.84) / 0.01;
             canvasWrapper.style.opacity = (1 - p).toString();
          } else if (self.progress > 0.85) {
             canvasWrapper.style.opacity = "0";
          } else {
             canvasWrapper.style.opacity = "1";
          }
        }

        const contactLayer = trackEl.querySelector(".contact-layer") as HTMLElement;
        if (contactLayer) {
          if (self.progress > 0.8) {
            contactLayer.style.display = "block";
            contactLayer.style.opacity = "1";
            contactLayer.style.pointerEvents = "auto";
          } else {
            contactLayer.style.opacity = "0";
            contactLayer.style.pointerEvents = "none";
            contactLayer.style.display = "none";
          }
        }

        // Horizon Line reveal (0.85 -> 0.86)
        const horizonLine = trackEl.querySelector(".horizon-line") as HTMLElement;
        if (horizonLine) {
          if (self.progress >= 0.85 && self.progress <= 0.86) {
            const p = (self.progress - 0.85) / 0.01;
            // cubic ease out
            const easeP = 1 - Math.pow(1 - p, 3);
            horizonLine.style.transform = `scaleX(${easeP})`;
            horizonLine.style.opacity = "1";
          } else if (self.progress > 0.86) {
            horizonLine.style.transform = "scaleX(1)";
            // Fade out horizon line as panels fold open
            if (self.progress > 0.88) {
               horizonLine.style.opacity = "0";
            } else {
               horizonLine.style.opacity = "1";
            }
          } else {
            horizonLine.style.transform = "scaleX(0)";
            horizonLine.style.opacity = "0";
          }
        }

        // Fold animation (0.86 -> 0.95)
        const foldTop = trackEl.querySelector(".fold-top") as HTMLElement;
        const foldBottom = trackEl.querySelector(".fold-bottom") as HTMLElement;
        if (foldTop && foldBottom) {
          if (self.progress >= 0.86) {
            const p = Math.min(1, (self.progress - 0.86) / 0.09);
            // rotate top back (negative rotateX), rotate bottom forward (positive rotateX or inverse)
            foldTop.style.transform = `rotateX(${p * 90}deg)`;
            foldBottom.style.transform = `rotateX(${p * -90}deg)`;
          } else {
            foldTop.style.transform = `rotateX(0deg)`;
            foldBottom.style.transform = `rotateX(0deg)`;
          }
        }
      },
    });

    return () => {
      trigger.kill();
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  // ── Nav scroll helpers ─────────────────────────────────────────────────
  // The entire experience lives inside a Lenis-controlled scroll container
  // spanning 1500vh. We calculate pixel offsets as a fraction of total height.
  const scrollTo = (progress: number) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const totalHeight = 1500 * window.innerHeight / 100;
    lenis.scrollTo(totalHeight * progress, {
      duration: 1.8,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
  };

  return (
    <div
      id="scroll-container"
      ref={scrollContainerRef}
      style={{ height: "100vh", overflowY: "scroll" }}
    >
      {/* ── Overlay UI (Navbar) floating glassmorphism ────────────────── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
        <div
          className="flex items-center justify-between gap-12 rounded-full bg-white/40 backdrop-blur-md border border-neutral-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-black"
          style={{ padding: "10px 10px" }}
        >
          <h1 className="text-lg font-bold uppercase tracking-widest font-sans ml-8">
            HAK
          </h1>
          <nav className="flex gap-8 text-xs uppercase tracking-widest font-mono font-medium mr-8">
            {/* Home → beginning of scroll track */}
            <button onClick={() => scrollTo(0)} className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none p-0 font-mono text-xs uppercase tracking-widest font-medium">Home</button>
            {/* Works → ~30% into scroll track (camera enters tunnel) */}
            <button onClick={() => scrollTo(0.30)} className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none p-0 font-mono text-xs uppercase tracking-widest font-medium">Works</button>
            {/* Contact → 90% into scroll track (fold fully open) */}
            <button onClick={() => scrollTo(0.92)} className="hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none p-0 font-mono text-xs uppercase tracking-widest font-medium">Contact</button>
          </nav>
        </div>
      </div>

      {/* ── Scroll Track: 1500vh tall to encompass Phase 1 to Phase 4 ─────── */}
      <div
        ref={trackRef}
        className="h-[1500vh] relative"
        aria-label="Hero, Bridge, Tunnel, and Arrival section"
      >
        {/* ── Sticky Canvas Pin ──────────────────────────────────────────── */}
        <div
          ref={pinRef}
          className="hero-canvas-pin perspective-container"
          style={{ perspective: "1000px" }}
        >
          {/* ── Contact Section (Underneath everything) ─────────────────── */}
          <div
            className="absolute inset-0 z-30 contact-layer pointer-events-none transition-opacity duration-500"
            style={{ opacity: 0, display: "none" }}
          >
             <Suspense fallback={null}>
               <ContactSection lenisRef={lenisRef} />
             </Suspense>
          </div>

          {/* ── Fold Overlays (Top and Bottom halves) ────────────────────── */}
          {/* Z-10 covers the Contact section. We set transform-origin to the split line */}
          <div className="absolute top-0 left-0 w-full h-[50%] bg-white z-10 fold-top transform-origin-bottom pointer-events-none" style={{ transformOrigin: "bottom center", backfaceVisibility: "hidden" }}></div>
          <div className="absolute bottom-0 left-0 w-full h-[50%] bg-white z-10 fold-bottom transform-origin-top pointer-events-none" style={{ transformOrigin: "top center", backfaceVisibility: "hidden" }}></div>

          {/* ── Horizon Line ──────────────────────────────────────────────── */}
          <div className="absolute top-[50%] left-0 w-full h-[2px] bg-black z-20 horizon-line -translate-y-1/2 scale-x-0 pointer-events-none" style={{ transformOrigin: "center" }}></div>

          {/* ── Phase 1: Large Typography Overlay ───────────────────────── */}
          <div className="absolute top-[20%] left-0 w-full px-8 md:px-16 z-40 pointer-events-none mix-blend-exclusion text-white hero-title">
            <h2 className="text-[4rem] md:text-[18rem] leading-[0.9] font-bold uppercase tracking-tighter mix-blend-difference text-white">
              HTET<br/>
              <span className="ml-[10%]">ARKAR</span>
            </h2>
            <div className="mt-8 ml-[10%] flex gap-4 text-xs font-mono tracking-widest uppercase opacity-70">
              <p>[01] Software</p>
              <p>[02] Hardware</p>
            </div>
          </div>

          {/* ── Phase 2: The Bridge (Introduction) ──────────────────────── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-30 pointer-events-none bridge-text opacity-0">
            <p className="text-xl md:text-3xl font-medium max-w-3xl leading-relaxed tracking-wide text-black bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
              I’m a Robotics and AI Engineering student specializing in AI, LLMs, and Autonomous Systems. When I'm not building RAG pipelines or training AI models, I'm likely behind a camera shooting cinematic contents, or optimizing my Push-Pull-Legs routine.
            </p>
          </div>

          {/* ── WebGL Canvas ────────────────────────────────────────────── */}
          <div className="absolute inset-0 z-20 canvas-wrapper pointer-events-none">
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
              <fog attach="fog" args={["#ffffff", 5, 12]} />
              <Suspense fallback={<SceneLoader />}>
                <DeskScene scrollProgressRef={scrollProgressRef} />
              </Suspense>
            </Canvas>
          </div>

          {/* ── Scroll Hint ─────────────────────────────────────────────── */}
          <ScrollHint visible={hintVisible} />
        </div>
      </div>
    </div>
  );
}
