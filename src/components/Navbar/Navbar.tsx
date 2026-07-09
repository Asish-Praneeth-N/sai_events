"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";

export default function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Determine background backdrop appearance
      setIsScrolled(currentScrollPos > 20);

      // Determine visibility
      if (currentScrollPos < 50) {
        setVisible(true);
      } else {
        const isScrollingUp = prevScrollPos > currentScrollPos;
        setVisible(isScrollingUp);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "About", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#090909]/75 backdrop-blur-lg border-b border-white/5 py-4" 
            : "bg-transparent py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#home" className="flex items-center gap-2 select-none group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#f5db91] flex items-center justify-center shadow-md shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4.5 h-4.5 text-black" />
            </div>
            <span className="text-lg font-black font-heading text-white tracking-[0.2em] uppercase">
              Sai Events
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs uppercase font-light text-[#F7F3EC]/80 hover:text-[#D4AF37] tracking-[0.18em] transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Book Button */}
          <div className="hidden md:block">
            <a
              href="#contact"
              className="px-6 py-2 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs uppercase font-bold tracking-[0.15em] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              Book Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-[#D4AF37] p-1.5 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-full h-screen bg-[#090909]/95 z-40 backdrop-blur-xl flex flex-col justify-center px-8"
          >
            <div className="flex flex-col gap-6 text-center">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl uppercase font-light text-white hover:text-[#D4AF37] tracking-[0.2em] transition-colors duration-300"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-8">
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-block px-10 py-3 bg-[#D4AF37] text-black text-sm uppercase font-bold tracking-[0.2em] rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  Book Now
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
