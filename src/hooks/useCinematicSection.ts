"use client";

import { useTransform, useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";

interface CinematicSectionResult {
  /** Normalized 0→1 progress within this section's scroll range */
  activeProgress: MotionValue<number>;
  /** Background layer Y offset (40% parallax speed) */
  bgY: MotionValue<number>;
  /** Midground layer Y offset (70% parallax speed) */
  mgY: MotionValue<number>;
  /** Foreground layer Y offset (100% parallax speed) */
  fgY: MotionValue<number>;
  /** Inverse foreground: elements rise INTO view as section enters */
  fgEntryY: MotionValue<number>;
}

/**
 * useCinematicSection
 *
 * Returns per-section progress and 3-layer parallax offsets.
 * All values are GPU-safe MotionValues (transform only).
 *
 * @param scrollProgress  The global smoothed scroll spring (0 → 1)
 * @param sectionIndex    0-based index of this section
 * @param totalSections   Total number of sections (default 7)
 */
export function useCinematicSection(
  scrollProgress: MotionValue<number>,
  sectionIndex: number,
  totalSections: number = 11
): CinematicSectionResult {
  const shouldReduceMotion = useReducedMotion();
  const H = 1 / (totalSections - 1); // normalized step size

  const start = sectionIndex * H;
  const end = (sectionIndex + 1) * H;

  // Clamp helper
  const clamp0 = Math.max(0, start);
  const clamp1 = Math.min(1, end);

  // Normalized 0→1 progress within this section only
  const activeProgress = useTransform(scrollProgress, [clamp0, clamp1], [0, 1]);

  // ─── 3-Layer Parallax Y Offsets ──────────────────────────────────────────
  // As the section's active progress goes 0 → 1 (camera walks through it),
  // each layer moves up at a different rate creating depth illusion.

  const NONE = 0;

  // Background: drifts subtly
  const bgY = useTransform(
    activeProgress,
    [0, 1],
    shouldReduceMotion ? [NONE, NONE] : [5, -5]
  );

  // Midground: medium drift
  const mgY = useTransform(
    activeProgress,
    [0, 1],
    shouldReduceMotion ? [NONE, NONE] : [10, -10]
  );

  // Foreground: full movement
  const fgY = useTransform(
    activeProgress,
    [0, 1],
    shouldReduceMotion ? [NONE, NONE] : [15, -15]
  );

  // Entry foreground: elements rise up as section comes into view
  const fgEntryY = useTransform(
    activeProgress,
    [0, 0.35, 1],
    shouldReduceMotion ? [NONE, NONE, NONE] : [10, 0, -15]
  );

  return { activeProgress, bgY, mgY, fgY, fgEntryY };
}
