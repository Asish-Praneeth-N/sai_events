"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import ScrollHeading from "@/components/Common/ScrollHeading";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % LANDING_PAGE_CONFIG.testimonials.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + LANDING_PAGE_CONFIG.testimonials.length) % LANDING_PAGE_CONFIG.testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % LANDING_PAGE_CONFIG.testimonials.length);
  };

  // Slide variants — elegant lateral glide
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : (dir > 0 ? 30 : -30),
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : (dir > 0 ? -30 : 30),
      transition: { duration: 0.4 },
    }),
  };

  const current = LANDING_PAGE_CONFIG.testimonials[index];

  return (
    <section className="w-full bg-transparent py-24 sm:py-32 relative overflow-hidden select-none border-t border-border">
      {/* Light-mode: clean neutrals. Dark-mode: cinematic warm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-foreground/[0.015] dark:bg-[#F0E6D0]/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-accent-gold/3 dark:bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-accent-gold/2 dark:bg-[#D4AF37]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            Kind Words
          </span>
          <ScrollHeading
            title="Client Testimonials"
            className="text-3xl sm:text-5xl font-light text-foreground tracking-tight"
          />
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Carousel Slider */}
        <div className="relative min-h-[300px] flex items-center justify-center w-full">
          {/* Decorative quote mark background */}
          <div className="absolute top-0 left-4 text-foreground/[0.03] pointer-events-none select-none">
            <Quote className="w-28 h-28 stroke-[0.8px]" />
          </div>

          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full text-center px-12 sm:px-24"
            >
              <div className="flex flex-col items-center">
                {/* Review Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]"
                    />
                  ))}
                </div>

                {/* Italic text review */}
                <p
                  className="text-lg sm:text-xl md:text-2xl font-light text-foreground leading-relaxed mb-8 italic"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  &ldquo;{current.content}&rdquo;
                </p>

                {/* Author Avatar + Title */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D4AF37]/40 mb-3 shadow-lg bg-black">
                    <img
                      src={current.image}
                      alt={current.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-foreground tracking-[0.18em] uppercase">
                    {current.name}
                  </h4>
                  <span className="text-[9px] text-[#D4AF37] uppercase tracking-[0.15em] font-semibold mt-0.5">
                    {current.role}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 p-2.5 rounded-xl bg-card-bg border border-card-border hover:border-[#D4AF37]/50 text-foreground/75 hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 p-2.5 rounded-xl bg-card-bg border border-card-border hover:border-[#D4AF37]/50 text-foreground/75 hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Dots indicator */}
        <div className="flex justify-center gap-2.5 mt-10">
          {LANDING_PAGE_CONFIG.testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > index ? 1 : -1);
                setIndex(idx);
              }}
              className={`h-[3px] rounded-full transition-all duration-400 cursor-pointer ${
                index === idx
                  ? "w-8 bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.35)]"
                  : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
