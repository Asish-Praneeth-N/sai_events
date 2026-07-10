"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Phone, ArrowRight, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="w-full bg-transparent py-24 sm:py-36 relative overflow-hidden select-none border-t border-border">
      {/* Background image — let the venue breathe */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/reception.png"
          alt="Grand Finale"
          className="w-full h-full object-cover hero-image-light opacity-30 dark:opacity-40"
        />
        {/* Light: very subtle warm overlay. Dark: cinematic tint. No blur — blur kills mood. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80 dark:from-[#090909]/60 dark:via-[#090909]/25 dark:to-[#090909]/75" />
      </div>

      {/* Ambient spotlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-[#D4AF37]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Label */}
        <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-6 opacity-75">
          The Final Chapter
        </span>

        {/* Heading */}
        <h2
          className="text-4xl sm:text-6xl md:text-7xl font-light text-foreground leading-[1.1] mb-6"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Let&apos;s Create Something{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f5db91] font-normal">
            Beautiful
          </span>{" "}
          Together.
        </h2>

        {/* Subtext */}
        <p
          className="text-xs sm:text-sm text-foreground/50 font-light max-w-xl leading-relaxed mb-16"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Whether you&apos;re planning your dream celebration or a milestone corporate moment — your extraordinary event begins with a simple conversation.
        </p>

        {/* Two Invitation Cards Side-by-Side */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left"
        >
          {/* Card 1: Client Invitation (Book Your Event) */}
          <motion.div
            variants={cardVariants}
            whileHover={
              shouldReduceMotion
                ? {}
                : { y: -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
            }
            className="group relative rounded-3xl border border-accent-gold/25 p-8 sm:p-10 flex flex-col justify-between h-[340px] sm:h-[380px] bg-gradient-to-b from-surface to-surface-raised shadow-2xl overflow-hidden"
          >
            {/* Fine border accents to look like luxury paper/molding */}
            <div className="absolute inset-3 border border-accent-gold/10 rounded-2xl pointer-events-none" />
            
            <div>
              {/* Header details */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">SAI EVENTS • CLIENT PRIVÉ</span>
                <Award className="w-5 h-5 text-[#D4AF37]/40 group-hover:text-[#D4AF37] transition-colors duration-400" />
              </div>

              {/* Title & Desc */}
              <h3 
                className="text-2xl sm:text-3xl font-light text-foreground mb-3 tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Plan Your Event
              </h3>
              <p className="text-xs text-foreground/55 font-mono tracking-wide leading-relaxed uppercase">
                A ceremonial invitation to craft your milestone wedding, engagement, or luxury event from beginning to end.
              </p>
            </div>

            {/* Action */}
            <div className="relative z-10 mt-6">
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Calendar className="w-4 h-4" />
                Book Your Event
              </Link>
            </div>

            {/* Background watermark */}
            <div className="absolute right-4 bottom-4 text-9xl text-foreground/[0.01] font-heading font-black select-none pointer-events-none">
              SAI
            </div>
          </motion.div>

          {/* Card 2: Contact CTA */}
          <motion.div
            variants={cardVariants}
            whileHover={
              shouldReduceMotion
                ? {}
                : { y: -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
            }
            className="group relative rounded-3xl border border-border p-8 sm:p-10 flex flex-col justify-between h-[340px] sm:h-[380px] bg-gradient-to-b from-surface to-surface-raised shadow-2xl overflow-hidden hover:border-accent-gold/20 transition-colors duration-500"
          >
            <div className="absolute inset-3 border border-border/30 rounded-2xl pointer-events-none" />

            <div>
              {/* Header details */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">SAI EVENTS &bull; CONSULTATIONS</span>
                <ShieldCheck className="w-5 h-5 text-white/20 group-hover:text-[#D4AF37]/60 transition-colors duration-400" />
              </div>

              {/* Title & Desc */}
              <h3 
                className="text-2xl sm:text-3xl font-light text-foreground mb-3 tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Speak to Our Team
              </h3>
              <p className="text-xs text-muted-foreground/85 font-mono tracking-wide leading-relaxed uppercase">
                Have questions about pricing, availability, or a custom event scope? Our coordinators are here to guide you.
              </p>
            </div>

            {/* Action */}
            <div className="relative z-10 mt-6">
              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-btn-secondary-bg border border-card-border hover:border-accent-gold/50 text-foreground hover:bg-accent-gold/5 hover:text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                Get in Touch
              </a>
            </div>

            {/* Background watermark */}
            <div className="absolute right-4 bottom-4 text-9xl text-foreground/[0.01] font-heading font-black select-none pointer-events-none">
              SAI
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
