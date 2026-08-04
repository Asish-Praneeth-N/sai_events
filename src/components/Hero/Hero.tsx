"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";

import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { CINEMATIC_EASE } from "@/lib/motionVariants";

export default function Hero() {
  const [currentBg, setCurrentBg] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const images = LANDING_PAGE_CONFIG.hero.backgroundImages;
  const titleWords = LANDING_PAGE_CONFIG.hero.title.split(" ");

  /* -------------------------------------------------------------------------- */
  /*                         EXISTING SLIDESHOW LOGIC                           */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [images.length]);

  const getImage = (offset: number) => {
    if (!images.length) return "";
    return images[(currentBg + offset) % images.length];
  };

  /* -------------------------------------------------------------------------- */
  /*                                  MOTION                                    */
  /* -------------------------------------------------------------------------- */

  const titleContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const wordReveal: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 50,
      rotate: shouldReduceMotion ? 0 : 1.5,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.95,
        ease: CINEMATIC_EASE,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.9,
        ease: CINEMATIC_EASE,
      },
    },
  };

  const imageReveal: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.96,
      y: shouldReduceMotion ? 0 : 35,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 1.05,
        delay: shouldReduceMotion ? 0 : 0.3,
        ease: CINEMATIC_EASE,
      },
    },
  };

  return (
    <section
      className="
        relative min-h-[100svh] w-full overflow-hidden
        bg-[#e8ceb3]
        px-3 py-4
        sm:px-5 sm:py-5
        lg:px-7 lg:py-7

        dark:bg-[#11130f]
      "
    >
      {/* ==================================================================== */}
      {/*                         EDITORIAL FRAME                              */}
      {/* ==================================================================== */}

      <div
        className="
          relative mx-auto
          min-h-[calc(100svh-2rem)]
          w-full max-w-[1560px]
          overflow-hidden

          border border-[#173d2c]/10
          bg-[#f7f0e6]

          shadow-[0_24px_80px_rgba(70,45,22,0.09)]

          dark:border-white/[0.08]
          dark:bg-[#191b17]
          dark:shadow-[0_24px_80px_rgba(0,0,0,0.3)]
        "
      >
        {/* ================================================================== */}
        {/*                         EDITORIAL GUIDES                           */}
        {/* ================================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute bottom-0 left-[4.5%] top-0
            hidden w-px bg-[#173d2c]/10
            md:block dark:bg-white/[0.06]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute bottom-0 right-[4.5%] top-0
            hidden w-px bg-[#173d2c]/10
            md:block dark:bg-white/[0.06]
          "
        />

        {/* subtle top line */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute left-0 right-0 top-[88px]
            hidden h-px bg-[#173d2c]/10
            md:block dark:bg-white/[0.06]
          "
        />

        {/* ================================================================== */}
        {/*                      BACKGROUND TYPOGRAPHY                         */}
        {/* ================================================================== */}

        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.5,
            delay: shouldReduceMotion ? 0 : 0.8,
          }}
          className="
            pointer-events-none
            absolute -right-8 top-[17%]
            hidden select-none

            font-heading
            text-[clamp(8rem,16vw,17rem)]
            italic
            leading-none
            tracking-[-0.08em]
            text-[#173d2c]/[0.025]

            xl:block

            dark:text-white/[0.018]
          "
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          SAI
        </motion.span>

        {/* ================================================================== */}
        {/*                           HERO CONTENT                             */}
        {/* ================================================================== */}

        <div
          className="
            relative z-10
            px-6 pb-8 pt-20

            sm:px-10 sm:pt-24

            md:px-[7%] md:pb-10 md:pt-28

            lg:px-[7.5%]
          "
        >
          {/* ================================================================ */}
          {/*                          TOP LABEL                               */}
          {/* ================================================================ */}

          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.75,
              ease: CINEMATIC_EASE,
            }}
            className="
              mb-5 flex items-center justify-center gap-3
              md:justify-start
            "
          >
            <span className="h-px w-9 bg-[#173d2c]/45 dark:bg-[#d2b56b]/45" />

            <Sparkles className="h-3 w-3 text-[#a17a34] dark:text-[#d2b56b]" />

            <span
              className="
                text-[9px] font-semibold uppercase
                tracking-[0.32em]
                text-[#173d2c]/65
                dark:text-[#d9c88d]/75
              "
            >
              Sai Events · Curated Celebrations
            </span>
          </motion.div>

          {/* ================================================================ */}
          {/*                            TITLE                                 */}
          {/* ================================================================ */}

          <motion.h1
            variants={titleContainer}
            initial="hidden"
            animate="visible"
            className="
              relative z-30
              max-w-[1300px]

              text-center
              font-heading
              text-[clamp(3.15rem,7.3vw,7.4rem)]
              font-normal
              leading-[0.93]
              tracking-[-0.055em]
              text-[#143d2b]

              md:text-left

              dark:text-[#f0e8db]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            <span className="flex flex-wrap justify-center gap-x-[0.18em] md:justify-start">
              {titleWords.map((word, idx) => {
                const highlight = idx >= titleWords.length - 2;

                return (
                  <span
                    key={`${word}-${idx}`}
                    className="inline-block overflow-hidden pb-[0.12em]"
                  >
                    <motion.span
                      variants={wordReveal}
                      className={`
                        inline-block
                        ${
                          highlight
                            ? "italic text-[#9a742e] dark:text-[#d2b56b]"
                            : ""
                        }
                      `}
                    >
                      {word}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          </motion.h1>

          {/* ================================================================ */}
          {/*                       MAIN EDITORIAL GRID                         */}
          {/* ================================================================ */}

          <div
            className="
              relative
              mt-7
              grid grid-cols-1 gap-10

              md:mt-9
              md:grid-cols-[1.05fr_0.95fr]
              md:gap-10

              lg:grid-cols-[1.06fr_0.94fr]
              lg:gap-14

              xl:gap-16
            "
          >
            {/* ============================================================== */}
            {/*                         LEFT COLUMN                            */}
            {/* ============================================================== */}

            <div className="relative">
              {/* Editorial number */}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: shouldReduceMotion ? 0 : 0.65,
                  ease: CINEMATIC_EASE,
                }}
                className="
                  absolute -left-2 top-7 z-30
                  hidden -translate-x-full
                  flex-col items-center

                  xl:flex
                "
              >
                <span
                  className="
                    font-heading text-2xl italic
                    text-[#a17a34]
                    dark:text-[#d2b56b]
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  01
                </span>

                <span className="my-3 h-14 w-px bg-[#173d2c]/20 dark:bg-white/15" />

                <span
                  className="
                    [writing-mode:vertical-rl]
                    rotate-180
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-[#173d2c]/45

                    dark:text-white/35
                  "
                >
                  Celebrations
                </span>
              </motion.div>

              {/* ============================================================ */}
              {/*                         MAIN IMAGE                           */}
              {/* ============================================================ */}

              <motion.div
                variants={imageReveal}
                initial="hidden"
                animate="visible"
                className="
                  group relative
                  mx-auto
                  w-full
                  max-w-[680px]

                  md:mx-0
                "
              >
                <div
                  className="
                    relative
                    aspect-[1/0.92]
                    overflow-hidden
                    bg-[#ded5c9]

                    md:aspect-[1/1.02]

                    lg:aspect-[1/0.93]
                  "
                >
                  <AnimatePresence initial={false} mode="sync">
                    <motion.img
                      key={`main-${currentBg}`}
                      src={getImage(0)}
                      alt="SAI Events celebration"
                      initial={{
                        opacity: 0,
                        scale: shouldReduceMotion ? 1 : 1.06,
                      }}
                      animate={{
                        opacity: 1,
                        scale: shouldReduceMotion ? 1 : 1.015,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      transition={{
                        opacity: {
                          duration: shouldReduceMotion ? 0.2 : 1.1,
                          ease: "easeInOut",
                        },
                        scale: {
                          duration: shouldReduceMotion ? 0.2 : 6,
                          ease: "easeOut",
                        },
                      }}
                      className="
                        absolute inset-0
                        h-full w-full
                        object-cover

                        transition-transform
                        duration-[1600ms]
                        ease-out

                        group-hover:scale-[1.035]
                      "
                    />
                  </AnimatePresence>

                  {/* photography wash */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-0
                      bg-gradient-to-t
                      from-[#1b2f24]/10
                      via-transparent
                      to-[#f2d9ba]/[0.04]

                      dark:from-black/20
                    "
                  />

                  {/* image corner label */}

                  <div
                    className="
                      absolute bottom-0 right-0
                      bg-[#f7f0e6]/95
                      px-4 py-3
                      backdrop-blur-sm

                      dark:bg-[#191b17]/95
                    "
                  >
                    <p
                      className="
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-[0.25em]
                        text-[#173d2c]/60

                        dark:text-[#eee5d7]/55
                      "
                    >
                      Moments, beautifully made
                    </p>
                  </div>
                </div>

                {/* ========================================================== */}
                {/*                    FLOATING POLAROID                       */}
                {/* ========================================================== */}

                {images.length > 1 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      rotate: shouldReduceMotion ? -5 : -10,
                      y: shouldReduceMotion ? 0 : 30,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: -5,
                      y: 0,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0.2 : 1,
                      delay: shouldReduceMotion ? 0 : 0.8,
                      ease: CINEMATIC_EASE,
                    }}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            rotate: -2,
                            y: -7,
                            scale: 1.03,
                          }
                    }
                    className="
                      absolute
                      -bottom-7
                      left-[6%]
                      z-30

                      w-[29%]
                      max-w-[175px]

                      bg-[#fffaf3]
                      p-2
                      pb-5

                      shadow-[0_18px_45px_rgba(49,31,15,0.2)]

                      sm:-bottom-9
                      sm:p-2.5
                      sm:pb-6
                    "
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <AnimatePresence initial={false} mode="sync">
                        <motion.img
                          key={`mini-${currentBg}`}
                          src={getImage(1)}
                          alt=""
                          aria-hidden="true"
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.2 : 0.8,
                          }}
                          className="h-full w-full object-cover"
                        />
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================== */}
                {/*                      ROUND SEAL                            */}
                {/* ========================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: shouldReduceMotion ? 1 : 0.75,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: shouldReduceMotion ? 0 : 1,
                    ease: CINEMATIC_EASE,
                  }}
                  className="
                    absolute
                    -right-7
                    -top-7
                    z-30

                    hidden
                    h-[94px]
                    w-[94px]
                    items-center
                    justify-center

                    rounded-full
                    border
                    border-[#173d2c]/15
                    bg-[#f7f0e6]/95

                    shadow-[0_10px_35px_rgba(56,36,17,0.1)]
                    backdrop-blur-sm

                    lg:flex

                    dark:border-white/10
                    dark:bg-[#191b17]/95
                  "
                >
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            rotate: 360,
                          }
                    }
                    transition={{
                      duration: 24,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="
                      absolute inset-[7px]
                      rounded-full
                      border border-dashed
                      border-[#a17a34]/35
                    "
                  />

                  <div className="text-center">
                    <Heart
                      className="
                        mx-auto mb-1
                        h-4 w-4
                        stroke-[1.4]
                        text-[#9a742e]
                        dark:text-[#d2b56b]
                      "
                    />

                    <span
                      className="
                        block
                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-[#173d2c]/70

                        dark:text-[#eee5d7]/65
                      "
                    >
                      SAI
                    </span>

                    <span
                      className="
                        block
                        text-[6px]
                        uppercase
                        tracking-[0.14em]
                        text-[#173d2c]/45

                        dark:text-white/35
                      "
                    >
                      Events
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* ============================================================ */}
              {/*                        TRUST STRIP                           */}
              {/* ============================================================ */}

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.95,
                }}
                className="
                  mt-14
                  grid grid-cols-3
                  border-y
                  border-[#173d2c]/10

                  dark:border-white/[0.08]
                "
              >
                <div className="py-4 pr-3">
                  <span
                    className="
                      block
                      font-heading
                      text-xl
                      italic
                      text-[#173d2c]

                      dark:text-[#eee5d7]
                    "
                    style={{
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    360°
                  </span>

                  <span
                    className="
                      mt-1 block
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[#173d2c]/45

                      dark:text-white/35
                    "
                  >
                    Event Planning
                  </span>
                </div>

                <div
                  className="
                    border-x
                    border-[#173d2c]/10
                    px-4 py-4

                    dark:border-white/[0.08]
                  "
                >
                  <span
                    className="
                      block
                      font-heading
                      text-xl
                      italic
                      text-[#173d2c]

                      dark:text-[#eee5d7]
                    "
                    style={{
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    One
                  </span>

                  <span
                    className="
                      mt-1 block
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[#173d2c]/45

                      dark:text-white/35
                    "
                  >
                    Dedicated Team
                  </span>
                </div>

                <div className="py-4 pl-4">
                  <span
                    className="
                      block
                      font-heading
                      text-xl
                      italic
                      text-[#173d2c]

                      dark:text-[#eee5d7]
                    "
                    style={{
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    Every
                  </span>

                  <span
                    className="
                      mt-1 block
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[#173d2c]/45

                      dark:text-white/35
                    "
                  >
                    Detail Managed
                  </span>
                </div>
              </motion.div>
            </div>

            {/* ============================================================== */}
            {/*                         RIGHT COLUMN                           */}
            {/* ============================================================== */}

            <div
              className="
                relative
                flex flex-col
                md:pt-2
              "
            >
              {/* ============================================================ */}
              {/*                    TOP COLLAGE AREA                          */}
              {/* ============================================================ */}

              <div
                className="
                  relative
                  grid
                  grid-cols-[0.9fr_1.1fr]
                  items-start
                  gap-4

                  sm:gap-5
                "
              >
                {/* editorial quote */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: shouldReduceMotion ? 0 : 0.6,
                    ease: CINEMATIC_EASE,
                  }}
                  className="
                    relative
                    pt-7
                  "
                >
                  <Star
                    className="
                      mb-4
                      h-3.5 w-3.5
                      fill-[#a17a34]
                      stroke-[#a17a34]

                      dark:fill-[#d2b56b]
                      dark:stroke-[#d2b56b]
                    "
                  />

                  <p
                    className="
                      max-w-[210px]
                      font-heading
                      text-[clamp(1.15rem,2vw,1.6rem)]
                      italic
                      leading-[1.25]
                      text-[#173d2c]/75

                      dark:text-[#eee5d7]/65
                    "
                    style={{
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    “Not just an event.
                    <br />
                    A memory designed
                    <br />
                    around you.”
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <span className="h-px w-6 bg-[#a17a34]/45" />

                    <span
                      className="
                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.22em]
                        text-[#173d2c]/40

                        dark:text-white/30
                      "
                    >
                      Our Philosophy
                    </span>
                  </div>
                </motion.div>

                {/* top image */}

                {images.length > 2 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      rotate: shouldReduceMotion ? 0 : 3,
                      y: shouldReduceMotion ? 0 : -25,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 2,
                      y: 0,
                    }}
                    transition={{
                      duration: 1,
                      delay: shouldReduceMotion ? 0 : 0.55,
                      ease: CINEMATIC_EASE,
                    }}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            rotate: 0,
                            y: -5,
                          }
                    }
                    className="
                      relative
                      ml-auto
                      w-full
                      max-w-[270px]

                      bg-[#fffaf3]
                      p-2
                      pb-5

                      shadow-[0_18px_45px_rgba(49,31,15,0.12)]
                    "
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <AnimatePresence initial={false} mode="sync">
                        <motion.img
                          key={`top-${currentBg}`}
                          src={getImage(2)}
                          alt=""
                          aria-hidden="true"
                          initial={{
                            opacity: 0,
                            scale: shouldReduceMotion ? 1 : 1.04,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.2 : 0.85,
                          }}
                          className="
                            h-full w-full
                            object-cover
                          "
                        />
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ============================================================ */}
              {/*                         TEXT AREA                            */}
              {/* ============================================================ */}

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.7,
                }}
                className="
                  relative
                  mt-7
                  max-w-[560px]

                  md:ml-[4%]
                  lg:mt-8
                "
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.3em]
                      text-[#a17a34]

                      dark:text-[#d2b56b]
                    "
                  >
                    Thoughtfully Planned
                  </span>

                  <span className="h-px flex-1 bg-[#173d2c]/10 dark:bg-white/[0.08]" />
                </div>

                <p
                  className="
                    text-[13px]
                    font-normal
                    leading-[1.85]
                    text-[#17392b]/75

                    sm:text-[14px]

                    lg:text-[15px]

                    dark:text-[#eee5d7]/60
                  "
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {LANDING_PAGE_CONFIG.hero.subheading}
                </p>

                {/* ========================================================== */}
                {/*                           CTAs                             */}
                {/* ========================================================== */}

                <div
                  className="
                    mt-6
                    flex
                    flex-col
                    gap-3

                    sm:flex-row
                  "
                >
                  <motion.a
                    href="#finale"
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -3,
                          }
                    }
                    whileTap={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 0.98,
                          }
                    }
                    className="
                      group
                      relative
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2

                      overflow-hidden
                      bg-[#143d2b]

                      px-6 py-3.5

                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-[#fffaf1]

                      shadow-[0_10px_28px_rgba(20,61,43,0.14)]

                      sm:w-auto

                      dark:bg-[#d2b56b]
                      dark:text-[#161812]
                    "
                  >
                    <span
                      className="
                        absolute
                        inset-y-0
                        -left-[60%]
                        w-[45%]
                        skew-x-[-20deg]

                        bg-gradient-to-r
                        from-transparent
                        via-white/20
                        to-transparent

                        transition-[left]
                        duration-700

                        group-hover:left-[120%]
                      "
                    />

                    <Calendar className="relative z-10 h-3.5 w-3.5" />

                    <span className="relative z-10">
                      Book Your Event
                    </span>
                  </motion.a>

                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -3,
                          }
                    }
                    whileTap={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 0.98,
                          }
                    }
                    className="w-full sm:w-auto"
                  >
                    <Link
                      href="/register?role=vendor"
                      className="
                        group
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2

                        border
                        border-[#143d2b]/25

                        px-6 py-3.5

                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.2em]
                        text-[#143d2b]

                        transition-all
                        duration-300

                        hover:border-[#143d2b]/60
                        hover:bg-[#143d2b]/[0.035]

                        dark:border-[#eee5d7]/20
                        dark:text-[#eee5d7]
                        dark:hover:border-[#d2b56b]/50
                      "
                    >
                      Become a Vendor

                      <ArrowRight
                        className="
                          h-3.5 w-3.5
                          text-[#a17a34]
                          transition-transform
                          duration-300
                          group-hover:translate-x-1

                          dark:text-[#d2b56b]
                        "
                      />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* ============================================================ */}
              {/*                     BOTTOM PHOTO STORY                       */}
              {/* ============================================================ */}

              <div
                className="
                  relative
                  mt-8
                  grid
                  grid-cols-[1.25fr_0.75fr]
                  items-end
                  gap-5
                "
              >
                {/* landscape image */}

                {images.length > 3 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 1,
                      delay: shouldReduceMotion ? 0 : 0.9,
                      ease: CINEMATIC_EASE,
                    }}
                    className="
                      group
                      relative
                      overflow-hidden
                    "
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <AnimatePresence initial={false} mode="sync">
                        <motion.img
                          key={`bottom-${currentBg}`}
                          src={getImage(3)}
                          alt=""
                          aria-hidden="true"
                          initial={{
                            opacity: 0,
                            scale: shouldReduceMotion ? 1 : 1.04,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.2 : 0.9,
                          }}
                          className="
                            h-full w-full
                            object-cover

                            transition-transform
                            duration-[1400ms]

                            group-hover:scale-[1.04]
                          "
                        />
                      </AnimatePresence>
                    </div>

                    <div
                      className="
                        absolute
                        bottom-3 left-3
                        bg-[#f7f0e6]/90
                        px-3 py-2
                        backdrop-blur-sm

                        dark:bg-[#191b17]/90
                      "
                    >
                      <span
                        className="
                          text-[7px]
                          font-semibold
                          uppercase
                          tracking-[0.2em]
                          text-[#173d2c]/60

                          dark:text-[#eee5d7]/55
                        "
                      >
                        Designed with intention
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* right decorative statement */}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 1,
                    delay: shouldReduceMotion ? 0 : 1.05,
                  }}
                  className="
                    flex
                    h-full
                    min-h-[100px]
                    flex-col
                    justify-between
                    border-l
                    border-[#173d2c]/10
                    pl-5

                    dark:border-white/[0.08]
                  "
                >
                  <div>
                    <span
                      className="
                        block
                        font-heading
                        text-3xl
                        italic
                        leading-none
                        text-[#a17a34]

                        dark:text-[#d2b56b]
                      "
                      style={{
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      &
                    </span>

                    <p
                      className="
                        mt-2
                        max-w-[120px]
                        text-[8px]
                        font-semibold
                        uppercase
                        leading-[1.7]
                        tracking-[0.18em]
                        text-[#173d2c]/45

                        dark:text-white/35
                      "
                    >
                      Your vision.
                      <br />
                      Our craft.
                      <br />
                      One celebration.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-1.5">
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#a17a34]/70" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#a17a34]/35" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#a17a34]/20" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/*                       BOTTOM EDITORIAL BAR                        */}
          {/* ================================================================ */}

          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
              delay: shouldReduceMotion ? 0 : 1.15,
            }}
            className="
              mt-12
              flex
              items-center
              justify-between
              gap-5

              border-t
              border-[#173d2c]/10
              pt-4

              dark:border-white/[0.08]
            "
          >
            <div className="flex items-center gap-3">
              <span className="h-1 w-1 rotate-45 bg-[#a17a34]" />

              <span
                className="
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#173d2c]/40

                  sm:text-[8px]

                  dark:text-white/30
                "
              >
                Weddings · Celebrations · Experiences
              </span>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#173d2c]/40

                  dark:text-white/30
                "
              >
                Designed · Managed · Delivered
              </span>

              <span className="h-px w-8 bg-[#173d2c]/20 dark:bg-white/15" />

              <span
                className="
                  font-heading
                  text-sm
                  italic
                  text-[#173d2c]/65

                  dark:text-[#d2b56b]/75
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                SAI Events
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}