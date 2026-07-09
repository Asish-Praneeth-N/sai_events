"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFollowCursor } from "@/hooks/useFollowCursor";

export default function CustomCursor() {
  const [mounted, setMounted] = React.useState(false);
  const { mousePosition, isHovered, isClicked } = useFollowCursor();

  // Disable custom cursor on touch devices for accessibility
  React.useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(pointer: coarse)").matches) {
      document.body.style.cursor = "auto";
    } else {
      document.body.style.cursor = "none";
    }
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  if (!mounted || window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Outer follow circle with spring effect */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#D4AF37] pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden sm:block"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isClicked ? 0.6 : isHovered ? 1.5 : 1,
          backgroundColor: isHovered ? "rgba(212, 175, 55, 0.15)" : "rgba(0, 0, 0, 0)",
          borderColor: isHovered ? "#ffffff" : "#D4AF37",
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          mass: 0.6,
        }}
      />
      {/* Inner solid golden dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#D4AF37] rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 hidden sm:block"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isClicked ? 0.8 : isHovered ? 0.3 : 1,
        }}
        transition={{
          type: "spring",
          damping: 35,
          stiffness: 350,
          mass: 0.15,
        }}
      />
    </>
  );
}
