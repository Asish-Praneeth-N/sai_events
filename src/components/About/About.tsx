"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { ArrowUpRight, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Images are intentionally presentation-only.
 * Timeline data continues to come entirely from LANDING_PAGE_CONFIG.
 *
 * If you later add an image property to TimelineMilestone,
 * simply replace this mapping with node.image.
 */
const TIMELINE_IMAGES = [
  "/images/wedding.png",
  "/images/corporate.png",
  "/images/decor.png",
  "/images/reception.png",
  "/images/fireworks.png",
];

export default function About() {
  const shouldReduceMotion = useReducedMotion();
  const timeline = LANDING_PAGE_CONFIG.about.timeline;

  const fadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: EASE,
      },
    },
  };

  return (
    <section
      id="about"
      className="
        relative
        w-full
        overflow-hidden
        border-t
        border-[#173d2a]/10
        bg-[#f4eadb]
        py-24
        text-[#173d2a]

        dark:border-white/[0.06]
        dark:bg-[#0a0b0a]
        dark:text-[#f4efe6]

        sm:py-32
        lg:py-40
      "
    >
      {/* ================================================================
          EDITORIAL BACKGROUND DETAILS
      ================================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.17]

          dark:opacity-[0.035]
        "
        style={{
          backgroundImage: `
            linear-gradient(rgba(23,61,42,.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,61,42,.16) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-48
          top-20
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#d6b86d]/10
          blur-[140px]

          dark:bg-[#d4af37]/[0.035]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-48
          bottom-[20%]
          h-[460px]
          w-[460px]
          rounded-full
          bg-[#78917f]/10
          blur-[150px]

          dark:bg-[#173d2a]/20
        "
      />

      {/* Large editorial watermark */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[-0.04em]
          top-[2%]
          hidden
          text-[clamp(8rem,20vw,20rem)]
          font-normal
          leading-none
          text-[#173d2a]/[0.025]

          dark:text-white/[0.012]

          lg:block
        "
        style={{
          fontFamily: "Playfair Display, serif",
        }}
      >
        2014
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12">
        {/* ================================================================
            INTRO / EDITORIAL HEADER
        ================================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-10
            border-b
            border-[#173d2a]/15
            pb-16

            dark:border-white/[0.08]

            lg:grid-cols-12
            lg:gap-12
            lg:pb-24
          "
        >
          {/* LEFT LABEL */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-80px",
            }}
            className="lg:col-span-3"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#a67c2e]" />

              <span
                className="
                  text-[12px]
                  font-bold
                  uppercase
                  tracking-[0.24em]
                  text-[#8c6827]

                  dark:text-[#d4af37]
                "
              >
                {LANDING_PAGE_CONFIG.about.tagline}
              </span>
            </div>

            <p
              className="
                mt-6
                hidden
                max-w-[210px]
                text-[12px]
                font-semibold
                uppercase
                leading-[1.8]
                tracking-[0.16em]
                text-[#173d2a]/65

                dark:text-white/55

                lg:block
              "
            >
              A decade of thoughtful
              celebrations, refined
              details and unforgettable
              experiences.
            </p>
          </motion.div>

          {/* MAIN HEADING */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-80px",
            }}
            className="lg:col-span-9"
          >
            <h2
              className="
                max-w-5xl
                text-[clamp(2.8rem,6.2vw,6.4rem)]
                font-normal
                leading-[0.98]
                tracking-[-0.045em]
              "
              style={{
                fontFamily: "Playfair Display, serif",
              }}
            >
              Crafting experiences
              <br />

              <span
                className="
                  italic
                  text-[#98712c]

                  dark:text-[#d4af37]
                "
              >
                since 2014.
              </span>
            </h2>

            <div
              className="
                mt-8
                flex
                flex-col
                gap-7

                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <p
                className="
                  max-w-2xl
                  text-sm
                  font-light
                  leading-[1.9]
                  text-[#173d2a]/60

                  dark:text-white/50

                  sm:text-[15px]
                "
                style={{
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {LANDING_PAGE_CONFIG.about.description}
              </p>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-3
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.24em]
                  text-[#173d2a]/45

                  dark:text-white/35
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-[#a67c2e] dark:text-[#d4af37]" />
                Our Story
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================================================================
            FEATURED OPENING STORY
        ================================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-100px",
          }}
          transition={{
            duration: 0.9,
            ease: EASE,
          }}
          className="
            grid
            grid-cols-1
            gap-8
            py-16

            lg:grid-cols-12
            lg:gap-14
            lg:py-24
          "
        >
          {/* PHOTO COLLAGE */}

          <div
            className="
              relative
              min-h-[430px]

              sm:min-h-[570px]

              lg:col-span-7
              lg:min-h-[650px]
            "
          >
            {/* Main image */}

            <motion.div
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 0.995,
                    }
              }
              transition={{
                duration: 0.5,
                ease: EASE,
              }}
              className="
                absolute
                bottom-0
                left-0
                top-0
                w-[82%]
                overflow-hidden
                bg-[#ded2bd]
                shadow-[0_28px_70px_rgba(60,45,25,0.13)]

                dark:bg-[#111]
                dark:shadow-[0_30px_90px_rgba(0,0,0,0.35)]

                sm:w-[75%]
              "
            >
              <img
                src={TIMELINE_IMAGES[0]}
                alt="Sai Events wedding celebration"
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-[1200ms]

                  hover:scale-[1.025]
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#10291b]/30
                  via-transparent
                  to-transparent
                "
              />

              {/* image number */}

              <span
                className="
                  absolute
                  bottom-5
                  left-5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-white/70
                "
              >
                Archive · 01
              </span>
            </motion.div>

            {/* Floating photograph */}

            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : 20,
                rotate: shouldReduceMotion ? 0 : 3,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                rotate: 3,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.9,
                delay: 0.25,
                ease: EASE,
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: 0,
                      y: -6,
                    }
              }
              className="
                absolute
                right-[1%]
                top-[8%]
                z-10
                w-[42%]
                bg-[#faf4e9]
                p-2
                shadow-[0_20px_55px_rgba(62,45,20,0.18)]

                dark:bg-[#171816]
                dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)]

                sm:p-3
              "
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="/images/decor.png"
                  alt="Sai Events decoration detail"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700

                    hover:scale-105
                  "
                />
              </div>
            </motion.div>

            {/* Small lower photo */}

            <motion.div
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 20,
                rotate: shouldReduceMotion ? 0 : -4,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                rotate: -4,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: EASE,
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: 0,
                      y: -5,
                    }
              }
              className="
                absolute
                bottom-[5%]
                right-[3%]
                z-20
                w-[31%]
                bg-[#faf4e9]
                p-2
                shadow-[0_18px_50px_rgba(62,45,20,0.18)]

                dark:bg-[#171816]

                sm:p-3
              "
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="/images/reception.png"
                  alt="Sai Events reception"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            {/* vertical caption */}

            <span
              className="
                absolute
                -left-3
                top-1/2
                hidden
                -translate-x-1/2
                -translate-y-1/2
                -rotate-90
                text-[7px]
                font-bold
                uppercase
                tracking-[0.34em]
                text-[#173d2a]/30

                dark:text-white/20

                xl:block
              "
            >
              Celebrations / Experiences / Memories
            </span>
          </div>

          {/* STORY COPY */}

          <div
            className="
              flex
              flex-col
              justify-center

              lg:col-span-5
              lg:pl-8
            "
          >
            <div className="flex items-center gap-4">
              <span
                className="
                  text-[4.8rem]
                  font-normal
                  leading-none
                  text-[#a67c2e]/20

                  dark:text-[#d4af37]/15

                  sm:text-[6rem]
                "
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                01
              </span>

              <div className="h-px flex-1 bg-[#173d2a]/15 dark:bg-white/10" />
            </div>

            <span
              className="
                mt-8
                text-[10px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#a67c2e]

                dark:text-[#d4af37]
              "
            >
              {timeline[0]?.year} · Where it began
            </span>

            <h3
              className="
                mt-4
                text-4xl
                font-normal
                leading-[1.05]
                tracking-[-0.025em]

                sm:text-5xl
              "
              style={{
                fontFamily: "Playfair Display, serif",
              }}
            >
              {timeline[0]?.title}
            </h3>

            <p
              className="
                mt-6
                max-w-md
                text-sm
                font-light
                leading-[1.9]
                text-[#173d2a]/60

                dark:text-white/50
              "
              style={{
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {timeline[0]?.description}
            </p>

            <div
              className="
                mt-10
                border-l
                border-[#a67c2e]/35
                pl-5
              "
            >
              <p
                className="
                  max-w-sm
                  text-[11px]
                  italic
                  leading-[1.8]
                  text-[#173d2a]/45

                  dark:text-white/35
                "
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                What started with intimate celebrations
                grew into a philosophy: every detail should
                feel considered, personal and timeless.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================================================================
            HERITAGE CHRONICLE
        ================================================================= */}

        <div
          className="
            border-t
            border-[#173d2a]/15
            pt-16

            dark:border-white/[0.08]

            lg:pt-24
          "
        >
          <div
            className="
              mb-12
              flex
              flex-col
              gap-5

              sm:flex-row
              sm:items-end
              sm:justify-between

              lg:mb-16
            "
          >
            <div>
              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-[#a67c2e]

                  dark:text-[#d4af37]
                "
              >
                The Chronicle
              </span>

              <h3
                className="
                  mt-3
                  text-3xl
                  font-normal
                  tracking-[-0.02em]

                  sm:text-4xl
                "
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                From one celebration
                <span className="italic text-[#98712c] dark:text-[#d4af37]">
                  {" "}to hundreds.
                </span>
              </h3>
            </div>

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-[#173d2a]/35

                dark:text-white/25
              "
            >
              2014 — {timeline[timeline.length - 1]?.year}
            </span>
          </div>

          {/* ==============================================================
              MILESTONES
          =============================================================== */}

          <div>
            {timeline.slice(1).map((node, index) => {
              const itemIndex = index + 1;

              return (
                <motion.article
                  key={`${node.year}-${node.title}`}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 28,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-80px",
                  }}
                  transition={{
                    duration: 0.75,
                    delay: index * 0.06,
                    ease: EASE,
                  }}
                  className="
                    group
                    grid
                    grid-cols-1
                    gap-6
                    border-t
                    border-[#173d2a]/15
                    py-9

                    dark:border-white/[0.08]

                    md:grid-cols-12
                    md:items-center
                    md:gap-8

                    lg:py-12
                  "
                >
                  {/* YEAR */}

                  <div className="md:col-span-2">
                    <span
                      className="
                        text-4xl
                        font-normal
                        text-[#a67c2e]

                        dark:text-[#d4af37]

                        lg:text-5xl
                      "
                      style={{
                        fontFamily: "Playfair Display, serif",
                      }}
                    >
                      {node.year}
                    </span>
                  </div>

                  {/* IMAGE */}

                  <div
                    className="
                      overflow-hidden

                      md:col-span-3
                    "
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#ded4c3] dark:bg-[#111]">
                      <img
                        src={
                          TIMELINE_IMAGES[
                            itemIndex %
                              TIMELINE_IMAGES.length
                          ]
                        }
                        alt={node.title}
                        loading="lazy"
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-[900ms]
                          ease-out

                          group-hover:scale-[1.055]
                        "
                      />
                    </div>
                  </div>

                  {/* COPY */}

                  <div
                    className="
                      md:col-span-6
                      md:pl-4
                    "
                  >
                    <span
                      className="
                        mb-2
                        block
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-[#173d2a]/35

                        dark:text-white/25
                      "
                    >
                      Chapter {String(itemIndex + 1).padStart(2, "0")}
                    </span>

                    <h4
                      className="
                        text-2xl
                        font-normal
                        tracking-[-0.015em]

                        sm:text-3xl
                      "
                      style={{
                        fontFamily: "Playfair Display, serif",
                      }}
                    >
                      {node.title}
                    </h4>

                    <p
                      className="
                        mt-3
                        max-w-xl
                        text-xs
                        font-light
                        leading-[1.85]
                        text-[#173d2a]/55

                        dark:text-white/45

                        sm:text-sm
                      "
                      style={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {node.description}
                    </p>
                  </div>

                  {/* ARROW */}

                  <div
                    className="
                      hidden
                      justify-end

                      md:col-span-1
                      md:flex
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#173d2a]/15
                        text-[#173d2a]/40
                        transition-all
                        duration-500

                        group-hover:border-[#a67c2e]/50
                        group-hover:bg-[#a67c2e]
                        group-hover:text-white

                        dark:border-white/10
                        dark:text-white/30
                        dark:group-hover:border-[#d4af37]
                        dark:group-hover:bg-[#d4af37]
                        dark:group-hover:text-black
                      "
                    >
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* ================================================================
              CLOSING STATEMENT
          ================================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-60px",
            }}
            transition={{
              duration: 0.8,
              ease: EASE,
            }}
            className="
              mt-8
              grid
              grid-cols-1
              gap-8
              border-y
              border-[#173d2a]/15
              py-12

              dark:border-white/[0.08]

              lg:grid-cols-12
              lg:items-center
              lg:py-16
            "
          >
            <div className="lg:col-span-3">
              <span
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-[#a67c2e]

                  dark:text-[#d4af37]
                "
              >
                Still writing the story
              </span>
            </div>

            <div className="lg:col-span-9">
              <p
                className="
                  max-w-4xl
                  text-3xl
                  font-normal
                  leading-[1.2]
                  tracking-[-0.025em]

                  sm:text-4xl
                  lg:text-5xl
                "
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                A decade behind us.
                <span
                  className="
                    italic
                    text-[#98712c]

                    dark:text-[#d4af37]
                  "
                >
                  {" "}
                  Your celebration ahead.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}