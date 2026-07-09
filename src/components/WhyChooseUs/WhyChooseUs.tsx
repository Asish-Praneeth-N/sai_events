"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";
import { CINEMATIC_EASE } from "@/lib/motionVariants";

export default function WhyChooseUs() {
  const beats = LANDING_PAGE_CONFIG.whyChooseUs;
  const [activeBeat, setActiveBeat] = useState(0);

  const getIconComponent = (name: string) => {
    return (Icons as any)[name] || Icons.Sparkles;
  };

  return (
    <section className="w-full bg-[#090909] py-24 sm:py-32 relative overflow-hidden select-none border-t border-white/5">
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#0a1a0f]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-4 opacity-75">
            Our Philosophy
          </span>
          <h2
            className="text-3xl sm:text-5xl font-light text-white tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            How We Craft Your Moments
          </h2>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Split Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Large Premium Photo (5 cols) */}
          <div className="lg:col-span-5 h-[350px] sm:h-[450px] lg:h-[520px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative bg-[#121212]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBeat}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={beats[activeBeat].image}
                  alt={beats[activeBeat].statement}
                  className="w-full h-full object-cover brightness-[0.85]"
                />
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </motion.div>
            </AnimatePresence>
            
            {/* Ambient subtle glow ring */}
            <div className="absolute inset-0 border border-[#D4AF37]/15 rounded-3xl pointer-events-none" />
          </div>

          {/* Right Column: Interactive Story Cards (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {beats.map((beat, idx) => {
              const IconComp = getIconComponent(beat.icon);
              const isActive = activeBeat === idx;

              return (
                <div
                  key={beat.id}
                  onMouseEnter={() => setActiveBeat(idx)}
                  className={`group p-6 rounded-2xl border transition-all duration-500 cursor-pointer flex gap-5 items-start relative overflow-hidden ${
                    isActive
                      ? "bg-white/4 border-[#D4AF37]/45 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                      : "bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  {/* Left Active border accent indicator */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4AF37] transition-transform duration-500 origin-top ${
                      isActive ? "scale-y-100" : "scale-y-0"
                    }`}
                  />

                  {/* Numeral and Icon */}
                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                    <span 
                      className={`text-xs uppercase tracking-widest font-mono font-bold transition-colors duration-400 ${
                        isActive ? "text-[#D4AF37]" : "text-white/30"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div 
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                        isActive 
                          ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]" 
                          : "bg-white/5 border-white/5 text-white/40 group-hover:text-white/60"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-1.5">
                    <h3 
                      className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
                      }`}
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {beat.statement}
                    </h3>
                    <p 
                      className={`text-xs sm:text-sm font-light leading-relaxed transition-colors duration-300 ${
                        isActive ? "text-white/65" : "text-[#F7F3EC]/40 group-hover:text-white/50"
                      }`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {beat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
