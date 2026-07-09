"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Sparkles, Calendar } from "lucide-react";

export default function Hero() {
  const [currentBg, setCurrentBg] = useState(0);

  // Background slideshow rotation
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % LANDING_PAGE_CONFIG.hero.backgroundImages.length);
    }, 6000);
    return () => clearInterval(bgTimer);
  }, []);

  const titleWords = LANDING_PAGE_CONFIG.hero.title.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }, // premium easeOutQuart
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section id="home" className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Slideshow (Ken Burns Zoom) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 6.5, ease: "linear" },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={LANDING_PAGE_CONFIG.hero.backgroundImages[currentBg]}
              alt="Sai Events Cinematic Background"
              className="w-full h-full object-cover"
            />
            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-black/60 dark:bg-black/65" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center select-none pt-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Accent Badge */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-[#F7F3EC] tracking-[0.25em]">
              Luxury Events Ecosystem
            </span>
          </motion.div>

          {/* Staggered Heading Split into Words */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.1] mb-6 max-w-4xl text-center select-none">
            {titleWords.map((word, idx) => (
              <span key={idx} className="inline-block overflow-hidden mr-[0.2em] last:mr-0 pb-1">
                <motion.span
                  variants={wordVariants}
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
          </h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-[#F7F3EC]/70 max-w-2xl font-light mb-10 leading-relaxed font-sans"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {LANDING_PAGE_CONFIG.hero.subheading}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto"
          >
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] hover:from-[#c29f2f] hover:to-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-lg shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/35 hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 group"
            >
              <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Book Your Event
            </a>
            <a
              href="#gallery"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl border border-white/15 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-300 text-center"
            >
              Explore Gallery
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Subtle Gradient Shadow */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#090909] to-transparent pointer-events-none z-10" />
    </section>
  );
}
