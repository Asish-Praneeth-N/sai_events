"use client";

import React from "react";
import { motion, useTransform, useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";

interface LuxuryProgressBarProps {
  scrollProgress: MotionValue<number>;
}

/**
 * LuxuryProgressBar
 *
 * A razor-thin gold progress bar fixed at the very top of the viewport.
 * It has a glowing "leading edge" — a small luminous droplet of gold
 * that travels along the bar as the visitor walks through the experience.
 *
 * Implementation:
 * - Uses scaleX transform on the bar (GPU only, no width animation)
 * - Origin is left edge so it grows rightward
 * - The glow dot is positioned using left% transform
 */
export default function LuxuryProgressBar({ scrollProgress }: LuxuryProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();

  // Scale from 0 → 1 on X axis (transforms, not width — GPU safe)
  const scaleX = useTransform(scrollProgress, [0, 1], [0, 1]);

  // Glow dot position: 0% → 100% left
  const glowLeft = useTransform(scrollProgress, [0, 1], ["0%", "100%"]);

  if (shouldReduceMotion) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] pointer-events-none"
      aria-hidden="true"
    >
      {/* Track line — barely visible */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5" />

      {/* Active gold bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left center" }}
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#B8930A] via-[#D4AF37] to-[#f5db91] origin-left"
      />

      {/* Glowing leading edge droplet */}
      <motion.div
        style={{ left: glowLeft }}
        className="absolute top-0 -translate-x-1/2 -translate-y-[1px]"
      >
        {/* Core dot */}
        <div className="w-1 h-1 rounded-full bg-[#f5db91]" />
        {/* Glow halo */}
        <div className="absolute inset-0 w-3 h-3 -translate-x-1 -translate-y-1 rounded-full bg-[#D4AF37]/30 blur-sm" />
      </motion.div>
    </div>
  );
}
