"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import type { VendorProfile } from "@/constants/introConfig";
import { Star, ShieldCheck, MapPin, Briefcase, ChevronRight, UserCheck } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";

// ─── Availability Badge ─────────────────────────────────────────────────────
function AvailabilityBadge({ status }: { status: VendorProfile["availability"] }) {
  const config = {
    available:   { label: "Available",   class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    busy:        { label: "Busy",         class: "bg-amber-500/10   text-amber-400   border-amber-500/20"   },
    "on-request":{ label: "On Request",  class: "bg-blue-500/10    text-blue-400    border-blue-500/20"    },
  };
  const { label, class: cls } = config[status];
  return (
    <span className={`text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Vendor Card ─────────────────────────────────────────────────────────────
function VendorCard({ vendor, idx }: { vendor: VendorProfile; idx: number }) {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -6, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
      }
      className="group relative flex flex-col rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden bg-black/40 backdrop-blur-md cursor-pointer shadow-lg shadow-black/30"
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={vendor.coverImage}
          alt={vendor.businessName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-transparent" />

        {/* Availability badge */}
        <div className="absolute top-4 right-4 z-10">
          <AvailabilityBadge status={vendor.availability} />
        </div>

        {/* Verified badge */}
        {vendor.isVerified && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-0.5 border border-[#D4AF37]/30 z-10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[8px] text-[#D4AF37] font-bold uppercase tracking-widest">Verified</span>
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="p-6 flex flex-col gap-5 flex-1 relative z-10">
        
        {/* Owner Avatar & Business Name */}
        <div className="flex items-center gap-3.5 -mt-12 relative z-20">
          <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 shadow-xl bg-black">
            <img src={vendor.profileImage} alt={vendor.ownerName} className="w-full h-full object-cover" />
          </div>
          <div className="mt-4">
            <h4 
              className="text-base font-medium text-white leading-snug group-hover:text-[#D4AF37] transition-colors duration-300" 
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {vendor.businessName}
            </h4>
            <span className="text-[10px] text-[#F7F3EC]/50 font-light block mt-0.5">{vendor.ownerName}</span>
          </div>
        </div>

        {/* Category & City */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold bg-[#D4AF37]/5 border border-[#D4AF37]/15 px-3 py-0.5 rounded-full">
            {LANDING_PAGE_CONFIG.vendorCategories.find((c) => c.id === vendor.category)?.label ?? vendor.category}
          </span>
          <span className="flex items-center gap-1 text-[9px] text-[#F7F3EC]/40 font-light">
            <MapPin className="w-2.5 h-2.5" />
            {vendor.city}
          </span>
        </div>

        {/* Short description */}
        <p className="text-xs text-white/50 leading-relaxed font-light line-clamp-2">
          {vendor.description}
        </p>

        {/* Trust Indicators: Rating & Completed Events */}
        <div className="flex items-center justify-between py-1">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-xs font-bold text-white">{vendor.rating.toFixed(1)}</span>
            <span className="text-[9px] text-[#F7F3EC]/45">({vendor.reviewCount} reviews)</span>
          </div>
          {/* Events */}
          <div className="flex items-center gap-1.5 text-[10px] text-white/60">
            <Briefcase className="w-3.5 h-3.5 text-white/30" />
            <span className="font-semibold text-white/80">{vendor.completedEvents}</span> Events Completed
          </div>
        </div>

        {/* Portfolio Mini Preview strip */}
        <div className="flex gap-2">
          {vendor.portfolioImages.slice(0, 3).map((imgUrl, pIdx) => (
            <div 
              key={pIdx} 
              className="flex-1 aspect-[4/3] rounded-lg overflow-hidden border border-white/5 relative group/thumb"
            >
              <img 
                src={imgUrl} 
                alt={`${vendor.businessName} Portfolio ${pIdx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-108"
              />
            </div>
          ))}
        </div>

        {/* Card Footer: Experience & Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div>
            <span className="text-[8px] text-[#F7F3EC]/40 uppercase tracking-widest block mb-0.5">Experience</span>
            <span className="text-xs font-semibold text-white/80">
              {vendor.experienceYears} Years Exp.
            </span>
          </div>
          <button className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] group-hover:text-white transition-colors duration-300">
            View Portfolio
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Decorative hover glow border */}
      <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/20 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function VendorShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = LANDING_PAGE_CONFIG.vendorCategories;
  const allVendors  = LANDING_PAGE_CONFIG.vendors;

  const filteredVendors =
    activeCategory === "all"
      ? allVendors
      : allVendors.filter((v) => v.category === activeCategory);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <section className="w-full bg-[#090909] py-24 sm:py-32 relative overflow-hidden select-none border-t border-white/5">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#1a3060]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#D4AF37]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.28em] block mb-3 opacity-75">
            Our Network
          </span>
          <h2
            className="text-3xl sm:text-5xl font-light text-white tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Meet Our Trusted Professionals
          </h2>
          <p className="text-xs sm:text-sm text-[#F7F3EC]/55 font-light max-w-xl mx-auto mt-4 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
            150+ handpicked and verified professional vendors ready to coordinate your next celebration with flawless execution.
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-4" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-14">
          {categories.map((cat) => {
            const IconComp = (Icons as any)[cat.icon] || Icons.LayoutGrid;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/15"
                    : "bg-white/4 border-white/8 hover:border-[#D4AF37]/45 text-[#F7F3EC]/70 hover:text-white"
                }`}
              >
                <IconComp className="w-3 h-3" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Vendor Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {filteredVendors.map((vendor, idx) => (
            <VendorCard key={vendor.id} vendor={vendor} idx={idx} />
          ))}
        </motion.div>

        {/* Join as Vendor Invitation Card */}
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="w-full max-w-2xl p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/15 bg-gradient-to-br from-[#D4AF37]/5 to-transparent backdrop-blur-md shadow-2xl relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] mx-auto mb-6">
              <UserCheck className="w-5 h-5" />
            </div>

            <h3
              className="text-2xl sm:text-3xl font-light text-white mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Are You an Elite Event Professional?
            </h3>
            <p className="text-xs sm:text-sm text-[#F7F3EC]/60 font-light mb-8 leading-relaxed max-w-lg mx-auto" style={{ fontFamily: "Poppins, sans-serif" }}>
              Collaborate with SAI EVENTS, list your premium portfolio, and get booked by elite clients planning milestone celebrations.
            </p>
            
            <Link
              href="/register?role=vendor"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e4bf47] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Become a Verified Vendor
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
