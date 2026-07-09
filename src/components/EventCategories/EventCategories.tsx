"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";

export default function EventCategories() {
  const shouldReduceMotion = useReducedMotion();
  const categories = LANDING_PAGE_CONFIG.eventCategories;

  // Grid entry animations (one-shot, highly performant)
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="w-full bg-[#090909] py-24 sm:py-32 relative overflow-hidden select-none border-t border-white/5">
      {/* Background gradients */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#C47A35]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-4 opacity-75">
            Every Occasion
          </span>
          <h2
            className="text-3xl sm:text-5xl font-light text-white tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            We Celebrate Everything
          </h2>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 w-full"
        >
          {categories.map((cat, idx) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.Sparkles;

            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: 1.02,
                        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                      }
                }
                className="group relative h-[210px] sm:h-[250px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/40 transition-colors duration-500 cursor-pointer shadow-lg"
              >
                {/* Image background with gradient washing */}
                <div className="absolute inset-0">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Ambient hover color overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: cat.color }}
                  />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-5 z-10">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-black/60 border border-white/10 group-hover:border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-3.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-sm font-medium text-white mb-1"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {cat.title}
                  </h3>

                  {/* Completed Event Count */}
                  <span className="text-[9px] uppercase tracking-wider text-[#D4AF37]/75 font-semibold">
                    {cat.count}
                  </span>
                </div>

                {/* Golden inner highlight border on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.2)" }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
