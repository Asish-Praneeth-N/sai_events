"use client";

import React from "react";
import { motion, useTransform, useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import ScrollHeading from "@/components/Common/ScrollHeading";
import {
  cardRevealVariants,
  gridRevealVariants,
  labelRevealVariants,
  CINEMATIC_EASE,
} from "@/lib/motionVariants";
import { useCinematicSection } from "@/hooks/useCinematicSection";
import * as Icons from "lucide-react";

interface ServicesProps {
  scrollProgress: MotionValue<number>;
}

export default function Services({ scrollProgress }: ServicesProps) {
  const shouldReduceMotion = useReducedMotion();

  // Services: section index 1 of 7
  const { activeProgress, bgY, mgY, fgY, fgEntryY } = useCinematicSection(scrollProgress, 1, 7);

  // Header rises into view as section is entered
  const headerOpacity = useTransform(activeProgress, [0, 0.28], [0, 1]);
  const labelOpacity  = useTransform(activeProgress, [0, 0.18], [0, 0.65]);

  // Cards reveal sequentially
  const cardsOpacity  = useTransform(activeProgress, [0.1, 0.45], [0, 1]);

  return (
    <section
      id="services"
      className="w-full h-full min-h-screen py-24 relative overflow-hidden select-none flex flex-col justify-center items-center bg-[#090909]"
    >
      {/* ── Layer 1: Background — warm burgundy room mood (40%) ──────────── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        aria-hidden="true"
      >
        {/* Warm burgundy ambient — intimate ceremony room */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#A05A28]/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-[110px]" />
        {/* Top edge dramatic lighting */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* ── Layer 3: Foreground Header (100%) ────────────────────────── */}
        <motion.div
          style={{ y: fgEntryY, opacity: headerOpacity }}
          className="text-center mb-16 will-change-transform"
        >
          <motion.span
            style={{ opacity: labelOpacity }}
            className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3"
          >
            What We Do
          </motion.span>

          <ScrollHeading
            title="Our Exclusive Services"
            className="text-3xl sm:text-5xl font-light text-white"
          />
        </motion.div>

        {/* ── Layer 2: Midground Cards (70%) ───────────────────────────── */}
        <motion.div
          style={{ y: mgY, opacity: cardsOpacity }}
          className="will-change-transform"
        >
          <motion.div
            variants={gridRevealVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
          >
            {LANDING_PAGE_CONFIG.services.map((service, i) => {
              const IconComponent = (Icons as any)[service.icon] || Icons.Sparkles;

              return (
                <motion.div
                  key={service.id}
                  variants={cardRevealVariants}
                  custom={i}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.04,
                          boxShadow: "0 24px 48px rgba(212,175,55,0.14)",
                          transition: { duration: 0.4, ease: CINEMATIC_EASE },
                        }
                  }
                  className="group relative h-[340px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/35 transition-colors duration-500 shadow-lg bg-black/40 cursor-pointer"
                >
                  {/* Image with hover Ken Burns */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  {/* Content Card Overlay — rises on hover */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col justify-end translate-y-3 group-hover:translate-y-0 transition-transform duration-500" style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
                    <div className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 group-hover:border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(212,175,55,0.3)]">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <h3
                      className="text-xl font-bold text-white mb-2"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {service.title}
                    </h3>

                    <p
                      className="text-xs text-[#F7F3EC]/70 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {service.description}
                    </p>
                  </div>

                  {/* Hover glow border effect */}
                  <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-1 group-hover:ring-[#D4AF37]/20 transition-all duration-500 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
