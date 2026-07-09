"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INTRO_CONFIG } from "@/constants/introConfig";
import CinematicIntro from "@/components/Intro/CinematicIntro";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Services from "@/components/Services/Services";
import Stats from "@/components/Stats/Stats";
import Gallery from "@/components/Gallery/Gallery";
import About from "@/components/About/About";
import Testimonials from "@/components/Testimonials/Testimonials";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import Particles from "@/components/Common/Particles";

export default function Home() {
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage on client mount to bypass intro if played within 24h
    const lastPlayed = localStorage.getItem(INTRO_CONFIG.cacheKey);
    
    if (lastPlayed) {
      const parsedTime = parseInt(lastPlayed, 10);
      const expiryDuration = INTRO_CONFIG.cacheExpiryHours * 60 * 60 * 1000; // 24 hours in ms
      
      if (Date.now() - parsedTime < expiryDuration) {
        setShowIntro(false);
        return;
      }
    }
    
    setShowIntro(true);
  }, []);

  const handleIntroComplete = () => {
    // Record current timestamp in local storage
    localStorage.setItem(INTRO_CONFIG.cacheKey, Date.now().toString());
    setShowIntro(false);
  };

  // Image preloading logic to prevent flickering or layout shifts during slideshows
  useEffect(() => {
    if (showIntro === null) return;
    
    const imagePreloads = [
      ...INTRO_CONFIG.images.map(img => img.url),
      "/images/wedding.png",
      "/images/reception.png",
      "/images/decor.png",
      "/images/fireworks.png",
      "/images/catering.png",
      "/images/photography.png"
    ];

    imagePreloads.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [showIntro]);

  // Keep screen black during initial load check
  if (showIntro === null) {
    return <div className="fixed inset-0 w-screen h-screen bg-black z-[9999]" />;
  }

  return (
    <div className="relative min-h-screen bg-[#090909] text-[#F7F3EC] overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <CinematicIntro key="intro" onComplete={handleIntroComplete} />
        ) : (
          /* Scene 3: Main Page fades, scales, blurs and slides in */
          <motion.div
            key="main-landing"
            initial={{ opacity: 0, scale: 1.08, filter: "blur(12px)", y: 40 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1] // Custom luxury easeOutQuart
            }}
            className="w-full relative min-h-screen"
          >
            {/* Translucent Global Navbar */}
            <Navbar />

            {/* Cinematic Floating Particles Atmospheric Effect */}
            <Particles />

            {/* Main Landing Sections */}
            <main>
              {/* Hero Section */}
              <Hero />

              {/* Service Cards Section */}
              <Services />

              {/* Stat Counters Section */}
              <Stats />

              {/* Masonry Event Gallery Section */}
              <Gallery />

              {/* Timeline Journey Section */}
              <About />

              {/* Auto-playing Testimonials Section */}
              <Testimonials />

              {/* Form & Map Contact Section */}
              <Contact />
            </main>

            {/* Footer with Instagram Grid */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
