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

const SectionFallback = () => <div className="w-full py-16 bg-background" />;

// ─── Intro visibility logic ──────────────────────────────────────────────────
//
// MODULE-LEVEL FLAG — this is the key mechanism.
//
// JavaScript module variables reset to their initial value on every hard page
// load (browser re-parses and evaluates the module file from scratch).
// They SURVIVE React re-renders and Next.js soft (SPA) navigations because
// the module is not re-evaluated — only the component re-mounts.
//
// This means:
//   Hard reload (F5)            → module re-evaluates → _alreadyMounted = false
//   Hard navigation (link click) → module re-evaluates → _alreadyMounted = false
//   SPA navigation back to /    → module NOT re-evaluated → _alreadyMounted = true
//
// Combined with sessionStorage to know if user has ever seen the intro:
//
//  ┌──────────────────────┬────────────────┬────────────────────────────────┐
//  │  Navigation type     │ _alreadyMounted│ hasSeen (sessionStorage)       │
//  ├──────────────────────┼────────────────┼────────────────────────────────┤
//  │ First ever visit     │ false          │ false  → SHOW intro            │
//  │ F5 / browser reload  │ false          │ true   → SHOW intro (reload)   │
//  │ SPA back from /login │ true           │ (any)  → SKIP intro ✅         │
//  │ Link click to /      │ false          │ true   → SKIP intro ✅         │
//  └──────────────────────┴────────────────┴────────────────────────────────┘

let _alreadyMounted = false;

function shouldShowIntro(): boolean {
  if (typeof window === "undefined") return false;

  // If this module has already run shouldShowIntro() in this JS execution
  // context, we are inside a SPA soft navigation — never re-show the intro.
  if (_alreadyMounted) return false;

  // Mark that we've been here at least once in this JS execution context
  _alreadyMounted = true;

  const seenKey = "sai_intro_seen";
  const hasSeen = sessionStorage.getItem(seenKey) === "1";

  if (!hasSeen) {
    // First ever visit this browser session → show intro
    sessionStorage.setItem(seenKey, "1");
    return true;
  }

  // Has seen before — only show again on an explicit F5/Ctrl+R browser reload
  const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  const navType  = entries[0]?.type ?? "navigate";
  return navType === "reload";
}

export default function Home() {
  // IMPORTANT: Start as false — CinematicDoors must NEVER mount unless the
  // client-side check explicitly confirms it should (prevents it flashing on
  // every SPA back-navigation before the useEffect runs).
  const [showIntro, setShowIntro]   = useState(false);
  const [doorsOpen, setDoorsOpen]   = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Runs once on mount — determines whether to show doors or skip straight to content
  useEffect(() => {
    const show = shouldShowIntro();
    if (show) {
      // First visit or explicit reload → show the cinematic intro
      setShowIntro(true);
    } else {
      // SPA navigation (back from login etc.) → reveal content immediately, no doors
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
        Main content wrapper — cinematic zoom reveal.
        - Starts zoomed IN (scale 1.18 = viewer is "inside" the venue)
        - When doors open, animates scale → 1 over 3.2s (camera pulls back)
        - Opacity fades in over 1.6s in parallel
        - Together this creates the sensation of the venue rushing toward the user
      */}
      <motion.div
        initial={{ opacity: 0, scale: 1.18 }}
        animate={
          doorsOpen
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.18 }
        }
        transition={{
          opacity: { duration: 1.6, ease: "easeOut" },
          scale:   { duration: 3.2, ease: [0.22, 1, 0.36, 1] },
        }}
        className="relative bg-background text-foreground overflow-x-hidden film-grain font-sans min-h-screen transition-colors duration-300"
        style={{ transformOrigin: "center center", willChange: "transform, opacity" }}
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
            <div className="absolute top-0 bottom-0 w-px bg-border/40 dark:bg-white/5 rounded-full" />
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
                    className={`absolute right-5 text-[7px] uppercase font-bold tracking-[0.28em] text-accent-gold whitespace-nowrap transition-all duration-300 ${
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
                        ? "w-2.5 h-2.5 bg-accent-gold shadow-md shadow-accent-gold/40"
                        : "w-1.5 h-1.5 bg-foreground/15 dark:bg-white/15 group-hover:bg-foreground/30 dark:group-hover:bg-white/30"
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
