# Creative Portfolio Design Blueprint & Technical Specification

## 1. Vision & Core Philosophy
The objective is to build a highly immersive, interactive, premium creative portfolio website. This site is not a digital resume; it is treated as a high-end digital R&D exhibition gallery. It focuses entirely on showcasing engineering mastery (Hardware and Software projects) through innovative motion, layout, and strict architectural minimalism.

*   **Aesthetic Style:** "Immersive Minimalist" / High-Contrast Light Look.
*   **Core Principle:** No clichéd "hacker/tech" aesthetics (no terminal text grids, matrix lines, or neon green code streams). The environment must feel like a sunlit, pure white modern design museum—relying on flawless proportions, typography, scale shifts, and diffuse shadows for depth.

---

## 2. Visual Identity & UI Style Guide
*   **Palette:**
    *   Primary Background: Pure Stark White (`#FFFFFF`)
    *   Primary Text / Accents: Deep Ink Black (`#000000`)
    *   Dividers & Structural Borders: Ultra-thin, light gray (`#E5E5E5` or `#F3F4F6`)
*   **Typography:**
    *   Headers / Titles: Oversized, sharp, elegant sans-serif (e.g., *Neue Montreal*, *PP Mori*, or *Inter* bold).
    *   Secondary Data / Systems Text: Clean, small, crisp monospaced fonts for technical metadata.
*   **Depth Mechanics:** No heavy background colors. Depth and spatial hierarchy are created entirely via ultra-soft, highly diffuse CSS/3D shadows cast onto the pure white canvas.

---

## 3. The Core Stack
To achieve pixel-perfect control over complex WebGL rendering, 3D camera tracks, and scroll synchronization without performance degradation, the following architecture must be used:

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **3D Render Engine:** Three.js via React Three Fiber (R3F) & @react-three/drei
*   **Animation & Scroll Mapping:** GSAP (GreenSock Animation Platform) + ScrollTrigger
*   **Smooth Scroll Override:** Lenis Scroll (for weighted, buttery, cross-browser scroll pacing)

---

## 4. User Journey & Choreography (Step-by-Step)

### Phase 1: The Opening Act (The Hero Canvas)
*   **Initial View:** The user lands on a pure white screen featuring an embedded interactive WebGL canvas. A minimalist, matte-white 3D model of a creator is sitting at a clean desk, using a laptop, facing completely away from the camera (viewed from a medium-wide cinematic angle). 
*   **Lighting:** Strong virtual backlighting creates a dramatic silhouette effect against the white space. The only detailed illumination comes from the subtle glow of the laptop screen.
*   **The Transition:** The screen layout is physically pinned by GSAP ScrollTrigger. As the user scrolls down, the physical page does not move; instead, the input drives the 3D camera forward in an elastic, smooth dolly-in directly toward the laptop screen.
*   **The Landing:** At 100% scroll progress of this section, the camera punches straight up to the laptop screen, which perfectly scales up to completely fill the browser viewport.

### Phase 2: The Bridge (The Introduction)
*   **Layout:** The 3D world fades out dynamically as the borders of the laptop screen expand. The viewport locks briefly to reveal a highly minimalist, elegant typography section.
*   **Content:** Exactly two sentences introducing the creative engineering philosophy. No resume statistics.
*   **The Exit:** On the next scroll input, the text elements smoothly scale and fade down, and the camera punches *through* the screen into the infinite canvas.

### Phase 3: The Canvas (Z-Axis Zoom / Project Tunnel)
*   **The Movement:** The standard vertical scroll mechanism is overridden. Scrolling acts as an accelerator moving the viewport forward along the Z-axis through an infinite, pure white architectural void. 
*   **The Content (Hardware & Software Projects Only):** Projects emerge smoothly from the distant white mist, staging alternatingly on the left and right sides of the screen.
    *   *Project 01 (Hardware/Robotics):* Appears on the right. A gorgeously lit, matte-white 3D model of a self-balancing robot floats in mid-air, actively balancing itself using live browser physics/code loops. As the user gets close, moving the mouse smoothly tilts the camera angle around the robot to inspect the hardware geometry.
    *   *Project 02 (Software/AI Architecture):* Emerges as sharp text, morphing cleanly into an elegant, floating floating layout frame. It zooms past the viewer's left side and off-screen.
    
*   **The Mechanics (Lock & Inspect):** When a project panel reaches the screen center foreground, the forward velocity of the scroll dampens/locks into a sweet spot. The user can hover to engage micro-interactions or trigger deep-dive components. A strong intentional scroll unlocks the camera, causing the project to scale up and rush past the viewer to reveal the next.

### Phase 4: The Arrival (Horizon Drop Finale)
*   **The Transition:** After the final project panel flies past the camera, the user is momentarily in a blank white void. Instantly, a razor-thin, horizontal ink-black line cuts across the exact center of the screen (the horizon). The page stops moving forward.
*   **The Interaction (Architectural Fold):** Driven by ScrollTrigger, the top half of the white page tilts backward like a heavy gallery wall, while the bottom half folds forward toward the user. 
*   **The Contact Section:** This folding movement uncovers the final contact/social grid layout. Social headers (`LINKEDIN`, `EMAIL`, `GITHUB`) are styled in massive, stark typography.
*   **Hover State:** Hovering over any link triggers a solid black block to smoothly slide out from behind the text, with the text color sharply inverting from black to pure white. A clean button at the bottom reads `REPLAY JOURNEY`, which when clicked smoothly rewinds the entire GSAP timeline back to the initial desk scene.

---

## 5. Instructions for AI Implementation Agents
1.  Prioritize smooth performance by optimizing 3D mesh files (`.gltf`/`.glb`) with low-polygon counts and untextured matte materials.
2.  Ensure strict implementation of Lenis Scroll to guarantee that the GSAP ScrollTrigger timelines governing the camera tracking match the user's scroll velocity fluidly.
3.  Use CSS grid/flexbox logic inside React Three Fiber HTML portals if mapping Next.js text structures onto 3D objects.
4.  Do not include standard boilerplate resume designs or layouts. Maintain the high-end editorial feel consistently across every component.