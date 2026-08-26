"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import * as Icons from "lucide-react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               MOTION CONFIG                                */
/* -------------------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const steps = LANDING_PAGE_CONFIG.howItWorks;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const stepVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.85,
        ease: EASE,
      },
    },
  };

  return (
    <section
      id="journey"
      className="
        relative
        w-full
        overflow-hidden
        border-t
        border-[#173d2c]/10
        bg-[#f3eadf]
        py-24
        text-[#143d2b]
        select-none

        sm:py-32
        lg:py-40

        dark:border-white/[0.07]
        dark:bg-[#12140f]
        dark:text-[#eee5d7]
      "
    >
      {/* ==================================================================== */}
      {/*                         AMBIENT BACKGROUND                           */}
      {/* ==================================================================== */}

      {/* soft gold light */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-[12%]
          top-[20%]

          h-[520px]
          w-[520px]

          rounded-full

          bg-[#c49a4a]/[0.045]

          blur-[150px]

          dark:bg-[#d4af37]/[0.025]
        "
      />

      {/* second ambient field */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[12%]
          bottom-[12%]

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#143d2b]/[0.025]

          blur-[160px]

          dark:bg-[#9a742f]/[0.025]
        "
      />

      {/* giant JOURNEY watermark */}

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 1.5,
        }}
        className="
          pointer-events-none
          absolute
          -right-[3vw]
          top-[7%]

          hidden

          font-heading
          text-[clamp(8rem,17vw,18rem)]
          italic
          leading-none
          tracking-[-0.08em]

          text-[#143d2b]/[0.022]

          lg:block

          dark:text-white/[0.014]
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        Journey
      </motion.div>

      {/* decorative vertical edge lines */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-[4.5%]
          top-0

          hidden
          w-px

          bg-[#143d2b]/[0.07]

          xl:block

          dark:bg-white/[0.04]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          right-[4.5%]
          top-0

          hidden
          w-px

          bg-[#143d2b]/[0.07]

          xl:block

          dark:bg-white/[0.04]
        "
      />

      {/* ==================================================================== */}
      {/*                              CONTENT                                 */}
      {/* ==================================================================== */}

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
        {/* ================================================================== */}
        {/*                              HEADER                                */}
        {/* ================================================================== */}

        <div
          className="
            grid
            grid-cols-1

            gap-8

            border-b
            border-[#143d2b]/10

            pb-14

            md:grid-cols-[1fr_0.7fr]
            md:items-end

            lg:pb-18

            dark:border-white/[0.07]
          "
        >
          {/* left heading */}

          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : -18,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.5,
              }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.7,
                ease: EASE,
              }}
              className="
                mb-5
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  h-px
                  w-8

                  bg-[#9b742f]/50

                  dark:bg-[#d4af37]/45
                "
              />

              <Sparkles
                className="
                  h-3
                  w-3

                  text-[#9b742f]

                  dark:text-[#d4af37]
                "
              />

              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.24em]

                  text-[#9b742f]

                  dark:text-[#d4af37]
                "
              >
                Your Journey
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 22,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.4,
              }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.9,
                ease: EASE,
              }}
              className="
                max-w-[760px]

                font-heading

                text-[clamp(3.1rem,6.5vw,6.4rem)]
                font-normal
                leading-[0.95]
                tracking-[-0.055em]

                text-[#143d2b]

                dark:text-[#f0e8db]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              From an idea
              <br />

              <span
                className="
                  italic

                  text-[#9b742f]

                  dark:text-[#d2b56b]
                "
              >
                to your moment.
              </span>
            </motion.h2>
          </div>

          {/* right description */}

          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.15,
            }}
            className="
              md:justify-self-end
              md:pb-2
            "
          >
            <p
              className="
                max-w-[390px]

                text-[14px]
                font-normal
                leading-[1.8]

                text-[#143d2b]/80

                sm:text-[15px]

                dark:text-[#eee5d7]/80
              "
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Six thoughtfully managed stages transform your first
              conversation into a celebration that feels effortless,
              personal and entirely yours.
            </p>

            <div
              className="
                mt-5
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  font-heading

                  text-sm
                  italic

                  text-[#9b742f]/70

                  dark:text-[#d2b56b]/60
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                01
              </span>

              <span
                className="
                  relative

                  h-px
                  w-20

                  overflow-hidden

                  bg-[#143d2b]/10

                  dark:bg-white/[0.08]
                "
              >
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: shouldReduceMotion ? 0.2 : 1.2,
                    delay: shouldReduceMotion ? 0 : 0.35,
                    ease: EASE,
                  }}
                  className="
                    absolute
                    inset-0

                    origin-left

                    bg-[#9b742f]/60

                    dark:bg-[#d2b56b]/50
                  "
                />
              </span>

              <span
                className="
                  font-heading

                  text-sm
                  italic

                  text-[#143d2b]/30

                  dark:text-white/20
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                {String(steps.length).padStart(2, "0")}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ================================================================== */}
        {/*                       DESKTOP JOURNEY                              */}
        {/* ================================================================== */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-100px",
          }}
          className="
            relative
            mt-16

            hidden

            md:block
            lg:mt-24
          "
        >
          {/* --------------------------------------------------------------- */}
          {/* CENTRAL JOURNEY SPINE                                           */}
          {/* --------------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="
              absolute
              bottom-0
              left-1/2
              top-0

              w-px

              -translate-x-1/2

              bg-[#143d2b]/10

              dark:bg-white/[0.07]
            "
          />

          {/* animated gold progress line */}

          <motion.div
            aria-hidden="true"
            initial={{
              scaleY: 0,
            }}
            whileInView={{
              scaleY: 1,
            }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 2,
              ease: EASE,
            }}
            className="
              absolute
              bottom-0
              left-1/2
              top-0

              w-px

              origin-top

              -translate-x-1/2

              bg-gradient-to-b
              from-[#9b742f]/70
              via-[#9b742f]/25
              to-transparent

              dark:from-[#d4af37]/60
              dark:via-[#d4af37]/20
            "
          />

          {/* --------------------------------------------------------------- */}
          {/* STEPS                                                           */}
          {/* --------------------------------------------------------------- */}

          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, idx) => {
              const IconComponent =
                (Icons as any)[step.icon] || CheckCircle2;

              const isRight = idx % 2 !== 0;

              return (
                <motion.article
                  key={step.id}
                  variants={stepVariants}
                  className="
                    relative

                    grid
                    min-h-[240px]
                    grid-cols-[1fr_90px_1fr]

                    items-center

                    lg:min-h-[270px]
                    lg:grid-cols-[1fr_130px_1fr]
                  "
                >
                  {/* ======================================================== */}
                  {/* LEFT SIDE                                               */}
                  {/* ======================================================== */}

                  <div
                    className={`
                      ${
                        isRight
                          ? "col-start-1"
                          : "col-start-1"
                      }
                    `}
                  >
                    {!isRight ? (
                      <StepContent
                        step={step}
                        IconComponent={IconComponent}
                        index={idx}
                        align="right"
                        shouldReduceMotion={!!shouldReduceMotion}
                      />
                    ) : (
                      <DecorativeNumber
                        number={step.step}
                        align="right"
                      />
                    )}
                  </div>

                  {/* ======================================================== */}
                  {/* CENTER NODE                                             */}
                  {/* ======================================================== */}

                  <div
                    className="
                      relative
                      z-10

                      col-start-2

                      flex
                      items-center
                      justify-center
                    "
                  >
                    {/* horizontal connector left */}

                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: shouldReduceMotion ? 0.2 : 0.7,
                        delay: shouldReduceMotion ? 0 : 0.2,
                        ease: EASE,
                      }}
                      className="
                        absolute
                        right-1/2

                        h-px
                        w-[40px]

                        origin-right

                        bg-gradient-to-l
                        from-[#9b742f]/40
                        to-transparent

                        lg:w-[58px]

                        dark:from-[#d4af37]/35
                      "
                    />

                    {/* horizontal connector right */}

                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: shouldReduceMotion ? 0.2 : 0.7,
                        delay: shouldReduceMotion ? 0 : 0.2,
                        ease: EASE,
                      }}
                      className="
                        absolute
                        left-1/2

                        h-px
                        w-[40px]

                        origin-left

                        bg-gradient-to-r
                        from-[#9b742f]/40
                        to-transparent

                        lg:w-[58px]

                        dark:from-[#d4af37]/35
                      "
                    />

                    {/* outer diamond */}

                    <motion.div
                      whileInView={
                        shouldReduceMotion
                          ? undefined
                          : {
                              rotate: [45, 45, 135, 135],
                            }
                      }
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        ease: EASE,
                      }}
                      className="
                        relative

                        flex
                        h-12
                        w-12

                        rotate-45

                        items-center
                        justify-center

                        border
                        border-[#9b742f]/35

                        bg-[#f3eadf]

                        shadow-[0_0_0_6px_rgba(243,234,223,0.85)]

                        lg:h-14
                        lg:w-14

                        dark:border-[#d4af37]/30
                        dark:bg-[#12140f]
                        dark:shadow-[0_0_0_6px_rgba(18,20,15,0.9)]
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8

                          -rotate-45

                          items-center
                          justify-center

                          lg:h-9
                          lg:w-9
                        "
                      >
                        <span
                          className="
                            font-heading

                            text-[11px]
                            italic

                            text-[#9b742f]

                            lg:text-xs

                            dark:text-[#d2b56b]
                          "
                          style={{
                            fontFamily:
                              '"Playfair Display", serif',
                          }}
                        >
                          {String(step.step).padStart(2, "0")}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* ======================================================== */}
                  {/* RIGHT SIDE                                              */}
                  {/* ======================================================== */}

                  <div className="col-start-3">
                    {isRight ? (
                      <StepContent
                        step={step}
                        IconComponent={IconComponent}
                        index={idx}
                        align="left"
                        shouldReduceMotion={!!shouldReduceMotion}
                      />
                    ) : (
                      <DecorativeNumber
                        number={step.step}
                        align="left"
                      />
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>

        {/* ================================================================== */}
        {/*                         MOBILE JOURNEY                             */}
        {/* ================================================================== */}

        <div
          className="
            relative
            mt-14

            md:hidden
          "
        >
          {/* vertical path */}

          <div
            className="
              absolute
              bottom-0
              left-[19px]
              top-0

              w-px

              bg-[#143d2b]/10

              dark:bg-white/[0.07]
            "
          />

          <motion.div
            initial={{
              scaleY: 0,
            }}
            whileInView={{
              scaleY: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 1.8,
              ease: EASE,
            }}
            className="
              absolute
              bottom-0
              left-[19px]
              top-0

              w-px

              origin-top

              bg-gradient-to-b
              from-[#9b742f]/65
              via-[#9b742f]/20
              to-transparent

              dark:from-[#d4af37]/50
              dark:via-[#d4af37]/15
            "
          />

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const IconComponent =
                (Icons as any)[step.icon] || CheckCircle2;

              return (
                <motion.article
                  key={step.id}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 24,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0.2 : 0.7,
                    delay: shouldReduceMotion ? 0 : idx * 0.04,
                    ease: EASE,
                  }}
                  className="
                    relative
                    pl-14
                  "
                >
                  {/* node */}

                  <div
                    className="
                      absolute
                      left-0
                      top-0

                      flex
                      h-[39px]
                      w-[39px]

                      rotate-45

                      items-center
                      justify-center

                      border
                      border-[#9b742f]/35

                      bg-[#f3eadf]

                      dark:border-[#d4af37]/30
                      dark:bg-[#12140f]
                    "
                  >
                    <span
                      className="
                        -rotate-45

                        font-heading

                        text-[9px]
                        italic

                        text-[#9b742f]

                        dark:text-[#d2b56b]
                      "
                      style={{
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {String(step.step).padStart(2, "0")}
                    </span>
                  </div>

                  {/* icon + phase */}

                  <div
                    className="
                      mb-4
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <IconComponent
                      className="
                        h-4
                        w-4

                        stroke-[1.4]

                        text-[#9b742f]

                        dark:text-[#d2b56b]
                      "
                    />

                    <span
                      className="
                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.25em]

                        text-[#9b742f]/60

                        dark:text-[#d4af37]/50
                      "
                    >
                      Stage {String(step.step).padStart(2, "0")}
                    </span>
                  </div>

                  <h3
                    className="
                      font-heading

                      text-[1.65rem]
                      font-normal
                      leading-tight
                      tracking-[-0.025em]

                      text-[#143d2b]

                      dark:text-[#eee5d7]
                    "
                    style={{
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      max-w-[480px]

                      text-[11px]
                      font-normal
                      leading-[1.85]

                      text-[#143d2b]/48

                      dark:text-[#eee5d7]/40
                    "
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {step.description}
                  </p>

                  {/* tiny finishing line */}

                  <div
                    className="
                      mt-5
                      h-px
                      w-10

                      bg-[#9b742f]/30

                      dark:bg-[#d2b56b]/25
                    "
                  />
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* ================================================================== */}
        {/*                          JOURNEY FINALE                            */}
        {/* ================================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.9,
            ease: EASE,
          }}
          className="
            relative

            mt-20

            border-y
            border-[#143d2b]/10

            py-12

            sm:mt-28
            sm:py-14

            lg:mt-32

            dark:border-white/[0.07]
          "
        >
          <div
            className="
              grid
              grid-cols-1

              gap-9

              md:grid-cols-[1fr_auto]
              md:items-center
            "
          >
            {/* ------------------------------------------------------------- */}
            {/* FINALE COPY                                                   */}
            {/* ------------------------------------------------------------- */}

            <div>
              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-3
                "
              >
                <CheckCircle2
                  className="
                    h-3.5
                    w-3.5

                    stroke-[1.5]

                    text-[#9b742f]

                    dark:text-[#d2b56b]
                  "
                />

                <span
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.3em]

                    text-[#9b742f]/70

                    dark:text-[#d4af37]/55
                  "
                >
                  The Final Moment
                </span>
              </div>

              <h3
                className="
                  max-w-[650px]

                  font-heading

                  text-[clamp(2.1rem,4vw,4rem)]
                  font-normal
                  leading-[1.05]
                  tracking-[-0.04em]

                  text-[#143d2b]

                  dark:text-[#eee5d7]
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                You celebrate.
                <br />

                <span
                  className="
                    italic

                    text-[#9b742f]

                    dark:text-[#d2b56b]
                  "
                >
                  We handle the rest.
                </span>
              </h3>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CTA AREA                                                      */}
            {/* ------------------------------------------------------------- */}

            <div
              className="
                flex
                flex-col

                gap-3

                sm:flex-row
                md:flex-col
                lg:flex-row
              "
            >
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
              >
                <Link
                  href="/register"
                  className="
                    group

                    flex
                    min-w-[190px]

                    items-center
                    justify-center
                    gap-3

                    bg-[#143d2b]

                    px-7
                    py-4

                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[#f7f0e6]

                    shadow-[0_12px_35px_rgba(20,61,43,0.12)]

                    transition-colors
                    duration-300

                    hover:bg-[#1b4a35]

                    dark:bg-[#d2b56b]
                    dark:text-[#11130f]
                    dark:hover:bg-[#ddc57f]
                  "
                >
                  Book Your Event

                  <ArrowUpRight
                    className="
                      h-3.5
                      w-3.5

                      transition-transform
                      duration-300

                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              </motion.div>

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
              >
                <Link
                  href="/register?role=vendor"
                  className="
                    group

                    flex
                    min-w-[190px]

                    items-center
                    justify-center
                    gap-3

                    border
                    border-[#143d2b]/20

                    px-7
                    py-4

                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[#143d2b]/65

                    transition-all
                    duration-300

                    hover:border-[#9b742f]/45
                    hover:text-[#9b742f]

                    dark:border-white/12
                    dark:text-[#eee5d7]/55
                    dark:hover:border-[#d4af37]/40
                    dark:hover:text-[#d2b56b]
                  "
                >
                  Become a Vendor

                  <ArrowUpRight
                    className="
                      h-3.5
                      w-3.5

                      opacity-50

                      transition-transform
                      duration-300

                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*                           DESKTOP STEP CONTENT                             */
/* ========================================================================== */

function StepContent({
  step,
  IconComponent,
  index,
  align,
  shouldReduceMotion,
}: {
  step: any;
  IconComponent: React.ElementType;
  index: number;
  align: "left" | "right";
  shouldReduceMotion: boolean;
}) {
  const isRightAligned = align === "right";

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              x: isRightAligned ? -4 : 4,
            }
      }
      transition={{
        duration: 0.35,
        ease: EASE,
      }}
      className={`
        group
        relative

        max-w-[430px]

        ${
          isRightAligned
            ? "ml-auto pr-4 text-right lg:pr-8"
            : "mr-auto pl-4 text-left lg:pl-8"
        }
      `}
    >
      {/* phase */}

      <div
        className={`
          mb-4
          flex
          items-center
          gap-3

          ${
            isRightAligned
              ? "justify-end"
              : "justify-start"
          }
        `}
      >
        {isRightAligned && (
          <span
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-[0.28em]

              text-[#9b742f]/55

              dark:text-[#d4af37]/45
            "
          >
            Stage {String(step.step).padStart(2, "0")}
          </span>
        )}

        <div
          className="
            flex
            h-9
            w-9

            items-center
            justify-center

            border
            border-[#143d2b]/12

            text-[#9b742f]

            transition-all
            duration-500

            group-hover:border-[#9b742f]/40
            group-hover:bg-[#9b742f]/[0.035]

            dark:border-white/[0.08]
            dark:text-[#d2b56b]
            dark:group-hover:border-[#d4af37]/30
            dark:group-hover:bg-[#d4af37]/[0.025]
          "
        >
          <IconComponent
            className="
              h-4
              w-4

              stroke-[1.35]

              transition-transform
              duration-500

              group-hover:scale-110
            "
          />
        </div>

        {!isRightAligned && (
          <span
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-[0.28em]

              text-[#9b742f]/55

              dark:text-[#d4af37]/45
            "
          >
            Stage {String(step.step).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* title */}

      <h3
        className="
          font-heading

          text-[clamp(1.65rem,2.5vw,2.5rem)]
          font-normal
          leading-[1.05]
          tracking-[-0.035em]

          text-[#143d2b]

          transition-colors
          duration-300

          group-hover:text-[#0d3020]

          dark:text-[#eee5d7]
          dark:group-hover:text-white
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        {step.title}
      </h3>

      {/* description */}

      <p
        className={`
          mt-4

          max-w-[390px]

          text-[11px]
          font-normal
          leading-[1.85]

          text-[#143d2b]/46

          sm:text-[12px]

          dark:text-[#eee5d7]/38

          ${
            isRightAligned
              ? "ml-auto"
              : "mr-auto"
          }
        `}
        style={{
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {step.description}
      </p>

      {/* underline */}

      <motion.div
        initial={{
          width: 24,
        }}
        whileHover={{
          width: 58,
        }}
        className={`
          mt-5
          h-px

          bg-[#9b742f]/35

          dark:bg-[#d2b56b]/30

          ${
            isRightAligned
              ? "ml-auto"
              : "mr-auto"
          }
        `}
      />
    </motion.div>
  );
}

/* ========================================================================== */
/*                         DECORATIVE STEP NUMBER                             */
/* ========================================================================== */

function DecorativeNumber({
  number,
  align,
}: {
  number: number | string;
  align: "left" | "right";
}) {
  return (
    <div
      aria-hidden="true"
      className={`
        flex

        ${
          align === "right"
            ? "justify-end pr-8"
            : "justify-start pl-8"
        }
      `}
    >
      <span
        className="
          font-heading

          text-[clamp(5rem,8vw,8.5rem)]
          italic
          leading-none
          tracking-[-0.06em]

          text-[#143d2b]/[0.035]

          dark:text-white/[0.025]
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        {String(number).padStart(2, "0")}
      </span>
    </div>
  );
}