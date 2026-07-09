"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicDoorsProps {
  onComplete: () => void;
  onOpening:  () => void;
}

type Phase = "closed" | "untying" | "falling" | "opening" | "done";

// Cinematic ease — slow dramatic start, powerful sweep, gentle land
const DOOR_EASE: [number, number, number, number] = [0.86, 0, 0.07, 1];

// Detect if we're on a low-power device (mobile/tablet)
// Uses navigator.hardwareConcurrency as a proxy for device capability
function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
}

export default function CinematicDoors({ onComplete, onOpening }: CinematicDoorsProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const mobile = useRef(false);

  useEffect(() => {
    mobile.current = isMobile();
    document.body.style.overflow = "hidden";

    // Mobile: faster sequence so animation stays snappy on lower-end GPUs
    // Desktop: full cinematic timing
    const m = mobile.current;

    //  t1 — bow unties
    //  t2 — ribbons fall
    //  t3 — doors slide open + zoom begins
    //  t4 — complete (unmount)
    const t1 = setTimeout(() => setPhase("untying"), m ? 1600 : 2200);
    const t2 = setTimeout(() => setPhase("falling"),  m ? 2200 : 2900);
    const t3 = setTimeout(() => { setPhase("opening"); onOpening(); }, m ? 2700 : 3500);
    const t4 = setTimeout(() => { setPhase("done");   onComplete(); }, m ? 4500 : 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.body.style.overflow = "";
    };
  }, [onComplete, onOpening]);

  if (phase === "done") return null;

  const ribbonBg   = "linear-gradient(to bottom, #6b0000 0%, #a00000 35%, #c20000 55%, #880000 75%, #4d0000 100%)";
  const ribbonBorder = "1.5px solid rgba(212,175,55,0.55)";
  const ribbonGone = phase === "falling" || phase === "opening";
  const bowGone    = phase !== "closed";
  const isOpening  = phase === "opening";
  const m = mobile.current;

  // Mobile door slide is faster to stay inside the GPU budget
  const doorDuration = m ? 1.4 : 2.0;
  // Ribbon fall is instant on mobile to free up GPU for door slide
  const ribbonDuration = m ? 0.35 : 0.6;

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden select-none"
      aria-hidden="true"
      // Force GPU compositing for the whole intro layer
      style={{ transform: "translateZ(0)" }}
    >
      {/* ══════════════════════════════════════════════════
          BRAND TEXT — shown only while closed
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === "closed" && (
          <motion.div
            key="brand"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] as const } }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{ paddingBottom: "30vh", willChange: "opacity, transform" }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div style={{ height: 1, width: "clamp(32px,6vw,72px)", background: "linear-gradient(to right,transparent,rgba(212,175,55,0.45))" }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,175,55,0.55)" }} />
              <div style={{ height: 1, width: "clamp(32px,6vw,72px)", background: "linear-gradient(to left,transparent,rgba(212,175,55,0.45))" }} />
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', serif)",
                fontSize: "clamp(2rem, 8vw, 6rem)",
                fontWeight: 300,
                letterSpacing: "clamp(0.18em, 1.2vw, 0.36em)",
                textTransform: "uppercase",
                background: "linear-gradient(180deg, #f5db91 0%, #D4AF37 38%, #96700a 72%, #C8A020 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
                textAlign: "center",
                margin: "0 0 0.6rem",
              }}
            >
              SAI&nbsp;EVENTS
            </h1>

            <div style={{ height: 1, width: "clamp(56px,9vw,120px)", background: "linear-gradient(to right,transparent,rgba(212,175,55,0.65),transparent)", marginBottom: "clamp(0.75rem,1.5vw,1.1rem)" }} />

            <p
              style={{
                fontFamily: "var(--font-sans, 'Poppins', sans-serif)",
                fontSize: "clamp(0.6rem, 1.2vw, 0.78rem)",
                fontWeight: 400,
                letterSpacing: "clamp(0.18em, 0.6vw, 0.3em)",
                textTransform: "uppercase",
                color: "rgba(242,228,195,0.6)",
                textAlign: "center",
              }}
            >
              Crafting Extraordinary Celebrations
            </p>

            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <div style={{ height: 1, width: "clamp(20px,3.5vw,44px)", background: "linear-gradient(to right,transparent,rgba(212,175,55,0.25))" }} />
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(212,175,55,0.3)" }} />
              <div style={{ height: 1, width: "clamp(20px,3.5vw,44px)", background: "linear-gradient(to left,transparent,rgba(212,175,55,0.25))" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          LEFT DOOR — slides off to the left
          Pure translateX — GPU composite, zero repaint
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ x: 0 }}
        animate={isOpening ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: doorDuration, ease: DOOR_EASE }}
        className="absolute top-0 left-0 w-1/2 h-full z-10"
        style={{
          background: "var(--door-bg-left)",
          // On mobile skip the expensive multi-layer box-shadow
          boxShadow: m ? "none" : "inset -6px 0 40px rgba(0,0,0,0.85), 14px 0 60px rgba(0,0,0,0.95)",
          borderRight: "1px solid var(--door-border)",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Door frame — skip inner SVG on mobile to reduce paint complexity */}
        <div
          className="absolute inset-[5%] sm:inset-[6%]"
          style={{ border: "4px solid var(--door-frame-border)", boxShadow: m ? "none" : "inset 0 0 25px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.07)" }}
        >
          <div className="absolute inset-[8%]" style={{ border: "1px solid rgba(212,175,55,0.1)" }} />
          {!m && <DoorVines flip={false} />}
        </div>

        {/* Horizontal ribbon — left half */}
        <motion.div
          animate={ribbonGone ? { x: "-115%", opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: ribbonDuration, ease: [0.4, 0, 1, 1] as const }}
          className="absolute left-0 right-0 z-20"
          style={{ top: "calc(50% - 18px)", height: 36, background: ribbonBg, borderTop: ribbonBorder, borderBottom: ribbonBorder, willChange: "transform, opacity" }}
        />

        <DoorHandle side="right" />

        {/* Edge depth gradient */}
        <div className="absolute top-0 right-0 w-6 h-full pointer-events-none" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.85), transparent)" }} />
      </motion.div>

      {/* ══════════════════════════════════════════════════
          RIGHT DOOR — slides off to the right
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ x: 0 }}
        animate={isOpening ? { x: "100%" } : { x: 0 }}
        transition={{ duration: doorDuration, ease: DOOR_EASE }}
        className="absolute top-0 right-0 w-1/2 h-full z-10"
        style={{
          background: "var(--door-bg-right)",
          boxShadow: m ? "none" : "inset 6px 0 40px rgba(0,0,0,0.85), -14px 0 60px rgba(0,0,0,0.95)",
          borderLeft: "1px solid var(--door-border)",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className="absolute inset-[5%] sm:inset-[6%]"
          style={{ border: "4px solid var(--door-frame-border)", boxShadow: m ? "none" : "inset 0 0 25px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.07)" }}
        >
          <div className="absolute inset-[8%]" style={{ border: "1px solid rgba(212,175,55,0.1)" }} />
          {!m && <DoorVines flip />}
        </div>

        {/* Horizontal ribbon — right half */}
        <motion.div
          animate={ribbonGone ? { x: "115%", opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: ribbonDuration, ease: [0.4, 0, 1, 1] as const }}
          className="absolute left-0 right-0 z-20"
          style={{ top: "calc(50% - 18px)", height: 36, background: ribbonBg, borderTop: ribbonBorder, borderBottom: ribbonBorder, willChange: "transform, opacity" }}
        />

        <DoorHandle side="left" />

        <div className="absolute top-0 left-0 w-6 h-full pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85), transparent)" }} />
      </motion.div>

      {/* ══════════════════════════════════════════════════
          VERTICAL RIBBONS
      ══════════════════════════════════════════════════ */}
      {(["top", "bottom"] as const).map((half) => (
        <motion.div
          key={half}
          animate={
            ribbonGone
              ? { y: half === "top" ? "-115%" : "115%", opacity: 0 }
              : { y: 0, opacity: 1 }
          }
          transition={{ duration: ribbonDuration, ease: [0.4, 0, 1, 1] as const }}
          className={`absolute ${half === "top" ? "top-0 bottom-1/2" : "top-1/2 bottom-0"} left-1/2 -translate-x-1/2 z-20`}
          style={{
            width: "clamp(24px,3.5vw,40px)",
            background: "linear-gradient(to right,#5a0000 0%,#9a0000 35%,#c20000 55%,#850000 75%,#4a0000 100%)",
            borderLeft: ribbonBorder,
            borderRight: ribbonBorder,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ══════════════════════════════════════════════════
          GOLD BOW
      ══════════════════════════════════════════════════ */}
      <GoldBow gone={bowGone} mobile={m} />

      {/* ══════════════════════════════════════════════════
          CENTRE SEAM — fades out as doors open
      ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        animate={isOpening ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ width: 2, background: "var(--seam-bg)" }}
      />
    </div>
  );
}

/* ─── Door Vine Engravings (desktop only) ──────────────────────────────────── */
function DoorVines({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 160 320"
      className="absolute inset-0 w-full h-full opacity-60"
      fill="none"
      stroke="rgba(212,175,55,0.14)"
      strokeWidth="1"
      style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
    >
      <path d="M 18 16 C 55 16, 72 48, 44 76 C 20 100, 26 130, 56 122 C 86 114, 72 72, 46 62" strokeWidth="1.2" />
      <path d="M 44 76 C 72 90, 86 118, 58 142 C 30 162, 40 190, 72 180 C 104 170, 90 140, 62 130" strokeWidth="0.85" />
      <path d="M 18 304 C 55 304, 72 272, 44 244 C 20 220, 26 190, 56 198 C 86 206, 72 248, 46 258" strokeWidth="1.2" />
      <circle cx="80" cy="160" r="5" fill="rgba(212,175,55,0.1)" stroke="rgba(212,175,55,0.18)" strokeWidth="0.9" />
      <circle cx="80" cy="160" r="13" fill="none" stroke="rgba(212,175,55,0.05)" strokeWidth="0.7" />
    </svg>
  );
}

/* ─── Door Handle ──────────────────────────────────────────────────────────── */
function DoorHandle({ side }: { side: "left" | "right" }) {
  const isRight = side === "right";
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 z-30"
      style={{
        [isRight ? "right" : "left"]: "clamp(10px, 2.5vw, 22px)",
        width: "clamp(7px,1vw,11px)",
        height: "clamp(80px,12vw,120px)",
        borderRadius: 6,
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: isRight
            ? "var(--door-handle-bg-right)"
            : "var(--door-handle-bg-left)",
        }}
      />
    </div>
  );
}

/* ─── Ceremonial Gold Bow ──────────────────────────────────────────────────── */
function GoldBow({ gone, mobile }: { gone: boolean; mobile: boolean }) {
  const bowSize = "clamp(80px, 12vw, 150px)";

  // On mobile: single unified opacity/scale animation instead of 5 separate path animations
  // This dramatically reduces the number of compositor layers and GPU work
  if (mobile) {
    return (
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        style={{
          top: "calc(50% - clamp(60px,8vw,90px))",
          width: bowSize,
          height: bowSize,
        }}
        animate={gone ? { opacity: 0, scale: 0.7, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 1, 1] as const }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="bowGm" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#6b4e00" />
              <stop offset="50%"  stopColor="#E8C84A" />
              <stop offset="100%" stopColor="#8a6800" />
            </linearGradient>
          </defs>
          {/* Simplified bow — single path group, no drop-shadow filter */}
          <path d="M 92 108 C 76 134, 48 170, 58 196 C 63 201,74 196,74 185 C 74 160,100 122,107 110 Z" fill="url(#bowGm)" />
          <path d="M 108 108 C 124 134,152 170,142 196 C 137 201,126 196,126 185 C 126 160,100 122,93 110 Z" fill="url(#bowGm)" />
          <path d="M 97 99 C 58 110,16 78,42 42 C 68 6,89 68,97 95 Z" fill="url(#bowGm)" />
          <path d="M 103 99 C 142 110,184 78,158 42 C 132 6,111 68,103 95 Z" fill="url(#bowGm)" />
          <ellipse cx="100" cy="100" rx="18" ry="13" fill="url(#bowGm)" />
        </svg>
      </motion.div>
    );
  }

  // Desktop: full per-path animations with drop-shadow
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-40 pointer-events-none"
      style={{
        top: "calc(50% - clamp(70px,8vw,96px))",
        width: bowSize,
        height: bowSize,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.9))" }}
      >
        <defs>
          <linearGradient id="bowG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6b4e00" />
            <stop offset="22%"  stopColor="#B8930A" />
            <stop offset="50%"  stopColor="#E8C84A" />
            <stop offset="78%"  stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8a6800" />
          </linearGradient>
        </defs>

        <motion.path
          d="M 92 108 C 76 134, 48 170, 58 196 C 63 201,74 196,74 185 C 74 160,100 122,107 110 Z"
          fill="url(#bowG)"
          animate={gone ? { y: 220, opacity: 0, rotate: -28, scale: 0.7 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 1, 1] as const }}
        />
        <motion.path
          d="M 108 108 C 124 134,152 170,142 196 C 137 201,126 196,126 185 C 126 160,100 122,93 110 Z"
          fill="url(#bowG)"
          animate={gone ? { y: 220, opacity: 0, rotate: 28, scale: 0.7 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 1, 1] as const }}
        />
        <motion.path
          d="M 97 99 C 58 110,16 78,42 42 C 68 6,89 68,97 95 Z"
          fill="url(#bowG)" stroke="#8a6500" strokeWidth="0.6"
          animate={gone ? { scale: 0, rotate: -68, opacity: 0, x: -32, y: 8 } : { scale: 1, rotate: 0, opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.6, 0] as const }}
          style={{ transformOrigin: "97px 95px" }}
        />
        <motion.path
          d="M 103 99 C 142 110,184 78,158 42 C 132 6,111 68,103 95 Z"
          fill="url(#bowG)" stroke="#8a6500" strokeWidth="0.6"
          animate={gone ? { scale: 0, rotate: 68, opacity: 0, x: 32, y: 8 } : { scale: 1, rotate: 0, opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.6, 0] as const }}
          style={{ transformOrigin: "103px 95px" }}
        />
        <motion.ellipse
          cx="100" cy="100" rx="18" ry="13"
          fill="url(#bowG)" stroke="#6b4e00" strokeWidth="0.8"
          animate={gone ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 1, 1] as const }}
        />
      </svg>
    </div>
  );
}
