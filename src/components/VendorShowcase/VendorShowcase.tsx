"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera, Palette, UtensilsCrossed, Music, Sparkles,
  ClipboardList, Lightbulb, Flower2, ShieldCheck, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ─── Service Capability Data ─────────────────────────────────────────────────
// We show SAI EVENTS' service categories as unified capabilities.
// No vendor identities, pricing, or availability are exposed to customers.
const SERVICE_CAPABILITIES = [
  {
    id: "photography",
    label: "Photography & Film",
    icon: Camera,
    description: "Cinematic wedding films, editorial portraits, and candid storytelling by our specialist creative team.",
    accentColor: "text-blue-400",
    bgColor: "bg-blue-500/5 border-blue-500/15",
    badgeColor: "bg-blue-500/10 text-blue-400",
  },
  {
    id: "decor",
    label: "Luxury Décor",
    icon: Palette,
    description: "Bespoke floral installations, themed stage setups, and immersive venue transformations crafted to perfection.",
    accentColor: "text-pink-400",
    bgColor: "bg-pink-500/5 border-pink-500/15",
    badgeColor: "bg-pink-500/10 text-pink-400",
  },
  {
    id: "catering",
    label: "Premium Catering",
    icon: UtensilsCrossed,
    description: "Multi-cuisine live stations, plated gourmet service, and dessert counters for every palate and occasion.",
    accentColor: "text-amber-400",
    bgColor: "bg-amber-500/5 border-amber-500/15",
    badgeColor: "bg-amber-500/10 text-amber-400",
  },
  {
    id: "entertainment",
    label: "Sound & Entertainment",
    icon: Music,
    description: "Professional sound production, live DJ sets, and curated music experiences for every mood and genre.",
    accentColor: "text-purple-400",
    bgColor: "bg-purple-500/5 border-purple-500/15",
    badgeColor: "bg-purple-500/10 text-purple-400",
  },
  {
    id: "makeup",
    label: "Bridal & Makeup",
    icon: Sparkles,
    description: "Flawless bridal artistry, editorial styles, and hair expertise for every skin tone and occasion.",
    accentColor: "text-rose-400",
    bgColor: "bg-rose-500/5 border-rose-500/15",
    badgeColor: "bg-rose-500/10 text-rose-400",
  },
  {
    id: "planning",
    label: "Full-Event Planning",
    icon: ClipboardList,
    description: "End-to-end event orchestration with a dedicated coordinator managing every detail from concept to close.",
    accentColor: "text-[#D4AF37]",
    bgColor: "bg-[#D4AF37]/5 border-[#D4AF37]/15",
    badgeColor: "bg-[#D4AF37]/10 text-[#D4AF37]",
  },
  {
    id: "lighting",
    label: "Lighting & AV",
    icon: Lightbulb,
    description: "Precision lighting rigs, projection mapping, and premium AV systems that set the stage on fire.",
    accentColor: "text-yellow-400",
    bgColor: "bg-yellow-500/5 border-yellow-500/15",
    badgeColor: "bg-yellow-500/10 text-yellow-400",
  },
  {
    id: "florals",
    label: "Floral Artistry",
    icon: Flower2,
    description: "Handcrafted centerpieces, arches, aisle designs, and seasonal bloom arrangements for every venue.",
    accentColor: "text-emerald-400",
    bgColor: "bg-emerald-500/5 border-emerald-500/15",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
  },
];

// ─── Service Card ────────────────────────────────────────────────────────────
function ServiceCard({
  service,
  idx,
}: {
  service: (typeof SERVICE_CAPABILITIES)[0];
  idx: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const IconComp = service.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
            delay: idx * 0.06,
          },
        },
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -5, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }
      }
      className={`group relative flex flex-col gap-5 rounded-2xl border p-6 transition-all duration-500 cursor-default overflow-hidden shadow-sm hover:shadow-md ${service.bgColor}`}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${service.badgeColor} border ${service.bgColor}`}
      >
        <IconComp className={`w-5 h-5 ${service.accentColor}`} />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h4
          className={`text-base font-medium text-foreground group-hover:${service.accentColor} transition-colors duration-300 leading-snug`}
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          {service.label}
        </h4>
        <p className="text-xs text-foreground/55 font-light leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Verified badge */}
      <div className="flex items-center gap-1.5 mt-auto">
        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]/70">
          SAI EVENTS Managed
        </span>
      </div>

      {/* Subtle hover glow border */}
      <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/15 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function VendorShowcase() {
  return (
    <section
      className="w-full bg-background py-24 sm:py-32 relative overflow-hidden select-none border-t border-border"
      id="services"
    >
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#1a3060]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            Our Capabilities
          </span>
          <h2
            className="text-3xl sm:text-5xl font-light text-foreground tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Everything Your Event Needs
          </h2>
          <p
            className="text-xs sm:text-sm text-foreground/55 font-light max-w-xl mx-auto mt-4 leading-relaxed"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            SAI EVENTS manages every aspect of your celebration in-house — photography, décor, catering,
            entertainment, and more. You simply enjoy the day.
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Services Grid */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full"
        >
          {SERVICE_CAPABILITIES.map((service, idx) => (
            <ServiceCard key={service.id} service={service} idx={idx} />
          ))}
        </motion.div>

        {/* Bottom CTA — Book, not join as vendor */}
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="w-full max-w-2xl p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/15 bg-gradient-to-br from-[#D4AF37]/5 to-transparent backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] mx-auto mb-6">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h3
              className="text-2xl sm:text-3xl font-light text-foreground mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Ready to Create Something Extraordinary?
            </h3>
            <p
              className="text-xs sm:text-sm text-foreground/60 font-light mb-8 leading-relaxed max-w-lg mx-auto"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Tell us your vision and let our specialist team take care of everything — from the first
              detail to the final moment.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Start Planning Your Event
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
