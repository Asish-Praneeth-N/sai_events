"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";

// Custom inline SVGs to avoid import errors from different lucide-react versions
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
    { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
    { icon: YoutubeIcon, href: "https://youtube.com", label: "YouTube" },
    { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" }
  ];

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "About Journey", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Book Consultation", href: "#contact" }
  ];

  // Instagram previews from the gallery assets
  const instagramPreviews = [
    "/images/wedding.png",
    "/images/engagement.png",
    "/images/birthday.png",
    "/images/reception.png"
  ];

  return (
    <footer className="bg-[#090909] text-white border-t border-white/5 pt-16 pb-8 select-none font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
        {/* Brand Information (5 columns) */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#f5db91] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-black" />
            </div>
            <span className="text-base font-black font-heading text-white tracking-[0.25em] uppercase">
              Sai Events
            </span>
          </div>
          
          <p className="text-xs text-[#F7F3EC]/60 font-light leading-relaxed max-w-sm">
            Crafting premium cinematic event experiences, luxury weddings, pre-wedding celebrations, and corporate galas with unparalleled attention to detail since 2014.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, idx) => {
              const IconComp = social.icon;
              return (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 hover:border-[#D4AF37]/50 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:scale-105 transition-all duration-300"
                  aria-label={social.label}
                >
                  <IconComp className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links (3 columns) */}
        <div className="md:col-span-3 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  className="text-xs text-[#F7F3EC]/70 hover:text-[#D4AF37] transition-colors duration-300 font-light tracking-wide"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Instagram Grid Previews (4 columns) */}
        <div className="md:col-span-4 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Instagram Grid
          </h4>
          <div className="grid grid-cols-2 gap-3 max-w-[200px]">
            {instagramPreviews.map((img, idx) => (
              <a
                key={idx}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-lg border border-white/5 hover:border-[#D4AF37]/50 block group bg-black"
              >
                <img
                  src={img}
                  alt={`Instagram preview ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#F7F3EC]/40 tracking-wider font-light">
          &copy; {currentYear} SAI EVENTS. All Rights Reserved. Crafted with Timeless Luxury.
        </p>
        <div className="flex gap-6">
          <a href="#home" className="text-[10px] text-[#F7F3EC]/40 hover:text-[#D4AF37] tracking-wider font-light transition-colors duration-300">
            Privacy Policy
          </a>
          <a href="#home" className="text-[10px] text-[#F7F3EC]/40 hover:text-[#D4AF37] tracking-wider font-light transition-colors duration-300">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
