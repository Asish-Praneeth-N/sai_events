"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  // Position tracking (avoiding state)
  const mouseCoords = useRef({ x: 0, y: 0 });
  const ringCoords = useRef({ x: 0, y: 0 });
  const dotCoords = useRef({ x: 0, y: 0 });

  // State tracking for transitions
  const cursorState = useRef({
    isHovered: false,
    isClicked: false,
    currentScale: 1.0,
    currentDotScale: 1.0,
  });

  useEffect(() => {
    setMounted(true);

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isCoarse || prefersReducedMotion) {
      document.body.style.cursor = "auto";
      return;
    }

    // Hide native cursor
    document.body.style.cursor = "none";

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest(
          "button, a, input, textarea, select, [role='button'], .cursor-pointer"
        );
        cursorState.current.isHovered = isInteractive;
      }
    };

    const handleMouseDown = () => {
      cursorState.current.isClicked = true;
    };

    const handleMouseUp = () => {
      cursorState.current.isClicked = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    let animationFrameId: number;

    const render = () => {
      const targetX = mouseCoords.current.x;
      const targetY = mouseCoords.current.y;

      // 95-98% responsiveness: high lerp values for near-native trace
      // Outer ring: fast lerp (0.28)
      ringCoords.current.x += (targetX - ringCoords.current.x) * 0.28;
      ringCoords.current.y += (targetY - ringCoords.current.y) * 0.28;

      // Inner dot: extremely fast lerp (0.8) for precise, delay-free feeling
      dotCoords.current.x += (targetX - dotCoords.current.x) * 0.8;
      dotCoords.current.y += (targetY - dotCoords.current.y) * 0.8;

      // Scaling calculations
      let targetScale = 1.0;
      let targetDotScale = 1.0;

      if (cursorState.current.isHovered) {
        targetScale = 1.15;
        targetDotScale = 0.5;
      } else if (cursorState.current.isClicked) {
        targetScale = 0.9;
        targetDotScale = 0.8;
      }

      // Smooth transition for scale (around 120-180ms)
      cursorState.current.currentScale += (targetScale - cursorState.current.currentScale) * 0.25;
      cursorState.current.currentDotScale += (targetDotScale - cursorState.current.currentDotScale) * 0.25;

      // Apply GPU-accelerated transforms
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringCoords.current.x}px, ${ringCoords.current.y}px, 0) scale(${cursorState.current.currentScale})`;
        // Soft gold glow on hover
        ringRef.current.style.boxShadow = cursorState.current.isHovered 
          ? "0 0 10px var(--accent-gold)" 
          : "none";
        // Subtle color change on hover
        ringRef.current.style.backgroundColor = cursorState.current.isHovered
          ? "rgba(200, 162, 77, 0.08)"
          : "rgba(0, 0, 0, 0)";
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotCoords.current.x}px, ${dotCoords.current.y}px, 0) scale(${cursorState.current.currentDotScale})`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const isCoarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!mounted || isCoarse || prefersReduced) {
    return null;
  }

  return (
    <>
      {/* Outer follow circle */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-accent-gold pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden sm:block"
        style={{
          willChange: "transform",
        }}
      />
      {/* Inner solid gold dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-accent-gold rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 hidden sm:block"
        style={{
          willChange: "transform",
        }}
      />
    </>
  );
}
