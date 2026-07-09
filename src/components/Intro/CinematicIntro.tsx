"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INTRO_CONFIG } from "@/constants/introConfig";

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const totalDuration = INTRO_CONFIG.scene1Duration + INTRO_CONFIG.scene2Duration;

      if (elapsed >= totalDuration) {
        setElapsedTime(totalDuration);
        clearInterval(interval);
        onComplete();
      } else {
        setElapsedTime(elapsed);
      }
    }, 30); // smooth tick rate for progress and transitions

    return () => clearInterval(interval);
  }, [onComplete]);

  // Determine active scene
  const isScene1 = elapsedTime < INTRO_CONFIG.scene1Duration;

  // Scene 2 calculations
  const scene2Elapsed = elapsedTime - INTRO_CONFIG.scene1Duration;
  const progressPercent = Math.min(
    100,
    Math.max(0, (scene2Elapsed / INTRO_CONFIG.scene2Duration) * 100)
  );

  // Divide Scene 2 duration among the slides
  const slideDuration = INTRO_CONFIG.scene2Duration / INTRO_CONFIG.images.length;
  const currentSlideIndex = Math.min(
    INTRO_CONFIG.images.length - 1,
    Math.max(0, Math.floor(scene2Elapsed / slideDuration))
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-[9999] overflow-hidden select-none font-sans">
      <AnimatePresence mode="wait">
        {isScene1 ? (
          /* Scene 1: Fading, growing gold logo over pure black background */
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full flex flex-col items-center justify-center bg-black relative"
          >
            {/* Ambient subtle center glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0.15 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-[300px] h-[300px] bg-[#D4AF37] rounded-full blur-[90px] pointer-events-none"
            />
            
            {/* Main Brand Title */}
            <motion.h1
              initial={{ scale: 0.96, letterSpacing: "0.15em" }}
              animate={{ scale: 1.02, letterSpacing: "0.25em" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-4xl sm:text-6xl font-black font-heading text-white tracking-[0.25em] text-center select-none"
              style={{
                fontFamily: "Playfair Display, serif",
                textShadow: "0 0 20px rgba(212, 175, 55, 0.25)"
              }}
            >
              {INTRO_CONFIG.logoText}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-[10px] sm:text-xs text-[#F7F3EC] uppercase tracking-[0.35em] mt-4 font-light text-center"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {INTRO_CONFIG.logoSubtitle}
            </motion.p>
          </motion.div>
        ) : (
          /* Scene 2: Fullscreen Cinematic Slideshow Loader */
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: INTRO_CONFIG.fadeDuration / 1000 }}
            className="w-full h-full flex flex-col items-center justify-center relative"
          >
            {/* Background Slideshow (Ken Burns Zoom) */}
            <div className="absolute inset-0 z-0 bg-black">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, scale: 1.0 }}
                  animate={{ opacity: 1, scale: 1.08 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.8, ease: "easeInOut" },
                    scale: { duration: slideDuration / 1000 + 0.3, ease: "linear" }
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Image */}
                  <img
                    src={INTRO_CONFIG.images[currentSlideIndex].url}
                    alt={INTRO_CONFIG.images[currentSlideIndex].label}
                    className="w-full h-full object-cover"
                  />
                  {/* Luxury dark tint & backdrop blur */}
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-2xl min-h-[160px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 25, letterSpacing: "0.08em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.14em" }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.215, 0.61, 0.355, 1] // easeOutCubic
                  }}
                  className="text-lg sm:text-2xl font-light text-[#F7F3EC] leading-relaxed select-none"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    textShadow: "0 2px 10px rgba(0,0,0,0.6)"
                  }}
                >
                  {INTRO_CONFIG.phrases[currentSlideIndex]}
                </motion.div>
              </AnimatePresence>

              {/* Custom Gold Spinner (Ahmet-MIT inspired) */}
              <div className="mt-8">
                <div className="intro-spinner">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* Bottom Luxury Progress Bar */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-44 sm:w-60 h-[2px] bg-white/10 rounded-full overflow-hidden z-10 shadow-sm">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#f9e7b9] transition-all duration-75 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
