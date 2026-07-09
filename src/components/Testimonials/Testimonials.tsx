"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [index]);

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + LANDING_PAGE_CONFIG.testimonials.length) % LANDING_PAGE_CONFIG.testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % LANDING_PAGE_CONFIG.testimonials.length);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 80 : -80,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -80 : 80,
    }),
  };

  const current = LANDING_PAGE_CONFIG.testimonials[index];

  return (
    <section id="testimonials" className="py-24 bg-[#0F172A]/30 relative overflow-hidden select-none border-t border-b border-white/5">
      {/* Background ambient details */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-900/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 0.6, letterSpacing: "0.25em" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.25em]"
          >
            Kind Words
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-3xl sm:text-5xl font-light font-heading text-white mt-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Client Testimonials
          </motion.h2>
        </div>

        {/* Carousel Container */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          {/* Quote mark indicator */}
          <div className="absolute top-0 left-6 text-white/5 pointer-events-none">
            <Quote className="w-24 h-24 stroke-[1px]" />
          </div>

          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center px-8 sm:px-16"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="w-5.5 h-5.5 fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.3)]" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p
                className="text-lg sm:text-xl md:text-2xl font-light text-[#F7F3EC] leading-relaxed mb-8 italic"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                "{current.content}"
              </p>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 mb-3 shadow-md">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                  {current.name}
                </h4>
                <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.15em] font-light mt-0.5">
                  {current.role}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/50 text-white/80 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/50 text-white/80 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2.5 mt-12">
          {LANDING_PAGE_CONFIG.testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > index ? 1 : -1);
                setIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === idx ? "w-8 bg-[#D4AF37]" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
