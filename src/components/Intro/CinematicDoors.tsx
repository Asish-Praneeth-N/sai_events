"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicDoorsProps {
  onComplete: () => void;
  onOpening:  () => void;
}

type Phase = "closed" | "untying" | "falling" | "opening" | "done";

// Cinematic ease — slow dramatic start, powerful sweep, gentle land
const DOOR_EASE: [number, number, number, number] = [0.86, 0, 0.07, 1];

export default function CinematicDoors({ onComplete, onOpening }: CinematicDoorsProps) {
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    document.body.style.overflow = "hidden";

    //  t1  2 200 ms — bow unties
    //  t2  2 900 ms — ribbons fall
    //  t3  3 500 ms — doors swing open + zoom begins in page.tsx
    //  t4  5 800 ms — doors fully gone (3500 + 2000 door anim = 5500 + 300 buffer)
    const t1 = setTimeout(() => setPhase("untying"), 2200);
    const t2 = setTimeout(() => setPhase("falling"),  2900);
    const t3 = setTimeout(() => { setPhase("opening"); onOpening(); }, 3500);
    const t4 = setTimeout(() => { setPhase("done");   onComplete(); }, 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.body.style.overflow = "";
    };
  }, [onComplete, onOpening]);

  if (phase === "done") return null;

  const ribbonBg     = "linear-gradient(to bottom, #6b0000 0%, #a00000 35%, #c20000 55%, #880000 75%, #4d0000 100%)";
  const ribbonBorder = "1.5px solid rgba(212,175,55,0.55)";
  const ribbonGone   = phase === "falling" || phase === "opening";
  const bowGone      = phase !== "closed";
  const isOpening    = phase === "opening";

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden select-none"
      aria-hidden="true"
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
            exit={{ opacity: 0, y: -20, transition: { duration: 0.55, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{ paddingBottom: "30vh" }}
          >
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div style={{ height: 1, width: "clamp(32px,6vw,72px)", background: "linear-gradient(to right,transparent,rgba(212,175,55,0.45))" }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,175,55,0.55)" }} />
              <div style={{ height: 1, width: "clamp(32px,6vw,72px)", background: "linear-gradient(to left,transparent,rgba(212,175,55,0.45))" }} />
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', serif)",
                fontSize: "clamp(1.8rem, 6.5vw, 6rem)",
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
                fontSize: "clamp(0.55rem, 1.1vw, 0.78rem)",
                fontWeight: 400,
                letterSpacing: "clamp(0.2em, 0.6vw, 0.3em)",
                textTransform: "uppercase",
                color: "rgba(242,228,195,0.6)",
                textAlign: "center",
              }}
            >
              Crafting Extraordinary Celebrations
            </p>

            <div className="flex items-center gap-3 mt-5 sm:mt-6">
              <div style={{ height: 1, width: "clamp(20px,3.5vw,44px)", background: "linear-gradient(to right,transparent,rgba(212,175,55,0.25))" }} />
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(212,175,55,0.3)" }} />
              <div style={{ height: 1, width: "clamp(20px,3.5vw,44px)", background: "linear-gradient(to left,transparent,rgba(212,175,55,0.25))" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          LEFT DOOR — slides off to the left
          translateX is pure GPU composite, no repaint
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ x: 0 }}
        animate={isOpening ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 2.0, ease: DOOR_EASE }}
        className="absolute top-0 left-0 w-1/2 h-full z-10"
        style={{
          background: "linear-gradient(to right, #0b0705 0%, #191009 40%, #201209 70%, #160d07 100%)",
          boxShadow: "inset -6px 0 40px rgba(0,0,0,0.85), 14px 0 60px rgba(0,0,0,0.95)",
          borderRight: "1px solid #251508",
          willChange: "transform",
        }}
      >
        <div className="absolute inset-[5%] sm:inset-[6%]" style={{ border: "4px solid #0c0804", boxShadow: "inset 0 0 25px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.07)" }}>
          <div className="absolute inset-[8%]" style={{ border: "1px solid rgba(212,175,55,0.1)" }} />
          <DoorVines flip={false} />
        </div>

        {/* Horizontal ribbon — left half */}
        <motion.div
          animate={ribbonGone ? { x: "-115%", opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 1, 1] }}
          className="absolute left-0 right-0 z-20"
          style={{ top: "calc(50% - 18px)", height: 36, background: ribbonBg, borderTop: ribbonBorder, borderBottom: ribbonBorder, boxShadow: "0 4px 18px rgba(0,0,0,0.55)", willChange: "transform, opacity" }}
        />

        <DoorHandle side="right" />

        {/* Door edge shadow — right edge of left door */}
        <div className="absolute top-0 right-0 w-8 h-full pointer-events-none" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.9), transparent)" }} />
      </motion.div>

      {/* ══════════════════════════════════════════════════
          RIGHT DOOR — slides off to the right
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ x: 0 }}
        animate={isOpening ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 2.0, ease: DOOR_EASE }}
        className="absolute top-0 right-0 w-1/2 h-full z-10"
        style={{
          background: "linear-gradient(to left, #0b0705 0%, #191009 40%, #201209 70%, #160d07 100%)",
          boxShadow: "inset 6px 0 40px rgba(0,0,0,0.85), -14px 0 60px rgba(0,0,0,0.95)",
          borderLeft: "1px solid #251508",
          willChange: "transform",
        }}
      >
        <div className="absolute inset-[5%] sm:inset-[6%]" style={{ border: "4px solid #0c0804", boxShadow: "inset 0 0 25px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.07)" }}>
          <div className="absolute inset-[8%]" style={{ border: "1px solid rgba(212,175,55,0.1)" }} />
          <DoorVines flip />
        </div>

        {/* Horizontal ribbon — right half */}
        <motion.div
          animate={ribbonGone ? { x: "115%", opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 1, 1] }}
          className="absolute left-0 right-0 z-20"
          style={{ top: "calc(50% - 18px)", height: 36, background: ribbonBg, borderTop: ribbonBorder, borderBottom: ribbonBorder, boxShadow: "0 4px 18px rgba(0,0,0,0.55)", willChange: "transform, opacity" }}
        />

        <DoorHandle side="left" />

        {/* Door edge shadow — left edge of right door */}
        <div className="absolute top-0 left-0 w-8 h-full pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.9), transparent)" }} />
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
          transition={{ duration: 0.6, ease: [0.4, 0, 1, 1] }}
          className={`absolute ${half === "top" ? "top-0 bottom-1/2" : "top-1/2 bottom-0"} left-1/2 -translate-x-1/2 z-20`}
          style={{
            width: "clamp(28px,4vw,42px)",
            background: "linear-gradient(to right,#5a0000 0%,#9a0000 35%,#c20000 55%,#850000 75%,#4a0000 100%)",
            borderLeft: ribbonBorder,
            borderRight: ribbonBorder,
            boxShadow: "0 0 14px rgba(0,0,0,0.45)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ══════════════════════════════════════════════════
          GOLD BOW
      ══════════════════════════════════════════════════ */}
      <GoldBow gone={bowGone} />

      {/* ══════════════════════════════════════════════════
          CENTRE SEAM — fades out as doors open
      ══════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        animate={isOpening ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: 2, background: "linear-gradient(180deg,#030200,#090704,#030200)", boxShadow: "0 0 10px 3px rgba(0,0,0,0.98)" }}
      />
    </div>
  );
}

/* ─── Door Vine Engravings ─────────────────────────────────────────────────── */
function DoorVines({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 160 320"
      className="absolute inset-0 w-full h-full opacity-80"
      fill="none"
      stroke="rgba(212,175,55,0.16)"
      strokeWidth="1"
      style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
    >
      <path d="M 18 16 C 55 16, 72 48, 44 76 C 20 100, 26 130, 56 122 C 86 114, 72 72, 46 62" strokeWidth="1.2" />
      <path d="M 44 76 C 72 90, 86 118, 58 142 C 30 162, 40 190, 72 180 C 104 170, 90 140, 62 130" strokeWidth="0.85" />
      <path d="M 18 304 C 55 304, 72 272, 44 244 C 20 220, 26 190, 56 198 C 86 206, 72 248, 46 258" strokeWidth="1.2" />
      <circle cx="80" cy="160" r="5" fill="rgba(212,175,55,0.1)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.9" />
      <circle cx="80" cy="160" r="13" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.7" />
      <path d="M 80 62  Q 92 78, 80 94  Q 68 78, 80 62"  fill="rgba(212,175,55,0.05)" />
      <path d="M 80 226 Q 92 242,80 258 Q 68 242,80 226" fill="rgba(212,175,55,0.05)" />
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
        height: "clamp(90px,14vw,130px)",
        borderRadius: 6,
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: isRight
            ? "linear-gradient(to right,#6b4a00,#C8A020 28%,#F0D060 52%,#C8A020 74%,#6b4a00)"
            : "linear-gradient(to left, #6b4a00,#C8A020 28%,#F0D060 52%,#C8A020 74%,#6b4a00)",
          boxShadow: isRight
            ? "3px 0 8px rgba(0,0,0,0.75), inset -1px 0 2px rgba(255,240,160,0.18)"
            : "-3px 0 8px rgba(0,0,0,0.75), inset 1px 0 2px rgba(255,240,160,0.18)",
        }}
      />
      {[20, 80].map((pct) => (
        <div
          key={pct}
          style={{
            position: "absolute",
            [isRight ? "right" : "left"]: -3,
            top: `${pct}%`,
            width: 14,
            height: 5,
            background: "#7a5c00",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Ceremonial Gold Bow ──────────────────────────────────────────────────── */
function GoldBow({ gone }: { gone: boolean }) {
  const bowSize = "clamp(100px, 14vw, 160px)";
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
          transition={{ duration: 0.85, ease: [0.4, 0, 1, 1] }}
        />
        <motion.path
          d="M 108 108 C 124 134,152 170,142 196 C 137 201,126 196,126 185 C 126 160,100 122,93 110 Z"
          fill="url(#bowG)"
          animate={gone ? { y: 220, opacity: 0, rotate: 28, scale: 0.7 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 1, 1] }}
        />
        <motion.path
          d="M 97 99 C 58 110,16 78,42 42 C 68 6,89 68,97 95 Z"
          fill="url(#bowG)" stroke="#8a6500" strokeWidth="0.6"
          animate={gone ? { scale: 0, rotate: -68, opacity: 0, x: -32, y: 8 } : { scale: 1, rotate: 0, opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.6, 0] }}
          style={{ transformOrigin: "97px 95px" }}
        />
        <motion.path
          d="M 103 99 C 142 110,184 78,158 42 C 132 6,111 68,103 95 Z"
          fill="url(#bowG)" stroke="#8a6500" strokeWidth="0.6"
          animate={gone ? { scale: 0, rotate: 68, opacity: 0, x: 32, y: 8 } : { scale: 1, rotate: 0, opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.6, 0] }}
          style={{ transformOrigin: "103px 95px" }}
        />
        <motion.ellipse
          cx="100" cy="100" rx="18" ry="13"
          fill="url(#bowG)" stroke="#6b4e00" strokeWidth="0.8"
          animate={gone ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 1, 1] }}
        />
      </svg>
    </div>
  );
}
