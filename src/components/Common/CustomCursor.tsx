"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // MotionValues for mouse position - bypasses React render loops entirely
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for smooth cursor movement
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.6 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.6 });

  const innerX = useSpring(mouseX, { damping: 35, stiffness: 350, mass: 0.15 });
  const innerY = useSpring(mouseY, { damping: 35, stiffness: 350, mass: 0.15 });

  useEffect(() => {
    setMounted(true);
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) {
      document.body.style.cursor = "auto";
      return;
    }

    document.body.style.cursor = "none";

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check if mouse is hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest(
          "button, a, input, textarea, select, [role='button'], .cursor-pointer"
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseX, mouseY]);

  if (!mounted || (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)) {
    return null;
  }

  return (
    <>
      {/* Outer follow circle with spring effect */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#D4AF37] pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden sm:block"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isClicked ? 0.6 : isHovered ? 1.5 : 1,
          backgroundColor: isHovered ? "rgba(212, 175, 55, 0.15)" : "rgba(0, 0, 0, 0)",
          borderColor: isHovered ? "#ffffff" : "#D4AF37",
        }}
      />
      {/* Inner solid golden dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#D4AF37] rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 hidden sm:block"
        style={{
          x: innerX,
          y: innerY,
        }}
        animate={{
          scale: isClicked ? 0.8 : isHovered ? 0.3 : 1,
        }}
      />
    </>
  );
}
