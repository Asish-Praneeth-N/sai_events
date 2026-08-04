"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="finale"
      className="
        relative
        isolate
        w-full
        overflow-hidden
        border-t
        border-white/10
        bg-[#11140f]
        select-none
      "
    >
      {/* ============================================================ */}
      {/* CINEMATIC BACKGROUND                                         */}
      {/* ============================================================ */}

      <div className="absolute inset-0 -z-30">
        <motion.img
          src="/images/reception.png"
          alt="SAI Events luxury reception"
          initial={
            shouldReduceMotion
              ? undefined
              : { scale: 1.08 }
          }
          whileInView={
            shouldReduceMotion
              ? undefined
              : { scale: 1 }
          }
          viewport={{ once: true }}
          transition={{
            duration: 2.4,
            ease: EASE,
          }}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Cinematic treatment */}

      <div className="absolute inset-0 -z-20 bg-[#09100b]/55" />

      <div
        className="
          absolute
          inset-0
          -z-20
          bg-gradient-to-b
          from-[#09100b]/45
          via-[#09100b]/25
          to-[#09100b]/95
        "
      />

      <div
        className="
          absolute
          inset-0
          -z-20
          bg-gradient-to-r
          from-[#07100a]/55
          via-transparent
          to-[#07100a]/35
        "
      />

      {/* warm central light */}

      <div className="pointer-events-none absolute left-1/2 top-[28%] -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#d4af37]/[0.055] blur-[180px]" />

      {/* edge architecture */}

      <div className="pointer-events-none absolute bottom-0 left-[4.5%] top-0 hidden w-px bg-white/[0.08] xl:block" />

      <div className="pointer-events-none absolute bottom-0 right-[4.5%] top-0 hidden w-px bg-white/[0.08] xl:block" />

      {/* ============================================================ */}
      {/* HERO CLOSING                                                 */}
      {/* ============================================================ */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[620px]
          w-full
          max-w-[1380px]
          flex-col
          items-center
          justify-center
          px-6
          pb-20
          pt-28
          text-center
          sm:px-8
          sm:pb-24
          sm:pt-36
          lg:min-h-[700px]
          lg:px-[7%]
        "
      >
        {/* eyebrow */}

        <motion.div
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
            duration: shouldReduceMotion ? 0.2 : 0.7,
            ease: EASE,
          }}
          className="mb-7 flex items-center gap-4"
        >
          <span className="h-px w-8 bg-[#d2b56b]/55" />

          <Sparkles className="h-3 w-3 text-[#d2b56b]" />

          <span className="text-[8px] font-bold uppercase tracking-[0.36em] text-[#d2b56b] sm:text-[9px]">
            Your Story Starts Here
          </span>

          <span className="h-px w-8 bg-[#d2b56b]/55" />
        </motion.div>

        {/* heading */}

        <motion.h2
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : 32,
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
            duration: shouldReduceMotion ? 0.2 : 1,
            ease: EASE,
          }}
          className="
            max-w-[1050px]
            text-[clamp(3.8rem,8vw,8.5rem)]
            font-normal
            leading-[0.88]
            tracking-[-0.065em]
            text-[#f3ebdf]
          "
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Let&apos;s make the next
          <br />

          <span className="italic text-[#d2b56b]">
            moment unforgettable.
          </span>
        </motion.h2>

        {/* description */}

        <motion.p
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
            duration: shouldReduceMotion ? 0.2 : 0.8,
            delay: shouldReduceMotion ? 0 : 0.22,
            ease: EASE,
          }}
          className="
            mt-8
            max-w-[580px]
            text-[11px]
            font-light
            leading-[1.95]
            text-[#f3ebdf]/55
            sm:text-xs
          "
          style={{
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Whether the vision is already clear or still taking
          shape, begin with a conversation. From there, our team
          turns ideas into a beautifully managed celebration.
        </motion.p>

        {/* scroll/detail line */}

        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: shouldReduceMotion ? 0 : 0.5,
            ease: EASE,
          }}
          className="mt-10 h-14 w-px origin-top bg-gradient-to-b from-[#d2b56b]/60 to-transparent"
        />
      </div>

      {/* ============================================================ */}
      {/* LARGE INVITATION ACTIONS                                     */}
      {/* ============================================================ */}

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          margin: "-80px",
        }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren:
                shouldReduceMotion ? 0 : 0.12,
            },
          },
        }}
        className="
          relative
          z-10
          mx-auto
          grid
          w-full
          max-w-[1380px]
          grid-cols-1
          border-t
          border-white/[0.13]
          md:grid-cols-2
          xl:w-[91%]
        "
      >
        {/* ========================================================== */}
        {/* BEGIN EVENT                                                */}
        {/* ========================================================== */}

        <motion.div
          variants={{
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
          }}
          className="
            border-b
            border-white/[0.13]
            md:border-b-0
            md:border-r
          "
        >
          <Link
            href="/register"
            className="
              group
              relative
              flex
              min-h-[330px]
              w-full
              overflow-hidden
              bg-[#d2b56b]
              p-8
              text-[#102b1e]
              transition-colors
              duration-700
              hover:bg-[#ddc47f]
              sm:min-h-[380px]
              sm:p-10
              lg:min-h-[420px]
              lg:p-12
            "
          >
            {/* large numeral */}

            <span
              className="
                pointer-events-none
                absolute
                -right-2
                -top-10
                text-[13rem]
                italic
                leading-none
                text-[#102b1e]/[0.045]
                sm:text-[17rem]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              01
            </span>

            {/* inner frame */}

            <div className="pointer-events-none absolute inset-4 border border-[#102b1e]/10 transition-all duration-700 group-hover:inset-5 group-hover:border-[#102b1e]/20" />

            <div className="relative z-10 flex w-full flex-col justify-between">

              {/* top */}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 stroke-[1.5]" />

                  <span className="text-[8px] font-bold uppercase tracking-[0.3em]">
                    Begin Planning
                  </span>
                </div>

                <span className="text-[9px] font-semibold tracking-[0.2em] opacity-45">
                  01
                </span>
              </div>

              {/* middle */}

              <div className="my-12 max-w-[480px]">
                <h3
                  className="
                    text-[clamp(2.5rem,4vw,4.6rem)]
                    font-normal
                    leading-[0.98]
                    tracking-[-0.04em]
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  I have an event
                  <br />
                  <span className="italic">
                    in mind.
                  </span>
                </h3>

                <p
                  className="
                    mt-5
                    max-w-[400px]
                    text-[10px]
                    leading-[1.8]
                    text-[#102b1e]/60
                    sm:text-[11px]
                  "
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Share your celebration with us and begin
                  building the experience around your vision,
                  priorities and occasion.
                </p>
              </div>

              {/* action */}

              <div className="flex items-center justify-between border-t border-[#102b1e]/15 pt-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.28em]">
                  Begin Your Event
                </span>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    border
                    border-[#102b1e]/25
                    transition-all
                    duration-500
                    group-hover:rotate-[-4deg]
                    group-hover:bg-[#102b1e]
                    group-hover:text-[#d2b56b]
                  "
                >
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ========================================================== */}
        {/* SPEAK WITH TEAM                                            */}
        {/* ========================================================== */}

        <motion.div
          variants={{
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
          }}
        >
          <a
            href="#contact"
            className="
              group
              relative
              flex
              min-h-[330px]
              w-full
              overflow-hidden
              bg-[#10150f]/80
              p-8
              text-[#eee5d7]
              backdrop-blur-md
              transition-colors
              duration-700
              hover:bg-[#172019]/90
              sm:min-h-[380px]
              sm:p-10
              lg:min-h-[420px]
              lg:p-12
            "
          >
            {/* numeral */}

            <span
              className="
                pointer-events-none
                absolute
                -right-2
                -top-10
                text-[13rem]
                italic
                leading-none
                text-white/[0.025]
                sm:text-[17rem]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              02
            </span>

            {/* inner frame */}

            <div className="pointer-events-none absolute inset-4 border border-white/[0.08] transition-all duration-700 group-hover:inset-5 group-hover:border-[#d2b56b]/25" />

            <div className="relative z-10 flex w-full flex-col justify-between">

              {/* top */}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 text-[#d2b56b]">
                  <MessageCircle className="h-4 w-4 stroke-[1.5]" />

                  <span className="text-[8px] font-bold uppercase tracking-[0.3em]">
                    Personal Consultation
                  </span>
                </div>

                <span className="text-[9px] font-semibold tracking-[0.2em] text-white/30">
                  02
                </span>
              </div>

              {/* middle */}

              <div className="my-12 max-w-[480px]">
                <h3
                  className="
                    text-[clamp(2.5rem,4vw,4.6rem)]
                    font-normal
                    leading-[0.98]
                    tracking-[-0.04em]
                    text-[#eee5d7]
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  I&apos;d like to talk
                  <br />
                  <span className="italic text-[#d2b56b]">
                    it through.
                  </span>
                </h3>

                <p
                  className="
                    mt-5
                    max-w-[400px]
                    text-[10px]
                    leading-[1.8]
                    text-[#eee5d7]/45
                    sm:text-[11px]
                  "
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Ask about availability, possibilities,
                  event scope or the planning process. Our team
                  will help you understand the next step.
                </p>
              </div>

              {/* action */}

              <div className="flex items-center justify-between border-t border-white/[0.1] pt-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#d2b56b]">
                  Speak With Our Team
                </span>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    border
                    border-white/15
                    text-[#d2b56b]
                    transition-all
                    duration-500
                    group-hover:rotate-[4deg]
                    group-hover:border-[#d2b56b]
                    group-hover:bg-[#d2b56b]
                    group-hover:text-[#102b1e]
                  "
                >
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </a>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* BOTTOM BRAND SIGNATURE                                       */}
      {/* ============================================================ */}

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 py-8 xl:w-[91%] xl:px-0">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-[7px] font-semibold uppercase tracking-[0.26em] text-white/25">
            SAI Events · Hyderabad · Est. 2014
          </span>

          <span
            className="text-sm italic text-[#d2b56b]/55"
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Beautifully planned. Effortlessly experienced.
          </span>
        </div>
      </div>
    </section>
  );
}