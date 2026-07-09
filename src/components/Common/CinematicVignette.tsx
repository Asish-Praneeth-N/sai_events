"use client";

import React from "react";
import { motion, useTransform, useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";

interface CinematicVignetteProps {
  /** The global smoothed scroll spring (0 → 1) */
  scrollProgress: MotionValue<number>;
  /** Total number of sections */
  totalSections?: number;
}

/**
 * CinematicVignette
 *
 * Creates the "doorway threshold" effect between sections.
 * 
 * As the camera approaches the boundary between two sections:
 * 1. A radial vignette squeezes inward from the edges
 * 2. Briefly the edges go near-black (you're in the doorframe)
 * 3. The vignette opens — you've entered the new room
 *
 * Implemented purely with opacity + CSS radial-gradient.
 * Zero layout properties. 100% GPU.
 */
export default function CinematicVignette({
  scrollProgress,
  totalSections = 7,
}: CinematicVignetteProps) {
  const shouldReduceMotion = useReducedMotion();
  const H = 1 / (totalSections - 1);

  // Build transition points: at each section boundary (H, 2H, 3H...) the vignette peaks
  // Pattern: 0 → fade in as camera approaches boundary → peak at boundary → fade out as room opens
  const inputRange: number[] = [0];
  const outputRange: number[] = [0];

  for (let i = 1; i < totalSections - 1; i++) {
    const boundary = i * H;
    // Before boundary: clear
    inputRange.push(boundary - 0.45 * H);
    outputRange.push(0);
    // At boundary peak: vignette full
    inputRange.push(boundary);
    outputRange.push(0.88);
    // After boundary: clear again
    inputRange.push(boundary + 0.45 * H);
    outputRange.push(0);
  }
  // End
  inputRange.push(1);
  outputRange.push(0);

  // Vignette overlay opacity
  const vignetteOpacity = useTransform(scrollProgress, inputRange, outputRange);

  // Scale the inner transparent circle — squeezes as you approach the door
  const inputRangeScale: number[] = [0];
  const outputRangeScale: number[] = [1.6];

  for (let i = 1; i < totalSections - 1; i++) {
    const boundary = i * H;
    inputRangeScale.push(boundary - 0.45 * H);
    outputRangeScale.push(1.6);
    inputRangeScale.push(boundary);
    outputRangeScale.push(0.65);
    inputRangeScale.push(boundary + 0.45 * H);
    outputRangeScale.push(1.6);
  }
  inputRangeScale.push(1);
  outputRangeScale.push(1.6);

  const innerScale = useTransform(scrollProgress, inputRangeScale, outputRangeScale);

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      style={{ opacity: vignetteOpacity }}
      className="fixed inset-0 z-25 pointer-events-none"
      aria-hidden="true"
    >
      {/* 
        Radial gradient vignette:
        Center is transparent (you can see through the door)
        Edges are near-black (the doorframe)
      */}
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 20%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.92) 80%, rgb(0,0,0) 100%)`,
          transform: `scale(${1})`,
        }}
        className="w-full h-full"
      />
    </motion.div>
  );
}
