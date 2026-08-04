"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Film,
  Heart,
  Sparkles,
} from "lucide-react";

import { INTRO_CONFIG } from "@/constants/introConfig";

/* -------------------------------------------------------------------------- */
/*                                SOCIAL ICONS                                */
/* -------------------------------------------------------------------------- */

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    stroke="currentColor"
    strokeWidth="1.6"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    stroke="currentColor"
    strokeWidth="1.6"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    stroke="currentColor"
    strokeWidth="1.6"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                             REPLAY EXPERIENCE                              */
/* -------------------------------------------------------------------------- */

function handleReplayExperience() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(INTRO_CONFIG.cacheKey);
    window.location.reload();
  }
}

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();

  const socialLinks = [
    {
      icon: FacebookIcon,
      href: "https://facebook.com",
      label: "Facebook",
    },
    {
      icon: InstagramIcon,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: YoutubeIcon,
      href: "https://youtube.com",
      label: "YouTube",
    },
  ];

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "About", href: "#about" },
    { label: "Book Consultation", href: "#contact" },
  ];

  const instagramPreviews = [
    "/images/wedding.png",
    "/images/engagement.png",
    "/images/birthday.png",
    "/images/reception.png",
  ];

  return (
    <footer
      className="
        relative
        w-full
        overflow-hidden
        border-t
        border-[#173d2c]/10
        bg-[#eee0cf]
        text-[#143d2b]
        select-none

        dark:border-white/[0.08]
        dark:bg-[#11130f]
        dark:text-[#eee5d7]
      "
    >
      {/* ==================================================================== */}
      {/*                       BACKGROUND DECORATION                          */}
      {/* ==================================================================== */}

      {/* oversized brand watermark */}

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        className="
          pointer-events-none
          absolute
          -bottom-[2vw]
          -right-[1vw]

          hidden

          font-heading
          text-[clamp(9rem,20vw,22rem)]
          italic
          leading-none
          tracking-[-0.08em]

          text-[#143d2b]/[0.025]

          xl:block

          dark:text-white/[0.018]
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        SAI
      </motion.div>

      {/* ambient gold field */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-[10%]
          top-[20%]

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#c79c4c]/[0.035]

          blur-[150px]

          dark:bg-[#d4af37]/[0.025]
        "
      />

      {/* editorial vertical lines */}

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

          bg-[#143d2b]/10

          lg:block

          dark:bg-white/[0.06]
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

          bg-[#143d2b]/10

          lg:block

          dark:bg-white/[0.06]
        "
      />

      {/* ==================================================================== */}
      {/*                        FOOTER MAIN CONTENT                           */}
      {/* ==================================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]

          px-6
          pb-7
          pt-16

          sm:px-8
          sm:pt-20

          lg:px-[7%]
          lg:pt-24
        "
      >
        {/* ================================================================== */}
        {/*                         OPENING STATEMENT                          */}
        {/* ================================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-10

            border-b
            border-[#143d2b]/10

            pb-12

            lg:grid-cols-[1.4fr_0.6fr]
            lg:items-end

            dark:border-white/[0.08]
          "
        >
          {/* --------------------------------------------------------------- */}
          {/* MAIN BRAND STATEMENT                                            */}
          {/* --------------------------------------------------------------- */}

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
                duration: shouldReduceMotion ? 0.2 : 0.8,
                ease: [0.16, 1, 0.3, 1],
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

                  bg-[#143d2b]/40

                  dark:bg-[#d4af37]/50
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
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.32em]

                  text-[#143d2b]/50

                  sm:text-[9px]

                  dark:text-[#d9c88d]/65
                "
              >
                Your celebration, our craft
              </span>
            </motion.div>

            <motion.h2
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
                amount: 0.35,
              }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.95,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                max-w-[900px]

                font-heading

                text-[clamp(3rem,6.3vw,6.7rem)]
                font-normal
                leading-[0.94]
                tracking-[-0.055em]

                text-[#143d2b]

                dark:text-[#f0e8db]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Let&apos;s create something{" "}
              <span
                className="
                  italic
                  text-[#9b742f]

                  dark:text-[#d2b56b]
                "
              >
                unforgettable.
              </span>
            </motion.h2>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* RIGHT CTA                                                       */}
          {/* --------------------------------------------------------------- */}

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
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.15,
            }}
            className="
              flex
              flex-col

              lg:items-end
            "
          >
            <p
              className="
                max-w-[330px]

                text-[12px]
                font-normal
                leading-[1.8]

                text-[#143d2b]/55

                sm:text-[13px]

                lg:text-right

                dark:text-[#eee5d7]/45
              "
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              From the first conversation to the final celebration,
              every detail is thoughtfully managed by SAI Events.
            </p>

            <motion.a
              href="#contact"
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
                mt-6

                inline-flex
                w-fit

                items-center
                gap-4

                border-b
                border-[#143d2b]/40

                pb-2

                text-[9px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#143d2b]

                transition-colors
                duration-300

                hover:text-[#9b742f]

                dark:border-[#d2b56b]/35
                dark:text-[#eee5d7]
                dark:hover:text-[#d2b56b]
              "
            >
              Plan Your Celebration

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5

                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </motion.a>
          </motion.div>
        </div>

        {/* ================================================================== */}
        {/*                           MAIN GRID                                */}
        {/* ================================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-12

            py-12

            md:grid-cols-12
            md:gap-8

            lg:py-14
          "
        >
          {/* ================================================================ */}
          {/*                            BRAND                                 */}
          {/* ================================================================ */}

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
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
            }}
            className="
              md:col-span-5
              lg:col-span-4
            "
          >
            {/* brand */}

            <div className="flex items-center gap-4">
              {/* editorial mark */}

              <div
                className="
                  relative
                  flex
                  h-12
                  w-12

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-[#143d2b]/15

                  dark:border-[#d2b56b]/20
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
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute
                    inset-[5px]

                    rounded-full

                    border
                    border-dashed
                    border-[#9b742f]/35

                    dark:border-[#d2b56b]/30
                  "
                />

                <Heart
                  className="
                    h-4
                    w-4

                    stroke-[1.3]

                    text-[#9b742f]

                    dark:text-[#d2b56b]
                  "
                />
              </div>

              <div>
                <span
                  className="
                    block

                    font-heading

                    text-lg
                    font-normal
                    uppercase
                    tracking-[0.22em]

                    text-[#143d2b]

                    dark:text-[#eee5d7]
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  Sai Events
                </span>

                <span
                  className="
                    mt-1
                    block

                    text-[7px]
                    font-semibold
                    uppercase
                    tracking-[0.27em]

                    text-[#143d2b]/35

                    dark:text-white/25
                  "
                >
                  Curated Celebrations
                </span>
              </div>
            </div>

            <p
              className="
                mt-6
                max-w-[360px]

                text-[11px]
                font-normal
                leading-[1.9]

                text-[#143d2b]/50

                sm:text-[12px]

                dark:text-[#eee5d7]/40
              "
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Crafting premium cinematic event experiences, luxury
              weddings, pre-wedding celebrations, and corporate galas
              with unparalleled attention to detail since 2014.
            </p>

            {/* ------------------------------------------------------------- */}
            {/* SOCIAL LINKS                                                  */}
            {/* ------------------------------------------------------------- */}

            <div
              className="
                mt-7
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-3
              "
            >
              {socialLinks.map((social) => {
                const IconComp = social.icon;

                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -2,
                          }
                    }
                    className="
                      group

                      flex
                      items-center
                      gap-2

                      text-[#143d2b]/45

                      transition-colors
                      duration-300

                      hover:text-[#9b742f]

                      dark:text-white/35
                      dark:hover:text-[#d2b56b]
                    "
                  >
                    <IconComp
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                    <span
                      className="
                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                      "
                    >
                      {social.label}
                    </span>
                  </motion.a>
                );
              })}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* REPLAY EXPERIENCE                                             */}
            {/* ------------------------------------------------------------- */}

            <motion.button
              onClick={handleReplayExperience}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: 3,
                    }
              }
              className="
                group

                mt-8

                flex
                cursor-pointer

                items-center
                gap-2.5

                text-[7px]
                font-bold
                uppercase
                tracking-[0.2em]

                text-[#143d2b]/30

                transition-colors
                duration-300

                hover:text-[#9b742f]

                dark:text-white/25
                dark:hover:text-[#d2b56b]
              "
            >
              <Film
                className="
                  h-3.5
                  w-3.5

                  transition-transform
                  duration-300

                  group-hover:scale-110
                "
              />

              Replay Experience
            </motion.button>
          </motion.div>

          {/* ================================================================ */}
          {/*                         QUICK LINKS                              */}
          {/* ================================================================ */}

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
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.08,
            }}
            className="
              md:col-span-3
              lg:col-span-3
              lg:col-start-6
            "
          >
            <div className="mb-6 flex items-center gap-3">
              <span
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.28em]

                  text-[#9b742f]

                  dark:text-[#d2b56b]
                "
              >
                Explore
              </span>

              <span
                className="
                  h-px
                  w-7

                  bg-[#9b742f]/25

                  dark:bg-[#d2b56b]/20
                "
              />
            </div>

            <ul className="space-y-3.5">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.label}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: 4,
                        }
                  }
                >
                  <a
                    href={link.href}
                    className="
                      group

                      flex
                      w-fit

                      items-center
                      gap-3
                    "
                  >
                    <span
                      className="
                        font-heading

                        text-[10px]
                        italic

                        text-[#9b742f]/45

                        dark:text-[#d2b56b]/35
                      "
                      style={{
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className="
                        text-[10px]
                        font-medium
                        tracking-[0.04em]

                        text-[#143d2b]/55

                        transition-colors
                        duration-300

                        group-hover:text-[#143d2b]

                        dark:text-[#eee5d7]/45
                        dark:group-hover:text-[#eee5d7]
                      "
                    >
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ================================================================ */}
          {/*                      INSTAGRAM EDITORIAL                         */}
          {/* ================================================================ */}

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
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.16,
            }}
            className="
              md:col-span-4
              lg:col-span-4
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.28em]

                    text-[#9b742f]

                    dark:text-[#d2b56b]
                  "
                >
                  Instagram
                </span>

                <span
                  className="
                    h-px
                    w-7

                    bg-[#9b742f]/25

                    dark:bg-[#d2b56b]/20
                  "
                />
              </div>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Instagram"
                className="
                  group

                  flex
                  items-center
                  gap-1.5

                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.18em]

                  text-[#143d2b]/30

                  transition-colors
                  duration-300

                  hover:text-[#9b742f]

                  dark:text-white/25
                  dark:hover:text-[#d2b56b]
                "
              >
                Follow

                <ArrowUpRight
                  className="
                    h-3
                    w-3

                    transition-transform
                    duration-300

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </a>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* ASYMMETRIC PHOTO GRID                                         */}
            {/* ------------------------------------------------------------- */}

            <div
              className="
                grid
                grid-cols-3
                grid-rows-2

                gap-2
              "
            >
              {instagramPreviews.map((img, idx) => {
                const featured = idx === 0;

                return (
                  <motion.a
                    key={img}
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram preview ${idx + 1}`}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -3,
                          }
                    }
                    className={`
                      group
                      relative

                      overflow-hidden

                      bg-[#d9cdbd]

                      ${
                        featured
                          ? "col-span-2 row-span-2 aspect-square"
                          : "col-span-1 aspect-square"
                      }

                      dark:bg-[#25271f]
                    `}
                  >
                    <img
                      src={img}
                      alt={`Instagram preview ${idx + 1}`}
                      loading="lazy"
                      className="
                        h-full
                        w-full

                        object-cover

                        transition-transform
                        duration-700

                        ease-out

                        group-hover:scale-[1.06]
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0

                        bg-[#10261b]/25

                        opacity-0

                        transition-opacity
                        duration-400

                        group-hover:opacity-100
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-2

                        border
                        border-white/0

                        transition-all
                        duration-400

                        group-hover:border-white/30
                      "
                    />

                    <InstagramIcon
                      className="
                        absolute
                        left-1/2
                        top-1/2

                        h-4
                        w-4

                        -translate-x-1/2
                        -translate-y-1/2

                        scale-75

                        text-white

                        opacity-0

                        transition-all
                        duration-300

                        group-hover:scale-100
                        group-hover:opacity-100
                      "
                    />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ================================================================== */}
        {/*                       EDITORIAL SIGNATURE                          */}
        {/* ================================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 1,
          }}
          className="
            flex
            items-center
            justify-center
            gap-4

            border-t
            border-[#143d2b]/10

            py-7

            dark:border-white/[0.08]
          "
        >
          <span
            className="
              hidden
              h-px
              flex-1

              bg-gradient-to-r
              from-transparent
              to-[#143d2b]/10

              sm:block

              dark:to-white/[0.08]
            "
          />

          <span
            className="
              text-center

              font-heading

              text-sm
              italic
              tracking-[0.03em]

              text-[#143d2b]/45

              dark:text-[#eee5d7]/35
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Beautifully planned. Thoughtfully managed. Unforgettably yours.
          </span>

          <span
            className="
              hidden
              h-px
              flex-1

              bg-gradient-to-l
              from-transparent
              to-[#143d2b]/10

              sm:block

              dark:to-white/[0.08]
            "
          />
        </motion.div>

        {/* ================================================================== */}
        {/*                         COPYRIGHT BAR                              */}
        {/* ================================================================== */}

        <div
          className="
            flex
            flex-col

            items-center
            justify-between

            gap-4

            border-t
            border-[#143d2b]/10

            pt-6

            sm:flex-row

            dark:border-white/[0.08]
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                h-1
                w-1

                rotate-45

                bg-[#9b742f]/70

                dark:bg-[#d2b56b]/60
              "
            />

            <p
              className="
                text-[7px]
                font-medium
                uppercase
                tracking-[0.18em]

                text-[#143d2b]/30

                sm:text-[8px]

                dark:text-white/25
              "
            >
              © {currentYear} SAI Events · All Rights Reserved
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-5

              sm:gap-7
            "
          >
            <a
              href="#home"
              className="
                text-[7px]
                font-medium
                uppercase
                tracking-[0.17em]

                text-[#143d2b]/30

                transition-colors
                duration-300

                hover:text-[#9b742f]

                sm:text-[8px]

                dark:text-white/25
                dark:hover:text-[#d2b56b]
              "
            >
              Privacy Policy
            </a>

            <span
              className="
                h-1
                w-1

                rotate-45

                bg-[#143d2b]/15

                dark:bg-white/10
              "
            />

            <a
              href="#home"
              className="
                text-[7px]
                font-medium
                uppercase
                tracking-[0.17em]

                text-[#143d2b]/30

                transition-colors
                duration-300

                hover:text-[#9b742f]

                sm:text-[8px]

                dark:text-white/25
                dark:hover:text-[#d2b56b]
              "
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}