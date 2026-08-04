"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";
import { ArrowUpRight, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function WhyChooseUs() {
  const beats = LANDING_PAGE_CONFIG.whyChooseUs;
  const [activeBeat, setActiveBeat] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const getIconComponent = (name: string) => {
    return (Icons as any)[name] || Icons.Sparkles;
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        border-t border-[#143d2b]/10
        bg-[#eee3d5]
        py-24
        select-none
        sm:py-32
        lg:py-40

        dark:border-white/[0.07]
        dark:bg-[#0e110d]
      "
    >
      {/* ============================================================ */}
      {/* BACKGROUND                                                   */}
      {/* ============================================================ */}

      <div className="pointer-events-none absolute left-[4.5%] top-0 hidden h-full w-px bg-[#143d2b]/[0.06] xl:block dark:bg-white/[0.04]" />

      <div className="pointer-events-none absolute right-[4.5%] top-0 hidden h-full w-px bg-[#143d2b]/[0.06] xl:block dark:bg-white/[0.04]" />

      <div className="pointer-events-none absolute left-[15%] top-[30%] h-[500px] w-[500px] rounded-full bg-[#9b742f]/[0.035] blur-[160px] dark:bg-[#d4af37]/[0.018]" />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-[2vw]
          top-[4vw]
          hidden
          text-[clamp(9rem,18vw,18rem)]
          italic
          leading-none
          tracking-[-0.07em]
          text-[#143d2b]/[0.018]
          lg:block
          dark:text-white/[0.012]
        "
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Why
      </div>

      {/* ============================================================ */}
      {/* CONTENT                                                      */}
      {/* ============================================================ */}

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 sm:px-8 lg:px-[7%]">

        {/* Header */}

        <div className="mb-14 grid grid-cols-1 gap-8 border-b border-[#143d2b]/10 pb-10 lg:mb-20 lg:grid-cols-[1fr_380px] lg:items-end dark:border-white/[0.07]">

          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : -18,
              }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mb-5 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-[#9b742f]/50 dark:bg-[#d4af37]/40" />

              <Sparkles className="h-3 w-3 text-[#9b742f] dark:text-[#d2b56b]" />

              <span className="text-[8px] font-bold uppercase tracking-[0.34em] text-[#9b742f] dark:text-[#d2b56b]">
                Our Philosophy
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 22,
              }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.9,
                ease: EASE,
              }}
              className="
                max-w-[780px]
                text-[clamp(3.2rem,6vw,6.3rem)]
                font-normal
                leading-[0.93]
                tracking-[-0.055em]
                text-[#143d2b]
                dark:text-[#eee5d7]
              "
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              How we craft
              <br />
              <span className="italic text-[#9b742f] dark:text-[#d2b56b]">
                your moments.
              </span>
            </motion.h2>
          </div>

          <p
            className="max-w-[370px] text-[11px] leading-[1.9] text-[#143d2b]/50 sm:text-xs dark:text-[#eee5d7]/42"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Beautiful events are not created by adding more.
            They are created by understanding what matters,
            refining every detail and managing everything you
            should never have to worry about.
          </p>
        </div>

        {/* ========================================================== */}
        {/* MAIN SHOWCASE                                              */}
        {/* ========================================================== */}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-24">

          {/* ======================================================== */}
          {/* IMAGE                                                   */}
          {/* ======================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: shouldReduceMotion ? 0 : -30,
            }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.9,
              ease: EASE,
            }}
            className="
              relative
              min-h-[460px]
              overflow-hidden
              sm:min-h-[580px]
              lg:col-span-6
              lg:min-h-[700px]
            "
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBeat}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 1.045,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.985,
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.75,
                  ease: EASE,
                }}
                className="absolute inset-0"
              >
                <img
                  src={beats[activeBeat].image}
                  alt={beats[activeBeat].statement}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#07130d]/65 via-transparent to-black/[0.06]" />
              </motion.div>
            </AnimatePresence>

            {/* editorial frame */}

            <div className="pointer-events-none absolute inset-4 border border-white/20 sm:inset-5" />

            {/* index */}

            <div className="absolute left-8 top-8 z-10 sm:left-10 sm:top-10">
              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/65">
                Philosophy
              </span>
            </div>

            {/* bottom image caption */}

            <AnimatePresence mode="wait">
              <motion.div
                key={`caption-${activeBeat}`}
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : 12,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute bottom-8 left-8 right-8 z-10 sm:bottom-10 sm:left-10 sm:right-10"
              >
                <span
                  className="text-3xl italic text-white sm:text-4xl"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  0{activeBeat + 1}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* offset gold detail */}

            <div className="absolute -bottom-3 -right-3 -z-10 h-[75%] w-[70%] border border-[#9b742f]/25 dark:border-[#d4af37]/15" />
          </motion.div>

          {/* ======================================================== */}
          {/* PHILOSOPHY INDEX                                        */}
          {/* ======================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: shouldReduceMotion ? 0 : 30,
            }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.9,
              delay: shouldReduceMotion ? 0 : 0.1,
              ease: EASE,
            }}
            className="lg:col-span-6 lg:flex lg:flex-col lg:justify-center"
          >
            <div className="border-t border-[#143d2b]/12 dark:border-white/[0.08]">
              {beats.map((beat, idx) => {
                const IconComp = getIconComponent(beat.icon);
                const isActive = activeBeat === idx;

                return (
                  <motion.button
                    key={beat.id}
                    type="button"
                    onMouseEnter={() => setActiveBeat(idx)}
                    onFocus={() => setActiveBeat(idx)}
                    onClick={() => setActiveBeat(idx)}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { x: 5 }
                    }
                    transition={{
                      duration: 0.3,
                      ease: EASE,
                    }}
                    className="
                      group
                      relative
                      grid
                      w-full
                      cursor-pointer
                      grid-cols-[42px_1fr_auto]
                      gap-4
                      border-b
                      border-[#143d2b]/12
                      py-7
                      text-left
                      sm:grid-cols-[52px_1fr_auto]
                      sm:gap-5
                      sm:py-8
                      dark:border-white/[0.08]
                    "
                  >
                    {/* animated active line */}

                    <motion.div
                      initial={false}
                      animate={{
                        scaleY: isActive ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: EASE,
                      }}
                      className="absolute bottom-0 left-0 top-0 w-[2px] origin-top bg-[#9b742f] dark:bg-[#d2b56b]"
                    />

                    {/* number */}

                    <span
                      className={`
                        pt-1
                        text-[9px]
                        font-bold
                        tracking-[0.18em]
                        transition-colors
                        duration-300
                        ${
                          isActive
                            ? "text-[#9b742f] dark:text-[#d2b56b]"
                            : "text-[#143d2b]/25 dark:text-white/20"
                        }
                      `}
                    >
                      0{idx + 1}
                    </span>

                    {/* text */}

                    <div>
                      <div className="flex items-center gap-3">
                        <h3
                          className={`
                            text-xl
                            font-normal
                            transition-colors
                            duration-300
                            sm:text-2xl
                            lg:text-[1.7rem]
                            ${
                              isActive
                                ? "text-[#143d2b] dark:text-[#eee5d7]"
                                : "text-[#143d2b]/55 group-hover:text-[#143d2b] dark:text-[#eee5d7]/45 dark:group-hover:text-[#eee5d7]"
                            }
                          `}
                          style={{
                            fontFamily: '"Playfair Display", serif',
                          }}
                        >
                          {beat.statement}
                        </h3>

                        <IconComp
                          className={`
                            h-3.5
                            w-3.5
                            stroke-[1.4]
                            transition-all
                            duration-300
                            ${
                              isActive
                                ? "text-[#9b742f] opacity-100 dark:text-[#d2b56b]"
                                : "text-[#143d2b]/25 opacity-0 group-hover:opacity-60 dark:text-white/30"
                            }
                          `}
                        />
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: shouldReduceMotion ? 0.15 : 0.45,
                              ease: EASE,
                            }}
                            className="overflow-hidden"
                          >
                            <p
                              className="max-w-[480px] pt-3 text-[11px] leading-[1.85] text-[#143d2b]/50 sm:text-xs dark:text-[#eee5d7]/42"
                              style={{
                                fontFamily: '"Poppins", sans-serif',
                              }}
                            >
                              {beat.subtext}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* arrow */}

                    <ArrowUpRight
                      className={`
                        mt-1
                        h-4
                        w-4
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "translate-x-0 opacity-100 text-[#9b742f] dark:text-[#d2b56b]"
                            : "-translate-x-2 opacity-0 text-[#143d2b]/30 group-hover:translate-x-0 group-hover:opacity-60 dark:text-white/30"
                        }
                      `}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* signature */}

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#9b742f]/40 dark:bg-[#d2b56b]/30" />

              <span
                className="text-sm italic text-[#9b742f]/70 dark:text-[#d2b56b]/60"
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Thoughtfully managed by SAI Events.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}