"use client";

import { useEffect, useRef } from "react";

interface ScrollHintProps {
  /** Whether the hint should be visible */
  visible: boolean;
}

export default function ScrollHint({ visible }: ScrollHintProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (visible) {
      rootRef.current.classList.remove("hidden");
    } else {
      rootRef.current.classList.add("hidden");
    }
  }, [visible]);

  return (
    <div
      ref={rootRef}
      className="scroll-hint"
      aria-hidden="true"
      role="presentation"
    >
      <span className="scroll-hint__label">Scroll</span>
      <div className="scroll-hint__line" />
    </div>
  );
}
