"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { CINEMATIC_EASE } from "@/lib/motionVariants";

export default function Hero() {
  const [currentBg, setCurrentBg] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // ─── Background Slideshow ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % LANDING_PAGE_CONFIG.hero.backgroundImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const titleWords = LANDING_PAGE_CONFIG.hero.title.split(" ");

  // Simplified and fast reveal animations (no heavy blur filter)
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const wordReveal = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: CINEMATIC_EASE },
    },
  };

  const lineReveal = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.6, ease: "easeOut" },
    },
  };

  const ctaReveal = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-[#090909]"
    >
      {/* ── Layer 1: Background Images (Fades only - GPU opacity only) ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "opacity" }}
          >
            <img
              src={LANDING_PAGE_CONFIG.hero.backgroundImages[currentBg]}
              alt="Sai Events Background"
              className="w-full h-full object-cover"
            />
            {/* Dark wash for high text readability */}
            <div className="absolute inset-0 bg-black/55" />
          </motion.div>
        </AnimatePresence>
        
        {/* Ambient lighting gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* ── Layer 2: Main Hero Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center select-none pt-24 pb-16">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-[#F7F3EC] tracking-[0.25em]">
            Luxury Events Ecosystem
          </span>
        </motion.div>

        {/* Heading: Word-by-word reveal */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.1] mb-6 max-w-4xl text-center select-none"
        >
          <span className="flex flex-wrap justify-center gap-x-[0.22em]">
            {titleWords.map((word, idx) => (
              <span key={idx} className="overflow-hidden inline-block pb-1">
                <motion.span
                  variants={wordReveal}
                  className={`inline-block ${
                    idx >= titleWords.length - 2
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f5db91] font-black"
                      : "font-light"
                  }`}
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={lineReveal}
          initial="hidden"
          animate="visible"
          className="text-sm sm:text-base md:text-lg text-[#F7F3EC]/65 max-w-2xl font-light mb-10 leading-relaxed"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {LANDING_PAGE_CONFIG.hero.subheading}
        </motion.p>

        {/* CTA Buttons - Premium design */}
        <motion.div
          variants={ctaReveal}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto"
        >
          <a
            href="#finale"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#D4AF37]/15 text-center flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
          >
            <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            Book Your Event
          </a>

          <a
            href="#finale"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl border border-white/15 hover:border-white/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-2 group cursor-pointer"
          >
            Become a Vendor
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>

      {/* Decorative divider */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#090909] to-transparent pointer-events-none" />
    </div>
  );
}
