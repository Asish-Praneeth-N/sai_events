"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";

export default function Gallery() {
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Weddings", "Engagements", "Birthdays", "Corporate", "Decorations"];

  const filteredItems = filter === "All"
    ? LANDING_PAGE_CONFIG.gallery
    : LANDING_PAGE_CONFIG.gallery.filter(item => item.category === filter);

  return (
    <section id="gallery" className="py-24 bg-[#0F172A]/30 relative overflow-hidden select-none border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 0.6, letterSpacing: "0.25em" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.25em]"
          >
            Visual Memories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-3xl sm:text-5xl font-light font-heading text-white mt-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Our Gallery
          </motion.h2>
        </div>

        {/* Categories Filter Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-[0.1em] uppercase transition-all duration-300 border ${
                filter === cat
                  ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/15"
                  : "bg-white/5 border-white/10 hover:border-[#D4AF37]/50 text-[#F7F3EC]/80 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pinterest Masonry Grid */}
        <motion.div
          layout
          className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="break-inside-avoid relative overflow-hidden rounded-2xl group border border-white/5 shadow-md bg-black cursor-pointer"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10 flex flex-col justify-end p-6">
                  {/* Category Badge */}
                  <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-wider mb-1.5 inline-block">
                    {item.category}
                  </span>

                  {/* Image Title */}
                  <h4
                    className="text-lg font-bold text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-500 font-heading"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
