"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";

// ─── Static imports (critical path) ─────────────────────────────────────────
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Particles from "@/components/Common/Particles";
import CinematicDoors from "@/components/Intro/CinematicDoors";
import Footer from "@/components/Footer/Footer";

// ─── Dynamic imports (lazy — not in critical path) ──────────────────────────
const WhyChooseUs     = lazy(() => import("@/components/WhyChooseUs/WhyChooseUs"));
const EventCategories = lazy(() => import("@/components/EventCategories/EventCategories"));
const Gallery         = lazy(() => import("@/components/Gallery/Gallery"));
const HowItWorks      = lazy(() => import("@/components/HowItWorks/HowItWorks"));
const Testimonials    = lazy(() => import("@/components/Testimonials/Testimonials"));
const Stats           = lazy(() => import("@/components/Stats/Stats"));
const About           = lazy(() => import("@/components/About/About"));
const FinalCTA        = lazy(() => import("@/components/FinalCTA/FinalCTA"));
const Contact         = lazy(() => import("@/components/Contact/Contact"));

// ─── Section Configuration ────────────────────────────────────────────────────
const SECTIONS = [
  { label: "Home",       id: "home" },
  { label: "Philosophy", id: "philosophy" },
  { label: "Atelier",    id: "categories" },
  { label: "Gallery",    id: "gallery" },
  { label: "Journey",    id: "journey" },
  { label: "Echoes",     id: "testimonials" },
  { label: "Metrics",    id: "stats" },
  { label: "Chronicle",  id: "about" },
  { label: "Finale",     id: "finale" },
  { label: "Contact",    id: "contact" },
];

const SectionFallback = () => <div className="w-full py-16 bg-[#090909]" />;

// ─── Intro visibility logic ────────────────────────────────────────────────────
// Show intro on:
//   1. First ever visit   (sessionStorage key absent)
//   2. Browser reload/F5  (PerformanceNavigation type === 'reload')
// Do NOT show on:
//   - Client-side SPA navigation (key present + not a reload)
function shouldShowIntro(): boolean {
  if (typeof window === "undefined") return false;

  // Detect browser reload vs client-side navigation
  const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  const navType = entries[0]?.type ?? "navigate";
  const isReload = navType === "reload";

  // Check if user has ever seen the intro in this browser session
  const seenKey = "sai_intro_seen";
  const hasSeen = sessionStorage.getItem(seenKey) === "1";

  if (!hasSeen || isReload) {
    // Mark as seen for subsequent SPA navigations (won't survive a real reload)
    sessionStorage.setItem(seenKey, "1");
    return true;
  }
  return false;
}

export default function Home() {
  const [showIntro, setShowIntro]   = useState(true); // start with doors showing (prevents flash)
  const [doorsOpen, setDoorsOpen]   = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Determine on client whether to show intro
  useEffect(() => {
    const show = shouldShowIntro();
    setShowIntro(show);
    if (!show) {
      // No intro — reveal content immediately
      setDoorsOpen(true);
      setContentReady(true);
    }
  }, []);

  const handleIntroOpening = useCallback(() => {
    // Doors start swinging open — begin revealing content behind them
    setDoorsOpen(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    // Doors fully gone — content is fully revealed
    setContentReady(true);
    setShowIntro(false);
  }, []);

  // ─── IntersectionObserver for dot nav ─────────────────────────────────────
  useEffect(() => {
    if (!doorsOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SECTIONS.findIndex((s) => s.id === entry.target.id);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { root: null, rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [doorsOpen]);

  const handleDotClick = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Cinematic Doors — first visit + every browser reload */}
      {showIntro && (
        <CinematicDoors
          onComplete={handleIntroComplete}
          onOpening={handleIntroOpening}
        />
      )}

      {/*
        Main content wrapper.
        - Starts invisible and very slightly zoomed in (scale 1.05)
        - When doorsOpen fires (doors start swinging), animates to full opacity + scale 1
        - The 1.8s ease creates the sensation of a camera pulling back into the venue
      */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={
          doorsOpen
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.05 }
        }
        transition={{
          opacity: { duration: 1.8, ease: "easeOut" },
          scale:   { duration: 2.2, ease: [0.16, 1, 0.3, 1] },
        }}
        className="relative bg-[#090909] text-[#F7F3EC] overflow-x-hidden film-grain font-sans min-h-screen"
        style={{ transformOrigin: "center center" }}
      >
        <Navbar activeSection={activeSection} sections={SECTIONS} />

        {/* Ambient particles */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Particles />
        </div>

        {/* Vignette */}
        <div className="cinema-lens pointer-events-none" aria-hidden="true" />

        {/* Section dot navigation — only visible once content is revealed */}
        {contentReady && (
          <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3.5 select-none pointer-events-auto">
            <div className="absolute top-0 bottom-0 w-px bg-white/5 rounded-full" />
            {SECTIONS.map((sec, idx) => {
              const isActive = activeSection === idx;
              return (
                <div
                  key={sec.id}
                  className="relative flex items-center justify-center group cursor-pointer"
                  onClick={() => handleDotClick(sec.id)}
                  title={sec.label}
                >
                  <span
                    className={`absolute right-5 text-[7px] uppercase font-bold tracking-[0.28em] text-[#D4AF37] whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "opacity-60 translate-x-0"
                        : "opacity-0 translate-x-1.5 group-hover:opacity-45 group-hover:translate-x-0"
                    }`}
                  >
                    {sec.label}
                  </span>
                  <div
                    className={`rounded-full transition-all duration-400 ${
                      isActive
                        ? "w-2.5 h-2.5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                        : "w-1.5 h-1.5 bg-white/15 group-hover:bg-white/30"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Main page sections */}
        <main className="relative z-10 w-full flex flex-col">
          <section id="home"><Hero /></section>

          <section id="philosophy">
            <Suspense fallback={<SectionFallback />}><WhyChooseUs /></Suspense>
          </section>

          <section id="categories">
            <Suspense fallback={<SectionFallback />}><EventCategories /></Suspense>
          </section>

          <section id="gallery">
            <Suspense fallback={<SectionFallback />}><Gallery /></Suspense>
          </section>

          <section id="journey">
            <Suspense fallback={<SectionFallback />}><HowItWorks /></Suspense>
          </section>

          <section id="testimonials">
            <Suspense fallback={<SectionFallback />}><Testimonials /></Suspense>
          </section>

          <section id="stats">
            <Suspense fallback={<SectionFallback />}><Stats /></Suspense>
          </section>

          <section id="about">
            <Suspense fallback={<SectionFallback />}><About /></Suspense>
          </section>

          <section id="finale">
            <Suspense fallback={<SectionFallback />}><FinalCTA /></Suspense>
          </section>

          <section id="contact">
            <Suspense fallback={<SectionFallback />}><Contact /></Suspense>
          </section>
        </main>

        <Footer />
      </motion.div>
    </>
  );
}
