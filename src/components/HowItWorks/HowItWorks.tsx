"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const steps = LANDING_PAGE_CONFIG.howItWorks;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = (isRight: boolean) => ({
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : (isRight ? 20 : -20),
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  });

  return (
    <section className="w-full bg-[#090909] py-24 sm:py-32 relative overflow-hidden select-none border-t border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a1308]/50 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            Your Journey
          </span>
          <h2
            className="text-3xl sm:text-5xl font-light text-white tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[#F7F3EC]/55 font-light max-w-md mx-auto mt-4 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
            Six simple steps from your first idea to the final celebration.
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Steps Timeline Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Vertical central path line */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#D4AF37]/50 via-[#D4AF37]/10 to-transparent -translate-x-1/2 hidden sm:block pointer-events-none" />

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const IconComponent = (Icons as any)[step.icon] || Icons.CheckCircle2;
              const isRight = idx % 2 !== 0;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 ${isRight ? "sm:flex-row-reverse" : ""}`}
                >
                  {/* Center Node dot (desktop) */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 mt-3.5 w-8 h-8 rounded-full bg-[#090909] border-2 border-[#D4AF37]/50 items-center justify-center z-10 shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                    <span className="text-[10px] font-black text-[#D4AF37]">{String(step.step).padStart(2, "0")}</span>
                  </div>

                  {/* Step Card */}
                  <motion.div
                    variants={cardVariants(isRight)}
                    className={`w-full sm:w-[44%] ${isRight ? "sm:text-right" : ""}`}
                  >
                    <div className="flex flex-col sm:items-start gap-4 p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 backdrop-blur-md group">
                      <div className="flex items-center gap-3">
                        {/* Step number (mobile) */}
                        <div className="flex sm:hidden w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-black text-[#D4AF37]">{String(step.step).padStart(2, "0")}</span>
                        </div>

                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl bg-black/60 border border-white/8 group-hover:border-[#D4AF37]/45 flex items-center justify-center text-[#D4AF37] transition-all duration-300 ${
                            isRight ? "sm:ml-auto" : ""
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h3
                          className="text-base sm:text-lg font-bold text-white"
                          style={{ fontFamily: "Playfair Display, serif" }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-xs sm:text-sm text-[#F7F3EC]/55 leading-relaxed font-light"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Spacer for structural symmetry */}
                  <div className="hidden sm:block w-[44%]" />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Book Your Event
          </Link>
          <Link
            href="/register?role=vendor"
            className="px-8 py-3.5 bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white/8 transition-all duration-300"
          >
            Become a Vendor
          </Link>
        </div>
      </div>
    </section>
  );
}
