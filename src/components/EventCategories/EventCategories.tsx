"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function EventCategories() {
  const shouldReduceMotion = useReducedMotion();
  const categories = LANDING_PAGE_CONFIG.eventCategories;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.8,
        ease: EASE,
      },
    },
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        border-t border-[#173d2c]/10
        bg-[#f3eadf]
        py-24
        text-[#143d2b]
        select-none
        sm:py-32
        lg:py-40

        dark:border-white/[0.07]
        dark:bg-[#11130f]
        dark:text-[#eee5d7]
      "
    >
      {/* ============================================================ */}
      {/* BACKGROUND DETAILS                                           */}
      {/* ============================================================ */}

      <div className="pointer-events-none absolute left-[4.5%] top-0 hidden h-full w-px bg-[#143d2b]/[0.06] xl:block dark:bg-white/[0.04]" />

      <div className="pointer-events-none absolute right-[4.5%] top-0 hidden h-full w-px bg-[#143d2b]/[0.06] xl:block dark:bg-white/[0.04]" />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[3vw]
          top-[1vw]
          hidden
          font-heading
          text-[clamp(9rem,20vw,20rem)]
          italic
          leading-none
          tracking-[-0.08em]
          text-[#143d2b]/[0.018]
          lg:block
          dark:text-white/[0.012]
        "
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Events
      </div>

      <div className="absolute left-[15%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#9b742f]/[0.035] blur-[150px] pointer-events-none dark:bg-[#d4af37]/[0.018]" />

      {/* ============================================================ */}
      {/* CONTENT                                                      */}
      {/* ============================================================ */}

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 sm:px-8 lg:px-[7%]">

        {/* Header */}

        <div className="mb-14 grid grid-cols-1 gap-8 border-b border-[#143d2b]/10 pb-10 lg:mb-16 lg:grid-cols-[1fr_420px] lg:items-end dark:border-white/[0.07]">

          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : -16,
              }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mb-5 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-[#9b742f]/55 dark:bg-[#d4af37]/45" />

              <span className="text-[8px] font-bold uppercase tracking-[0.34em] text-[#9b742f] dark:text-[#d2b56b]">
                Every Occasion
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 20,
              }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.9,
                ease: EASE,
              }}
              className="
                max-w-[760px]
                text-[clamp(3rem,6vw,6.2rem)]
                font-normal
                leading-[0.94]
                tracking-[-0.055em]
                text-[#143d2b]
                dark:text-[#eee5d7]
              "
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Every occasion deserves
              <br />
              <span className="italic text-[#9b742f] dark:text-[#d2b56b]">
                its own story.
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:pb-2"
          >
            <p
              className="max-w-[390px] text-[11px] leading-[1.9] text-[#143d2b]/50 sm:text-xs dark:text-[#eee5d7]/42"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              From intimate beginnings to extraordinary celebrations,
              we design each occasion around the people, atmosphere and
              memories that make it meaningful.
            </p>
          </motion.div>
        </div>

        {/* ========================================================== */}
        {/* EDITORIAL CATEGORY GRID                                    */}
        {/* ========================================================== */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-12
            lg:grid-rows-2
          "
        >
          {categories.map((cat, idx) => {
            const IconComponent =
              (Icons as any)[cat.icon] || Icons.Sparkles;

            const layout =
              idx === 0
                ? "lg:col-span-5 lg:row-span-2 min-h-[520px] lg:min-h-[620px]"
                : idx === 1
                ? "lg:col-span-4 min-h-[290px]"
                : idx === 2
                ? "lg:col-span-3 min-h-[290px]"
                : idx === 3
                ? "lg:col-span-3 min-h-[290px]"
                : "lg:col-span-4 min-h-[290px]";

            return (
              <motion.article
                key={cat.id}
                variants={cardVariants}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -4,
                        transition: {
                          duration: 0.35,
                          ease: EASE,
                        },
                      }
                }
                className={`
                  group
                  relative
                  min-h-[330px]
                  overflow-hidden
                  ${layout}
                `}
              >
                {/* Image */}

                <div className="absolute inset-0">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-[1200ms]
                      ease-out
                      group-hover:scale-[1.055]
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#07130d]/90 via-[#07130d]/25 to-black/[0.04]" />

                  <div className="absolute inset-0 bg-[#9b742f]/0 transition-colors duration-700 group-hover:bg-[#9b742f]/[0.06]" />
                </div>

                {/* Top number */}

                <div className="absolute left-5 right-5 top-5 z-10 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">
                  <span className="text-[8px] font-semibold tracking-[0.25em] text-white/55">
                    0{idx + 1}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center border border-white/25 bg-black/10 text-[#e2c578] backdrop-blur-sm transition-all duration-500 group-hover:border-[#e2c578]/60 group-hover:bg-[#e2c578] group-hover:text-[#142d20]">
                    <IconComponent className="h-3.5 w-3.5 stroke-[1.5]" />
                  </div>
                </div>

                {/* Content */}

                <div className="absolute bottom-0 left-0 z-10 w-full p-5 sm:p-6 lg:p-7">
                  <div className="mb-3 h-px w-8 bg-[#d2b56b]/70 transition-all duration-500 group-hover:w-14" />

                  <h3
                    className={`
                      font-normal
                      text-white
                      ${
                        idx === 0
                          ? "text-3xl sm:text-4xl lg:text-5xl"
                          : "text-2xl lg:text-[2rem]"
                      }
                    `}
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {cat.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#d2b56b]">
                      {cat.count}
                    </span>

                    <ArrowUpRight className="h-4 w-4 translate-y-1 text-white/40 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Inner border */}

                <div className="pointer-events-none absolute inset-3 border border-white/0 transition-colors duration-700 group-hover:border-white/15" />
              </motion.article>
            );
          })}
        </motion.div>

        {/* bottom editorial note */}

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[#143d2b]/10 pt-5 sm:flex-row sm:items-center dark:border-white/[0.07]">
          <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-[#143d2b]/30 dark:text-white/20">
            Weddings · Celebrations · Corporate · Private Occasions
          </span>

          <span
            className="text-sm italic text-[#9b742f]/70 dark:text-[#d2b56b]/65"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Designed individually. Remembered forever.
          </span>
        </div>
      </div>
    </section>
  );
}