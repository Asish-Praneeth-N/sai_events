"use client";

import React from "react";
import { motion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";

export default function Services() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }, // premium easeOutQuart
    },
  };

  return (
    <section id="services" className="py-24 bg-[#090909] relative overflow-hidden select-none">
      {/* Background ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 0.6, letterSpacing: "0.25em" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.25em]"
          >
            What We Do
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-3xl sm:text-5xl font-light font-heading text-white mt-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Our Exclusive Services
          </motion.h2>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {LANDING_PAGE_CONFIG.services.map((service) => {
            // Dynamically lookup the Lucide icon component
            const IconComponent = (Icons as any)[service.icon] || Icons.Sparkles;

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                className="group relative h-[360px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/35 transition-colors duration-500 shadow-lg hover:shadow-[0_15px_30px_rgba(212,175,55,0.08)] bg-black/40"
              >
                {/* Background Image (Ken Burns Zoom on Hover) */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
                </div>

                {/* Glassmorphic Description Card Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]">
                  {/* Floating Gold Icon */}
                  <div className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 group-hover:border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-xs text-[#F7F3EC]/70 font-light leading-relaxed font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
