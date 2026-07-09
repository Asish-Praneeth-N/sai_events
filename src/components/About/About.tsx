"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import ScrollHeading from "@/components/Common/ScrollHeading";

export default function About() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const getNodeVariants = (isLeft: boolean) => ({
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : (isLeft ? -20 : 20),
      y: 10,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  });

  return (
    <section className="w-full bg-[#090909] py-24 sm:py-32 relative overflow-hidden select-none border-t border-white/5">
      {/* Background gradients */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#6428B0]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[320px] h-[320px] bg-[#D4AF37]/3 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            {LANDING_PAGE_CONFIG.about.tagline}
          </span>
          <ScrollHeading
            title={LANDING_PAGE_CONFIG.about.heading}
            className="text-3xl sm:text-5xl font-light text-white mb-5 tracking-tight"
          />
          <p
            className="text-xs sm:text-sm text-[#F7F3EC]/60 leading-relaxed font-light mt-4 max-w-xl mx-auto"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {LANDING_PAGE_CONFIG.about.description}
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Timeline chronicle */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative max-w-5xl mx-auto w-full"
        >
          {/* Vertical central path line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#D4AF37]/50 via-[#D4AF37]/10 to-transparent -translate-x-1/2 pointer-events-none" />

          <div className="space-y-12">
            {LANDING_PAGE_CONFIG.about.timeline.map((node, idx) => {
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={node.year}
                  className={`flex flex-col md:flex-row items-start ${isLeft ? "md:flex-row-reverse" : ""} relative`}
                >
                  {/* Timeline bullet node */}
                  <div className="absolute left-4 md:left-1/2 top-2.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-[#D4AF37] -translate-x-1/2 z-10 shadow-[0_0_10px_rgba(212,175,55,0.4)]" />

                  {/* Card wrapper */}
                  <motion.div
                    variants={getNodeVariants(isLeft)}
                    className={`w-full md:w-[45%] pl-10 md:pl-0 ${isLeft ? "md:text-right md:pr-12" : "md:pl-12"}`}
                  >
                    <div className="p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-[#D4AF37]/35 transition-all duration-500 shadow-xl backdrop-blur-md group">
                      <span
                        className="text-[#D4AF37] font-black text-xl sm:text-2xl mb-1 block"
                        style={{ fontFamily: "Playfair Display, serif" }}
                      >
                        {node.year}
                      </span>
                      <h4
                        className="text-base sm:text-lg font-medium text-white mb-2"
                        style={{ fontFamily: "Playfair Display, serif" }}
                      >
                        {node.title}
                      </h4>
                      <p
                        className="text-xs sm:text-sm text-[#F7F3EC]/55 leading-relaxed font-light"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {node.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Empty space block for spacing alignment */}
                  <div className="hidden md:block w-[45%]" />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
