"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";

// ─── Ticker Counter ──────────────────────────────────────────────────────────
interface CounterProps {
  value: number;
  isActive: boolean;
}

function CinematicCounter({ value, isActive }: CounterProps) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isActive || hasRun.current) return;
    hasRun.current = true;

    if (shouldReduceMotion) {
      setCount(value);
      return;
    }

    const duration = 2000; // 2s ticker duration
    let startTs: number | null = null;

    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      // Decelerating ticker loop
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isActive, value, shouldReduceMotion]);

  return <span>{count}</span>;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Stats() {
  const shouldReduceMotion = useReducedMotion();
  const [sectionActive, setSectionActive] = useState(false);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="w-full bg-background py-24 sm:py-32 relative overflow-hidden select-none border-t border-border">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4060C0]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-[#D4AF37]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            By The Numbers
          </span>
          <h2
            className="text-3xl sm:text-5xl font-light text-foreground tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Our Legacy In Metrics
          </h2>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Stat Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          onViewportEnter={() => setSectionActive(true)}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center w-full"
        >
          {LANDING_PAGE_CONFIG.stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statCardVariants}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      y: -5,
                      borderColor: "rgba(212,175,55,0.25)",
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    }
              }
              className="flex flex-col items-center p-8 rounded-2xl bg-card-bg border border-card-border transition-colors duration-300 shadow-lg"
            >
              {/* Stat number ticker */}
              <h3 
                className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f7df9c] tracking-tight mb-2.5" 
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                <CinematicCounter value={stat.value} isActive={sectionActive} />
                {stat.suffix}
              </h3>

              {/* Gold divider line */}
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-4" />

              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.22em] font-semibold leading-relaxed">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
