"use client";

import React, { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import { ArrowUpRight, Sparkles } from "lucide-react";

import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";
import ScrollHeading from "@/components/Common/ScrollHeading";

const categories = [
  "All",
  "Weddings",
  "Engagements",
  "Birthdays",
  "Corporate",
  "Decorations",
];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [hasEntered, setHasEntered] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const filteredItems =
    filter === "All"
      ? LANDING_PAGE_CONFIG.gallery
      : LANDING_PAGE_CONFIG.gallery.filter(
          (item) => item.category === filter
        );

  /* -------------------------------------------------------------------------- */
  /*                           EDITORIAL GRID LOGIC                             */
  /* -------------------------------------------------------------------------- */

  const getItemStyle = (index: number) => {
    const pattern = index % 8;

    switch (pattern) {
      case 0:
        return "md:col-span-7 md:row-span-2";

      case 1:
        return "md:col-span-5 md:row-span-1";

      case 2:
        return "md:col-span-5 md:row-span-1";

      case 3:
        return "md:col-span-4 md:row-span-1";

      case 4:
        return "md:col-span-8 md:row-span-2";

      case 5:
        return "md:col-span-4 md:row-span-1";

      case 6:
        return "md:col-span-4 md:row-span-1";

      case 7:
        return "md:col-span-4 md:row-span-1";

      default:
        return "md:col-span-4";
    }
  };

  const getImageHeight = (index: number) => {
    const pattern = index % 8;

    if (pattern === 0 || pattern === 4) {
      return "min-h-[380px] sm:min-h-[480px] md:min-h-[560px]";
    }

    return "min-h-[300px] sm:min-h-[340px] md:min-h-[270px]";
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        border-t
        border-[#173d2c]/10

        bg-[#f7f0e6]

        py-20
        sm:py-24
        lg:py-28

        select-none

        dark:border-white/[0.08]
        dark:bg-[#191b17]
      "
    >
      {/* ==================================================================== */}
      {/*                        BACKGROUND DETAILS                            */}
      {/* ==================================================================== */}

      {/* giant editorial typography */}

      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 1.5,
        }}
        className="
          pointer-events-none
          absolute
          -right-10
          top-[6%]

          hidden

          font-heading
          text-[clamp(8rem,18vw,19rem)]
          font-normal
          italic
          leading-none
          tracking-[-0.08em]

          text-[#173d2c]/[0.025]

          xl:block

          dark:text-white/[0.018]
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        Gallery
      </motion.span>

      {/* vertical guide */}

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

          bg-[#173d2c]/10

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

          bg-[#173d2c]/10

          lg:block

          dark:bg-white/[0.06]
        "
      />

      {/* subtle warm ambient glow */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[15%]
          top-[18%]

          h-[420px]
          w-[420px]

          rounded-full

          bg-[#d4af37]/[0.035]

          blur-[130px]

          dark:bg-[#d4af37]/[0.025]
        "
      />

      {/* ==================================================================== */}
      {/*                           MAIN CONTAINER                             */}
      {/* ==================================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]

          px-6
          sm:px-8
          lg:px-[7%]
      "
      >
        {/* ================================================================== */}
        {/*                              HEADER                               */}
        {/* ================================================================== */}

        <div
          className="
            grid
            grid-cols-1

            items-end
            gap-8

            border-b
            border-[#173d2c]/10

            pb-8

            md:grid-cols-[1fr_auto]

            dark:border-white/[0.08]
          "
        >
          {/* --------------------------------------------------------------- */}
          {/* LEFT HEADER                                                     */}
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
                duration: shouldReduceMotion ? 0.2 : 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                mb-4
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  h-px
                  w-8

                  bg-[#173d2c]/45

                  dark:bg-[#d4af37]/50
                "
              />

              <Sparkles
                className="
                  h-3
                  w-3

                  text-[#a17a34]

                  dark:text-[#d4af37]
                "
              />

              <span
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.32em]

                  text-[#173d2c]/55

                  sm:text-[9px]

                  dark:text-[#d9c88d]/70
                "
              >
                Visual Memories
              </span>
            </motion.div>

            <ScrollHeading
              title="Our Gallery"
              className="
                max-w-[750px]

                font-heading
                text-[clamp(3.2rem,7vw,6.8rem)]
                font-normal
                leading-[0.95]
                tracking-[-0.055em]

                text-[#143d2b]

                dark:text-[#f0e8db]
              "
            />

            {/* editorial description */}

            <motion.p
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
                mt-5
                max-w-[540px]

                text-[12px]
                font-normal
                leading-[1.8]

                text-[#17392b]/60

                sm:text-[13px]

                dark:text-[#eee5d7]/50
              "
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              A collection of celebrations, details and unforgettable
              moments thoughtfully brought to life by SAI Events.
            </motion.p>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* RIGHT EDITORIAL NUMBER                                          */}
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
            }}
            className="
              hidden
              items-end
              gap-3

              md:flex
            "
          >
            <span
              className="
                font-heading
                text-4xl
                italic
                leading-none

                text-[#a17a34]

                dark:text-[#d2b56b]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              02
            </span>

            <div className="mb-1">
              <span
                className="
                  block
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.25em]

                  text-[#173d2c]/35

                  dark:text-white/25
                "
              >
                Selected
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.25em]

                  text-[#173d2c]/35

                  dark:text-white/25
                "
              >
                Memories
              </span>
            </div>
          </motion.div>
        </div>

        {/* ================================================================== */}
        {/*                         CATEGORY FILTERS                           */}
        {/* ================================================================== */}

        <div
          className="
            relative
            flex
            items-center

            border-b
            border-[#173d2c]/10

            dark:border-white/[0.08]
          "
        >
          <div
            className="
              flex
              w-full

              items-center

              gap-7

              overflow-x-auto

              py-5

              [scrollbar-width:none]

              [&::-webkit-scrollbar]:hidden

              sm:gap-9
            "
          >
            {categories.map((cat) => {
              const active = filter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="
                    group
                    relative

                    flex-shrink-0

                    cursor-pointer

                    py-2

                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    transition-colors
                    duration-300

                    sm:text-[9px]
                  "
                >
                  <span
                    className={
                      active
                        ? "text-[#143d2b] dark:text-[#e2c675]"
                        : `
                          text-[#173d2c]/40

                          group-hover:text-[#173d2c]/75

                          dark:text-white/30

                          dark:group-hover:text-white/60
                        `
                    }
                  >
                    {cat}
                  </span>

                  {/* active indicator */}

                  {active && (
                    <motion.span
                      layoutId="gallery-active-category"
                      className="
                        absolute
                        bottom-0
                        left-0

                        h-px
                        w-full

                        bg-[#a17a34]

                        dark:bg-[#d4af37]
                      "
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* number of works */}

          <span
            className="
              ml-6
              hidden
              flex-shrink-0

              border-l
              border-[#173d2c]/10

              pl-6

              text-[8px]
              font-semibold
              uppercase
              tracking-[0.2em]

              text-[#173d2c]/30

              lg:block

              dark:border-white/[0.08]
              dark:text-white/25
            "
          >
            {String(filteredItems.length).padStart(2, "0")} Stories
          </span>
        </div>

        {/* ================================================================== */}
        {/*                           GALLERY GRID                             */}
        {/* ================================================================== */}

        <div
          ref={(el) => {
            if (!el || hasEntered) return;

            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  setHasEntered(true);
                  observer.disconnect();
                }
              },
              {
                rootMargin: "-80px",
              }
            );

            observer.observe(el);
          }}
          className="
            mt-8
            grid
            w-full

            grid-cols-1

            gap-4

            sm:grid-cols-2

            md:auto-rows-[270px]
            md:grid-cols-12
            md:gap-5

            lg:auto-rows-[290px]
          "
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const itemNumber = String(idx + 1).padStart(2, "0");

              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 24,
                    scale: shouldReduceMotion ? 1 : 0.985,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: shouldReduceMotion ? 1 : 0.96,
                  }}
                  transition={{
                    opacity: {
                      duration: 0.5,
                      delay: hasEntered ? 0 : idx * 0.055,
                    },

                    y: {
                      duration: 0.65,
                      delay: hasEntered ? 0 : idx * 0.055,
                      ease: [0.16, 1, 0.3, 1],
                    },

                    scale: {
                      duration: 0.65,
                      delay: hasEntered ? 0 : idx * 0.055,
                      ease: [0.16, 1, 0.3, 1],
                    },

                    layout: {
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                  className={`
                    group
                    relative

                    overflow-hidden

                    bg-[#ddd3c5]

                    cursor-pointer

                    ${getItemStyle(idx)}
                    ${getImageHeight(idx)}

                    dark:bg-[#24261f]
                  `}
                >
                  {/* ======================================================== */}
                  {/*                         IMAGE                            */}
                  {/* ======================================================== */}

                  <motion.img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    initial={false}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 1.045,
                          }
                    }
                    transition={{
                      duration: 1.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="
                      absolute
                      inset-0

                      h-full
                      w-full

                      object-cover

                      transition-[filter]
                      duration-700

                      group-hover:saturate-[0.9]
                    "
                  />

                  {/* ======================================================== */}
                  {/*                       IMAGE WASH                         */}
                  {/* ======================================================== */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      z-10

                      bg-gradient-to-t

                      from-[#10261b]/75
                      via-[#10261b]/5
                      to-transparent

                      opacity-70

                      transition-opacity
                      duration-500

                      group-hover:opacity-90
                    "
                  />

                  {/* warm editorial tone */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      z-[11]

                      bg-[#b58c54]/[0.035]

                      mix-blend-multiply
                    "
                  />

                  {/* ======================================================== */}
                  {/*                       TOP DETAILS                        */}
                  {/* ======================================================== */}

                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-0
                      z-20

                      flex
                      items-start
                      justify-between

                      p-4

                      sm:p-5
                    "
                  >
                    <span
                      className="
                        border
                        border-white/20

                        bg-black/10

                        px-2.5
                        py-1.5

                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.22em]

                        text-white/80

                        backdrop-blur-md
                      "
                    >
                      {item.category}
                    </span>

                    <span
                      className="
                        font-heading
                        text-lg
                        italic

                        text-white/65
                      "
                      style={{
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {itemNumber}
                    </span>
                  </div>

                  {/* ======================================================== */}
                  {/*                    BOTTOM INFORMATION                    */}
                  {/* ======================================================== */}

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      z-20

                      p-5

                      sm:p-6
                    "
                  >
                    {/* gold line */}

                    <motion.div
                      initial={false}
                      className="
                        mb-3
                        h-px
                        w-7

                        origin-left

                        bg-[#d8ba6c]

                        transition-all
                        duration-500

                        group-hover:w-12
                      "
                    />

                    <h3
                      className="
                        max-w-[90%]

                        font-heading

                        text-xl
                        font-normal
                        leading-[1.08]

                        text-white

                        sm:text-2xl

                        lg:text-[1.65rem]
                      "
                      style={{
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {item.title}
                    </h3>

                    <div
                      className="
                        mt-2
                        flex
                        items-end
                        justify-between
                        gap-3
                      "
                    >
                      <div>
                        {item.location && (
                          <span
                            className="
                              block

                              text-[8px]
                              font-medium
                              uppercase
                              tracking-[0.18em]

                              text-white/50
                            "
                          >
                            {item.location}
                            {item.year && ` · ${item.year}`}
                          </span>
                        )}
                      </div>

                      {/* view story interaction */}

                      <div
                        className="
                          flex
                          translate-y-2
                          items-center
                          gap-1.5

                          opacity-0

                          transition-all
                          duration-400

                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      >
                        <span
                          className="
                            hidden

                            text-[7px]
                            font-bold
                            uppercase
                            tracking-[0.18em]

                            text-white/70

                            lg:inline
                          "
                        >
                          View
                        </span>

                        <span
                          className="
                            flex
                            h-7
                            w-7

                            items-center
                            justify-center

                            border
                            border-white/30

                            bg-white/10

                            backdrop-blur-md
                          "
                        >
                          <ArrowUpRight
                            className="
                              h-3
                              w-3

                              text-white

                              transition-transform
                              duration-300

                              group-hover:translate-x-[1px]
                              group-hover:-translate-y-[1px]
                            "
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/*                     BORDER REVEAL                        */}
                  {/* ======================================================== */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none

                      absolute
                      inset-0
                      z-30

                      border
                      border-[#d4af37]/0

                      transition-all
                      duration-500

                      group-hover:inset-[8px]
                      group-hover:border-[#e0c478]/35
                    "
                  />
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ================================================================== */}
        {/*                         EMPTY STATE                                */}
        {/* ================================================================== */}

        <AnimatePresence>
          {filteredItems.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                flex
                min-h-[300px]
                flex-col
                items-center
                justify-center

                border-b
                border-[#173d2c]/10

                text-center

                dark:border-white/[0.08]
              "
            >
              <span
                className="
                  font-heading
                  text-4xl
                  italic

                  text-[#a17a34]

                  dark:text-[#d2b56b]
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Coming Soon
              </span>

              <p
                className="
                  mt-3

                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]

                  text-[#173d2c]/35

                  dark:text-white/25
                "
              >
                New memories are being curated
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================== */}
        {/*                     BOTTOM EDITORIAL STRIP                         */}
        {/* ================================================================== */}

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
          }}
          className="
            mt-10

            flex
            items-center
            justify-between
            gap-5

            border-t
            border-[#173d2c]/10

            pt-5

            dark:border-white/[0.08]
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                h-1.5
                w-1.5

                rotate-45

                bg-[#a17a34]
              "
            />

            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-[0.24em]

                text-[#173d2c]/35

                sm:text-[8px]

                dark:text-white/25
              "
            >
              Every frame holds a story
            </span>
          </div>

          <div
            className="
              hidden
              items-center
              gap-3

              sm:flex
            "
          >
            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-[0.24em]

                text-[#173d2c]/35

                dark:text-white/25
              "
            >
              SAI Events
            </span>

            <span
              className="
                h-px
                w-8

                bg-[#173d2c]/15

                dark:bg-white/10
              "
            />

            <span
              className="
                font-heading
                text-sm
                italic

                text-[#a17a34]/80

                dark:text-[#d2b56b]/80
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Memories
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}