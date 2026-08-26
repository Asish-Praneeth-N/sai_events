"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const shouldReduceMotion = useReducedMotion();

  const testimonials = LANDING_PAGE_CONFIG.testimonials;
  const current = testimonials[index];

  /* ================================================================
     AUTO PLAY
  ================================================================= */

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const timer = window.setInterval(() => {
      setDirection(1);

      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  /* ================================================================
     NAVIGATION
  ================================================================= */

  const handlePrev = () => {
    setDirection(-1);

    setIndex(
      (prev) =>
        (prev - 1 + testimonials.length) %
        testimonials.length
    );
  };

  const handleNext = () => {
    setDirection(1);

    setIndex(
      (prev) => (prev + 1) % testimonials.length
    );
  };

  const handleDotClick = (idx: number) => {
    if (idx === index) return;

    setDirection(idx > index ? 1 : -1);
    setIndex(idx);
  };

  /* ================================================================
     ANIMATION
  ================================================================= */

  const contentVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion
        ? 0
        : dir > 0
        ? 34
        : -34,
      y: shouldReduceMotion ? 0 : 10,
    }),

    center: {
      opacity: 1,
      x: 0,
      y: 0,

      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.75,
        ease: EASE,
      },
    },

    exit: (dir: number) => ({
      opacity: 0,

      x: shouldReduceMotion
        ? 0
        : dir > 0
        ? -28
        : 28,

      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.4,
        ease: EASE,
      },
    }),
  };

  const imageVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.035,
      x: shouldReduceMotion
        ? 0
        : dir > 0
        ? 20
        : -20,
    }),

    center: {
      opacity: 1,
      scale: 1,
      x: 0,

      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.9,
        ease: EASE,
      },
    },

    exit: {
      opacity: 0,

      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.4,
      },
    },
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        border-t
        border-[#173d2c]/10
        bg-[#f4ebdf]
        py-24
        text-[#143d2b]
        select-none

        sm:py-32
        lg:py-40

        dark:border-white/[0.07]
        dark:bg-[#10120f]
        dark:text-[#eee5d7]
      "
    >
      {/* ============================================================
          BACKGROUND ARCHITECTURE
      ============================================================ */}

      <div
        className="
          pointer-events-none
          absolute
          left-[4.5%]
          top-0
          hidden
          h-full
          w-px
          bg-[#143d2b]/[0.06]

          xl:block

          dark:bg-white/[0.04]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[4.5%]
          top-0
          hidden
          h-full
          w-px
          bg-[#143d2b]/[0.06]

          xl:block

          dark:bg-white/[0.04]
        "
      />

      {/* Background giant quote */}

      <Quote
        strokeWidth={0.6}
        className="
          pointer-events-none
          absolute
          -right-16
          top-14
          hidden
          h-[340px]
          w-[340px]
          text-[#143d2b]/[0.025]

          lg:block

          dark:text-white/[0.018]
        "
      />

      {/* Warm ambient lighting */}

      <div
        className="
          pointer-events-none
          absolute
          left-[20%]
          top-[25%]
          h-[450px]
          w-[450px]
          rounded-full
          bg-[#9b742f]/[0.035]
          blur-[150px]

          dark:bg-[#d4af37]/[0.018]
        "
      />

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1380px]
          px-6

          sm:px-8
          lg:px-[7%]
        "
      >
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div
          className="
            mb-14
            grid
            grid-cols-1
            gap-8
            border-b
            border-[#143d2b]/10
            pb-10

            lg:mb-20
            lg:grid-cols-[1fr_350px]
            lg:items-end

            dark:border-white/[0.07]
          "
        >
          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : -15,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                ease: EASE,
              }}
              className="mb-5 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-[#9b742f]/55 dark:bg-[#d2b56b]/40" />

              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.24em]
                  text-[#9b742f]

                  dark:text-[#d2b56b]
                "
              >
                Kind Words
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion
                  ? 0.2
                  : 0.9,
                ease: EASE,
              }}
              className="
                max-w-[780px]
                text-[clamp(3.1rem,6vw,6.3rem)]
                font-normal
                leading-[0.94]
                tracking-[-0.055em]
                text-[#143d2b]

                dark:text-[#eee5d7]
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              Stories from those
              <br />

              <span
                className="
                  italic
                  text-[#9b742f]

                  dark:text-[#d2b56b]
                "
              >
                who celebrated with us.
              </span>
            </motion.h2>
          </div>

          <p
            className="
              max-w-[340px]
              text-[11px]
              leading-[1.9]
              text-[#143d2b]/50

              sm:text-xs

              dark:text-[#eee5d7]/42
            "
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            The details eventually become photographs.
            What matters most is how the celebration felt
            to the people who lived it.
          </p>
        </div>

        {/* ==========================================================
            TESTIMONIAL EDITORIAL SPREAD
        ========================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-10

            lg:grid-cols-12
            lg:gap-16

            xl:gap-24
          "
        >
          {/* ========================================================
              CLIENT IMAGE
          ======================================================== */}

          <div
            className="
              relative
              min-h-[420px]
              overflow-hidden

              sm:min-h-[520px]

              lg:col-span-5
              lg:min-h-[620px]
            "
          >
            <AnimatePresence
              custom={direction}
              mode="wait"
            >
              <motion.div
                key={`image-${index}`}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                <img
                  src={current.image}
                  alt={current.name}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#07130d]/65
                    via-transparent
                    to-black/[0.03]
                  "
                />
              </motion.div>
            </AnimatePresence>

            {/* Inner luxury frame */}

            <div
              className="
                pointer-events-none
                absolute
                inset-4
                border
                border-white/20

                sm:inset-5
              "
            />

            {/* Image number */}

            <div
              className="
                absolute
                left-8
                top-8
                z-10

                sm:left-10
                sm:top-10
              "
            >
              <span
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.28em]
                  text-white/65
                "
              >
                Client Story
              </span>
            </div>

            {/* Image footer */}

            <div
              className="
                absolute
                bottom-8
                left-8
                right-8
                z-10
                flex
                items-end
                justify-between

                sm:bottom-10
                sm:left-10
                sm:right-10
              "
            >
              <div>
                <span
                  className="
                    block
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-[#e2c578]
                  "
                >
                  SAI Events
                </span>

                <span
                  className="
                    mt-1
                    block
                    text-xs
                    text-white/55
                  "
                >
                  Celebrations remembered.
                </span>
              </div>

              <span
                className="
                  text-4xl
                  italic
                  text-white

                  sm:text-5xl
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Offset decorative border */}

            <div
              className="
                absolute
                -bottom-3
                -right-3
                -z-10
                h-[70%]
                w-[70%]
                border
                border-[#9b742f]/25

                dark:border-[#d2b56b]/15
              "
            />
          </div>

          {/* ========================================================
              TESTIMONIAL CONTENT
          ======================================================== */}

          <div
            className="
              flex
              min-h-[520px]
              flex-col
              justify-center

              lg:col-span-7
              lg:min-h-[620px]
            "
          >
            <AnimatePresence
              custom={direction}
              mode="wait"
            >
              <motion.div
                key={`content-${index}`}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Rating */}

                <div className="mb-8 flex items-center gap-4">
                  <div className="flex gap-1">
                    {Array.from({
                      length: current.rating,
                    }).map((_, i) => (
                      <Star
                        key={i}
                        className="
                          h-3.5
                          w-3.5
                          fill-[#9b742f]
                          text-[#9b742f]

                          dark:fill-[#d2b56b]
                          dark:text-[#d2b56b]
                        "
                      />
                    ))}
                  </div>

                  <span
                    className="
                      h-px
                      w-10
                      bg-[#143d2b]/20

                      dark:bg-white/15
                    "
                  />

                  <span
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.24em]
                      text-[#143d2b]/40

                      dark:text-white/30
                    "
                  >
                    Client Experience
                  </span>
                </div>

                {/* Quote icon */}

                <Quote
                  strokeWidth={1}
                  className="
                    mb-6
                    h-8
                    w-8
                    text-[#9b742f]/50

                    dark:text-[#d2b56b]/45
                  "
                />

                {/* Main testimonial */}

                <blockquote
                  className="
                    max-w-[700px]
                    text-[clamp(1.8rem,3.2vw,3.7rem)]
                    font-normal
                    italic
                    leading-[1.23]
                    tracking-[-0.025em]
                    text-[#143d2b]

                    dark:text-[#eee5d7]
                  "
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  “{current.content}”
                </blockquote>

                {/* Author */}

                <div
                  className="
                    mt-10
                    border-t
                    border-[#143d2b]/10
                    pt-6

                    dark:border-white/[0.08]
                  "
                >
                  <h4
                    className="
                      text-sm
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[#143d2b]

                      dark:text-[#eee5d7]
                    "
                  >
                    {current.name}
                  </h4>

                  <span
                    className="
                      mt-1.5
                      block
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.22em]
                      text-[#9b742f]

                      dark:text-[#d2b56b]
                    "
                  >
                    {current.role}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ======================================================
                NAVIGATION
            ====================================================== */}

            <div
              className="
                mt-12
                flex
                flex-col
                gap-7
                border-t
                border-[#143d2b]/10
                pt-7

                sm:flex-row
                sm:items-center
                sm:justify-between

                dark:border-white/[0.08]
              "
            >
              {/* Progress */}

              <div className="flex flex-1 items-center gap-3">
                <span
                  className="
                    min-w-[20px]
                    text-[8px]
                    font-bold
                    tracking-[0.18em]
                    text-[#9b742f]

                    dark:text-[#d2b56b]
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div
                  className="
                    flex
                    w-full
                    max-w-[220px]
                    items-center
                    gap-1.5
                  "
                >
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleDotClick(idx)
                      }
                      aria-label={`Go to testimonial ${
                        idx + 1
                      }`}
                      className="
                        relative
                        h-5
                        flex-1
                        cursor-pointer
                      "
                    >
                      <span
                        className={`
                          absolute
                          left-0
                          top-1/2
                          h-px
                          w-full
                          -translate-y-1/2
                          transition-all
                          duration-500

                          ${
                            index === idx
                              ? "bg-[#9b742f] dark:bg-[#d2b56b]"
                              : "bg-[#143d2b]/15 hover:bg-[#143d2b]/30 dark:bg-white/10 dark:hover:bg-white/25"
                          }
                        `}
                      />
                    </button>
                  ))}
                </div>

                <span
                  className="
                    text-[8px]
                    font-semibold
                    tracking-[0.18em]
                    text-[#143d2b]/30

                    dark:text-white/20
                  "
                >
                  {String(testimonials.length).padStart(
                    2,
                    "0"
                  )}
                </span>
              </div>

              {/* Arrows */}

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="
                    group
                    flex
                    h-12
                    w-12
                    cursor-pointer
                    items-center
                    justify-center
                    border
                    border-[#143d2b]/15
                    text-[#143d2b]/60
                    transition-all
                    duration-300

                    hover:border-[#9b742f]
                    hover:bg-[#9b742f]
                    hover:text-white

                    dark:border-white/10
                    dark:text-white/50
                    dark:hover:border-[#d2b56b]
                    dark:hover:bg-[#d2b56b]
                    dark:hover:text-[#102b1e]
                  "
                >
                  <ArrowLeft
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300

                      group-hover:-translate-x-1
                    "
                  />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="
                    group
                    flex
                    h-12
                    w-12
                    cursor-pointer
                    items-center
                    justify-center
                    border-y
                    border-r
                    border-[#143d2b]/15
                    text-[#143d2b]/60
                    transition-all
                    duration-300

                    hover:border-[#9b742f]
                    hover:bg-[#9b742f]
                    hover:text-white

                    dark:border-white/10
                    dark:text-white/50
                    dark:hover:border-[#d2b56b]
                    dark:hover:bg-[#d2b56b]
                    dark:hover:text-[#102b1e]
                  "
                >
                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}