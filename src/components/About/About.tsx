"use client";

import React from "react";
import { motion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Award, Compass, Star, TrendingUp } from "lucide-react";

export default function About() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const nodeVariants: any = {
    hidden: (isLeft: boolean) => ({
      opacity: 0,
      x: isLeft ? -40 : 40,
      y: 20,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="about" className="py-24 bg-[#090909] relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 0.6, letterSpacing: "0.25em" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.25em]"
          >
            {LANDING_PAGE_CONFIG.about.tagline}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-3xl sm:text-5xl font-light font-heading text-white mt-3 mb-6"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {LANDING_PAGE_CONFIG.about.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-sm sm:text-base text-[#F7F3EC]/70 leading-relaxed font-sans font-light"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {LANDING_PAGE_CONFIG.about.description}
          </motion.p>
        </div>

        {/* Timeline container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[#D4AF37]/50 via-[#D4AF37]/10 to-transparent -translate-x-1/2" />

          {/* Timeline Nodes */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-12"
          >
            {LANDING_PAGE_CONFIG.about.timeline.map((node, idx) => {
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={node.year}
                  className={`flex flex-col md:flex-row items-start ${
                    isLeft ? "md:flex-row-reverse" : ""
                  } relative`}
                >
                  {/* Central Node Circle */}
                  <div className="absolute left-4 md:left-1/2 top-1.5 w-3 h-3 rounded-full bg-black border-2 border-[#D4AF37] -translate-x-1/2 z-10 shadow-[0_0_10px_rgba(212,175,55,0.4)]" />

                  {/* Left / Right Card Container */}
                  <motion.div
                    custom={isLeft}
                    variants={nodeVariants}
                    className={`w-full md:w-[45%] pl-10 md:pl-0 ${
                      isLeft ? "md:text-right md:pr-12" : "md:pl-12"
                    }`}
                  >
                    {/* Glass card */}
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 hover:border-[#D4AF37]/20 transition-all duration-300 shadow-lg">
                      <span className="text-[#D4AF37] font-black text-lg sm:text-2xl font-heading mb-1 block">
                        {node.year}
                      </span>
                      <h4
                        className="text-base sm:text-lg font-bold text-white mb-2"
                        style={{ fontFamily: "Playfair Display, serif" }}
                      >
                        {node.title}
                      </h4>
                      <p
                        className="text-xs text-[#F7F3EC]/70 leading-relaxed font-sans font-light"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {node.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Empty space filler for desktop spacing alignment */}
                  <div className="hidden md:block w-[45%]" />
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
