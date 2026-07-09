"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import ScrollHeading from "@/components/Common/ScrollHeading";

const categories = ["All", "Weddings", "Engagements", "Birthdays", "Corporate", "Decorations"];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [hasEntered, setHasEntered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const filteredItems =
    filter === "All"
      ? LANDING_PAGE_CONFIG.gallery
      : LANDING_PAGE_CONFIG.gallery.filter((item) => item.category === filter);

  return (
    <section className="w-full bg-background py-24 sm:py-32 relative overflow-hidden select-none border-t border-border">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#D4AF37]/4 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-[#FF9040]/3 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            Visual Memories
          </span>
          <ScrollHeading
            title="Our Gallery"
            className="text-3xl sm:text-5xl font-light text-foreground tracking-tight"
          />
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 border cursor-pointer ${
                filter === cat
                  ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-md"
                  : "bg-card-bg border-card-border hover:border-[#D4AF37]/50 text-foreground/70 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {/* Parent div only tracks viewport entry — children self-animate with idx delays */}
        <div
          ref={(el) => {
            if (!el || hasEntered) return;
            const obs = new IntersectionObserver(
              ([entry]) => { if (entry.isIntersecting) { setHasEntered(true); obs.disconnect(); } },
              { rootMargin: "-80px" }
            );
            obs.observe(el);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.4, delay: hasEntered ? 0 : idx * 0.05 },
                  y: { duration: 0.4, delay: hasEntered ? 0 : idx * 0.05, ease: [0.16, 1, 0.3, 1] as const },
                  layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
                }}
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.3 } }}
                className="relative overflow-hidden rounded-2xl group border border-border hover:border-[#D4AF37]/30 shadow-lg bg-surface-raised cursor-pointer aspect-[4/3]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                  <span className="text-[8px] uppercase font-bold text-[#D4AF37] tracking-wider mb-1 inline-block">
                    {item.category}
                  </span>
                  <h4
                    className="text-sm font-semibold text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {item.title}
                  </h4>
                  {item.location && (
                    <span className="text-[10px] text-white/50 mt-1 font-light">
                      {item.location} · {item.year}
                    </span>
                  )}
                </div>

                {/* Gold border accent */}
                <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/25 transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
