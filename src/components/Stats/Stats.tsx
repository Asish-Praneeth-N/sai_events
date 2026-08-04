"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import { Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ==================================================================
   CINEMATIC COUNTER
================================================================== */

interface CounterProps {
  value: number;
  isActive: boolean;
}

function CinematicCounter({
  value,
  isActive,
}: CounterProps) {
  const [count, setCount] = useState(0);

  const hasRun = useRef(false);

  const shouldReduceMotion = useReducedMotion();

  const isDecimal = !Number.isInteger(value);

  useEffect(() => {
    if (!isActive || hasRun.current) return;

    hasRun.current = true;

    if (shouldReduceMotion) {
      setCount(value);
      return;
    }

    const duration = 2000;

    let startTs: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (startTs === null) {
        startTs = timestamp;
      }

      const elapsed = timestamp - startTs;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      /*
       * Decelerating ticker.
       * Starts quickly and settles smoothly into
       * the final number.
       */

      const eased =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      const nextValue = isDecimal
        ? Math.round(eased * value * 10) / 10
        : Math.floor(eased * value);

      setCount(nextValue);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [
    isActive,
    value,
    shouldReduceMotion,
    isDecimal,
  ]);

  return (
    <span>
      {isDecimal ? count.toFixed(1) : count}
    </span>
  );
}

/* ==================================================================
   MAIN COMPONENT
================================================================== */

export default function Stats() {
  const shouldReduceMotion = useReducedMotion();

  const [sectionActive, setSectionActive] =
    useState(false);

  const stats = LANDING_PAGE_CONFIG.stats;

  const containerVariants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: shouldReduceMotion
          ? 0
          : 0.12,
      },
    },
  };

  const statVariants = {
    hidden: {
      opacity: 0,

      y: shouldReduceMotion ? 0 : 35,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: shouldReduceMotion
          ? 0.2
          : 0.85,

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
        border-t
        border-[#143d2b]/10
        bg-[#143d2b]
        py-24
        text-[#eee5d7]
        select-none

        sm:py-32
        lg:py-40

        dark:border-white/[0.07]
        dark:bg-[#0c100d]
      "
    >
      {/* ============================================================
          BACKGROUND
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
          bg-white/[0.06]

          xl:block
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
          bg-white/[0.06]

          xl:block
        "
      />

      {/* Giant typography */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[2vw]
          top-0
          hidden
          text-[clamp(10rem,22vw,22rem)]
          italic
          leading-none
          tracking-[-0.08em]
          text-white/[0.018]

          lg:block
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        SAI
      </div>

      {/* Warm glow */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[550px]
          w-[800px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#d2b56b]/[0.035]
          blur-[180px]
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
            border-white/[0.1]
            pb-10

            lg:mb-20
            lg:grid-cols-[1fr_390px]
            lg:items-end
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
              <span className="h-px w-8 bg-[#d2b56b]/50" />

              <Sparkles className="h-3 w-3 text-[#d2b56b]" />

              <span
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.34em]
                  text-[#d2b56b]
                "
              >
                By The Numbers
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
                max-w-[800px]
                text-[clamp(3.2rem,6vw,6.5rem)]
                font-normal
                leading-[0.94]
                tracking-[-0.055em]
                text-[#eee5d7]
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              A decade measured
              <br />

              <span className="italic text-[#d2b56b]">
                in memories.
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: shouldReduceMotion
                ? 0
                : 0.15,
            }}
            className="
              max-w-[380px]
              text-[11px]
              leading-[1.9]
              text-[#eee5d7]/45

              sm:text-xs
            "
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Every number represents a celebration,
            a relationship and a responsibility entrusted
            to us. The statistics are simple. The stories
            behind them are anything but.
          </motion.p>
        </div>

        {/* ==========================================================
            STATS
        ========================================================== */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          onViewportEnter={() =>
            setSectionActive(true)
          }
          viewport={{
            once: true,
            margin: "-100px",
          }}
          className="
            grid
            grid-cols-1

            sm:grid-cols-2

            lg:grid-cols-4
          "
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statVariants}
              className={`
                group
                relative
                border-b
                border-white/[0.1]
                py-10

                sm:min-h-[260px]
                sm:px-7
                sm:py-12

                lg:min-h-[310px]
                lg:px-9
                lg:py-14

                ${
                  idx % 2 === 0
                    ? "sm:border-r"
                    : ""
                }

                ${
                  idx < stats.length - 1
                    ? "lg:border-r"
                    : "lg:border-r-0"
                }
              `}
            >
              {/* Index */}

              <div
                className="
                  mb-10
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.24em]
                    text-[#d2b56b]/65
                  "
                >
                  0{idx + 1}
                </span>

                <span
                  className="
                    h-px
                    w-7
                    bg-[#d2b56b]/25
                    transition-all
                    duration-500

                    group-hover:w-12
                    group-hover:bg-[#d2b56b]/65
                  "
                />
              </div>

              {/* Number */}

              <div
                className="
                  relative
                  overflow-hidden
                  pb-2
                "
              >
                <motion.h3
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: 4,
                        }
                  }
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="
                    whitespace-nowrap
                    text-[clamp(4.2rem,7vw,7.5rem)]
                    font-normal
                    leading-[0.88]
                    tracking-[-0.07em]
                    text-[#eee5d7]
                  "
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  <CinematicCounter
                    value={stat.value}
                    isActive={sectionActive}
                  />

                  <span
                    className="
                      ml-1
                      italic
                      text-[#d2b56b]
                    "
                  >
                    {stat.suffix}
                  </span>
                </motion.h3>
              </div>

              {/* Label */}

              <div
                className="
                  mt-7
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    h-[3px]
                    w-[3px]
                    rounded-full
                    bg-[#d2b56b]
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    leading-[1.7]
                    tracking-[0.24em]
                    text-[#eee5d7]/45

                    sm:text-[9px]
                  "
                >
                  {stat.label}
                </span>
              </div>

              {/* Hover wash */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[#d2b56b]/0
                  transition-colors
                  duration-700

                  group-hover:bg-[#d2b56b]/[0.018]
                "
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ==========================================================
            LEGACY SIGNATURE
        ========================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: shouldReduceMotion ? 0 : 0.35,
            ease: EASE,
          }}
          className="
            mt-10
            flex
            flex-col
            gap-4
            border-t
            border-white/[0.1]
            pt-7

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-[0.28em]
              text-white/25
            "
          >
            Experience · Trust · Celebration · Detail
          </span>

          <span
            className="
              text-sm
              italic
              text-[#d2b56b]/65
            "
            style={{
              fontFamily:
                '"Playfair Display", serif',
            }}
          >
            The numbers grow. The attention remains personal.
          </span>
        </motion.div>
      </div>
    </section>
  );
}