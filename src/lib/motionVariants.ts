/**
 * Cinematic Motion Variants
 * 
 * All easing curves are designed for luxury, weight, and cinematic feel.
 * No bounce. No elastic. No playful motion.
 * 
 * Rule: Expensive things move slowly and deliberately.
 */

import type { Variants } from "framer-motion";

// ─── Easing Curves ─────────────────────────────────────────────────────────
// Custom cinematic easing — fast initial movement, luxurious deceleration
export const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Elegant deceleration — for secondary elements
export const LUXE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Cinematic enter — like a cut from darkness into light
export const DRAMATIC_EASE: [number, number, number, number] = [0.0, 0.0, 0.2, 1];

// ─── Typography Variants ───────────────────────────────────────────────────
// Word-by-word reveal for headings
export const wordRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: CINEMATIC_EASE,
    },
  },
};

// Container stagger for word reveals
export const wordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

// Line-by-line reveal for paragraphs
export const lineRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: LUXE_EASE,
    },
  },
};

// ─── Element Reveal Variants ───────────────────────────────────────────────
// Card coming into focus from distance
export const cardRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    filter: "blur(16px)",
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 1.0,
      ease: CINEMATIC_EASE,
    },
  },
};

// Image sharpening into focus
export const imageRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.08,
    filter: "blur(12px) brightness(0.7)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: {
      duration: 1.3,
      ease: CINEMATIC_EASE,
    },
  },
};

// Badge/label reveal
export const labelRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    letterSpacing: "0.05em",
    y: 10,
  },
  visible: {
    opacity: 0.65,
    letterSpacing: "0.28em",
    y: 0,
    transition: {
      duration: 1.1,
      ease: LUXE_EASE,
    },
  },
};

// Button reveal — always last
export const buttonRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: CINEMATIC_EASE,
    },
  },
};

// Container with sequential children reveal
export const sequentialRevealVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.05,
    },
  },
};

// Fast stagger for grids
export const gridRevealVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ─── Room Mood Colors ──────────────────────────────────────────────────────
// Each section has its own ambient lighting color
export const ROOM_MOODS = {
  hero: {
    primary: "rgba(212, 175, 55, 0.08)",    // warm gold — entrance
    secondary: "rgba(255, 200, 100, 0.04)",
  },
  services: {
    primary: "rgba(160, 90, 40, 0.07)",     // warm burgundy — intimacy
    secondary: "rgba(212, 175, 55, 0.04)",
  },
  stats: {
    primary: "rgba(100, 130, 200, 0.06)",   // cool blue-silver — confidence
    secondary: "rgba(150, 180, 255, 0.03)",
  },
  gallery: {
    primary: "rgba(212, 175, 55, 0.07)",    // golden — memories
    secondary: "rgba(255, 220, 120, 0.04)",
  },
  about: {
    primary: "rgba(100, 60, 180, 0.07)",    // deep purple — history
    secondary: "rgba(80, 40, 160, 0.04)",
  },
  testimonials: {
    primary: "rgba(240, 230, 210, 0.05)",   // ivory — trust
    secondary: "rgba(212, 175, 55, 0.03)",
  },
  contact: {
    primary: "rgba(40, 120, 120, 0.06)",    // deep teal — action
    secondary: "rgba(60, 160, 160, 0.03)",
  },
} as const;
