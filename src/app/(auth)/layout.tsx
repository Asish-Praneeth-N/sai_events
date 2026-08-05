import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="
        relative min-h-[100svh] w-full
        overflow-x-hidden
        bg-[#e8ceb3]
        p-2
        transition-colors duration-300
        sm:p-3
        lg:h-[100svh] lg:overflow-hidden lg:p-4
        dark:bg-[#11130f]
      "
    >
      {/* ================================================================ */}
      {/* MASTER FRAME                                                     */}
      {/* ================================================================ */}

      <div
        className="
          relative mx-auto
          min-h-[calc(100svh-1rem)]
          w-full max-w-[1800px]
          overflow-hidden
          border border-[#173d2c]/10
          bg-[#f7f0e6]
          shadow-[0_24px_80px_rgba(70,45,22,0.10)]

          sm:min-h-[calc(100svh-1.5rem)]

          lg:grid
          lg:h-[calc(100svh-2rem)]
          lg:min-h-0
          lg:grid-cols-[42%_58%]

          dark:border-white/[0.08]
          dark:bg-[#191b17]
          dark:shadow-[0_24px_80px_rgba(0,0,0,0.38)]
        "
      >
        {/* ============================================================ */}
        {/* THEME                                                        */}
        {/* ============================================================ */}

        <div
          className="
            absolute right-4 top-4 z-[60]
            sm:right-5 sm:top-5
            lg:right-7 lg:top-6
          "
        >
          <ThemeToggle />
        </div>

        {/* ============================================================ */}
        {/* LEFT CINEMATIC PANEL                                         */}
        {/* ============================================================ */}

        <aside
          className="
            relative
            h-[245px]
            overflow-hidden
            sm:h-[290px]
            lg:h-full
          "
        >
          {/* Photography */}

          <img
            src="/images/wedding.png"
            alt=""
            aria-hidden="true"
            className="
              absolute inset-0
              h-full w-full
              object-cover object-center
              scale-[1.025]
            "
          />

          {/* Grading */}

          <div
            aria-hidden="true"
            className="
              absolute inset-0
              bg-gradient-to-t
              from-[#07130d]/95
              via-[#10291d]/38
              to-[#0d2118]/18

              lg:bg-gradient-to-br
              lg:from-[#10271d]/15
              lg:via-[#10271d]/28
              lg:to-[#07130d]/92
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute inset-0
              bg-[#b58b42]/[0.035]
            "
          />

          {/* Editorial lines */}

          <div
            aria-hidden="true"
            className="
              absolute left-[8%] top-0 bottom-0
              hidden w-px bg-white/10
              lg:block
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute right-[8%] top-0 bottom-0
              hidden w-px bg-white/10
              lg:block
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute left-0 right-0 top-[82px]
              hidden h-px bg-white/10
              lg:block
            "
          />

          {/* ========================================================== */}
          {/* BRAND                                                      */}
          {/* ========================================================== */}

          <div
            className="
              absolute left-0 right-0 top-0 z-20
              flex items-center justify-between
              px-5 py-5
              sm:px-7
              lg:px-[10%] lg:py-6
            "
          >
            <Link
              href="/"
              className="
                group flex items-center gap-3
              "
            >
              <div
                className="
                  relative
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  border border-white/25
                  bg-white/10
                  backdrop-blur-md
                  transition-all duration-500
                  group-hover:border-[#e0c06a]/70
                  group-hover:bg-[#e0c06a]/15
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-[#e5c873]" />

                <span
                  aria-hidden="true"
                  className="
                    absolute inset-[4px]
                    rounded-full
                    border border-dashed border-white/10
                  "
                />
              </div>

              <div>
                <span
                  className="
                    block
                    font-heading
                    text-[17px]
                    font-normal
                    leading-none
                    text-[#fffaf1]
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  SAI Events
                </span>

                <span
                  className="
                    mt-1 hidden
                    text-[5.5px] font-semibold uppercase
                    tracking-[0.3em]
                    text-white/45
                    sm:block
                  "
                >
                  Curated Celebrations
                </span>
              </div>
            </Link>

            <span
              className="
                hidden
                text-[6px] font-semibold uppercase
                tracking-[0.27em]
                text-white/35
                lg:block
              "
            >
              Private Client Entry
            </span>
          </div>

          {/* ========================================================== */}
          {/* HUGE BACKGROUND TYPE                                       */}
          {/* ========================================================== */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -left-5 bottom-[17%]
              hidden
              select-none
              font-heading
              text-[clamp(8rem,13vw,14rem)]
              italic
              leading-none
              tracking-[-0.09em]
              text-white/[0.035]
              lg:block
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            SAI
          </span>

          {/* ========================================================== */}
          {/* DESKTOP EDITORIAL NUMBER                                   */}
          {/* ========================================================== */}

          <div
            className="
              absolute left-[4%] top-1/2 z-20
              hidden -translate-y-1/2
              flex-col items-center
              lg:flex
            "
          >
            <span
              className="
                font-heading
                text-xl italic
                text-[#e0c06a]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              01
            </span>

            <span className="my-3 h-12 w-px bg-white/20" />

            <span
              className="
                rotate-180
                [writing-mode:vertical-rl]
                text-[6px] font-bold uppercase
                tracking-[0.3em]
                text-white/35
              "
            >
              Welcome
            </span>
          </div>

          {/* ========================================================== */}
          {/* STORY                                                      */}
          {/* ========================================================== */}

          <div
            className="
              absolute bottom-5 left-5 right-5 z-20
              sm:bottom-7 sm:left-7 sm:right-7
              lg:bottom-[8%] lg:left-[10%] lg:right-[10%]
            "
          >
            <div
              className="
                mb-3 flex items-center gap-3
                lg:mb-5
              "
            >
              <span className="h-px w-7 bg-[#e0c06a]/70 lg:w-10" />

              <Star
                className="
                  h-2.5 w-2.5
                  fill-[#e0c06a]
                  stroke-[#e0c06a]
                "
              />

              <span
                className="
                  text-[6px] font-bold uppercase
                  tracking-[0.27em]
                  text-[#e0c06a]
                  lg:text-[7px]
                "
              >
                Your celebration begins here
              </span>
            </div>

            <h2
              className="
                max-w-[680px]
                font-heading
                text-[clamp(1.75rem,6vw,2.65rem)]
                font-normal
                leading-[0.95]
                tracking-[-0.04em]
                text-[#fffaf1]

                lg:text-[clamp(3rem,4.1vw,5.2rem)]
                lg:leading-[0.9]
                lg:tracking-[-0.055em]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Moments worth
              <br className="hidden lg:block" />{" "}
              <span className="italic text-[#e0c06a]">
                remembering.
              </span>
            </h2>

            <p
              className="
                mt-3 hidden
                max-w-[390px]
                text-[10px]
                leading-[1.8]
                text-white/50
                lg:block
              "
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              One team. One thoughtful journey. Every detail
              handled with intention from the first idea to
              the final celebration.
            </p>

            {/* trust strip */}

            <div
              className="
                mt-6 hidden
                grid-cols-3
                border-y border-white/10
                lg:grid
              "
            >
              <div className="py-3 pr-3">
                <span
                  className="
                    block font-heading
                    text-lg italic
                    text-[#fffaf1]
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
                    text-[5.5px] font-semibold uppercase
                    tracking-[0.2em]
                    text-white/35
                  "
                >
                  Planning
                </span>
              </div>

              <div
                className="
                  border-x border-white/10
                  px-4 py-3
                "
              >
                <span
                  className="
                    block font-heading
                    text-lg italic
                    text-[#fffaf1]
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
                    text-[5.5px] font-semibold uppercase
                    tracking-[0.2em]
                    text-white/35
                  "
                >
                  Team
                </span>
              </div>

              <div className="py-3 pl-4">
                <span
                  className="
                    block font-heading
                    text-lg italic
                    text-[#fffaf1]
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
                    text-[5.5px] font-semibold uppercase
                    tracking-[0.2em]
                    text-white/35
                  "
                >
                  Detail
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SEAL                                                       */}
          {/* ========================================================== */}

          <div
            className="
              absolute right-[8%] top-[16%] z-20
              hidden
              h-[82px] w-[82px]
              items-center justify-center
              rounded-full
              border border-white/20
              bg-black/10
              backdrop-blur-md
              lg:flex
            "
          >
            <div
              className="
                absolute inset-[6px]
                rounded-full
                border border-dashed border-[#e0c06a]/40
              "
            />

            <div className="text-center">
              <Heart
                className="
                  mx-auto mb-1
                  h-3.5 w-3.5
                  text-[#e0c06a]
                "
              />

              <span
                className="
                  block
                  text-[5px] font-bold uppercase
                  tracking-[0.2em]
                  text-white/60
                "
              >
                Made
              </span>

              <span
                className="
                  block
                  text-[5px] uppercase
                  tracking-[0.16em]
                  text-white/35
                "
              >
                with care
              </span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* PHOTO CAPTION                                              */}
          {/* ========================================================== */}

          <div
            className="
              absolute bottom-[8%] right-[8%] z-20
              hidden
              items-center gap-2
              xl:flex
            "
          >
            <CalendarDays className="h-3 w-3 text-[#e0c06a]/70" />

            <span
              className="
                text-[5.5px] font-semibold uppercase
                tracking-[0.22em]
                text-white/35
              "
            >
              Designed · Managed · Delivered
            </span>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* AUTH STUDIO                                                  */}
        {/* ============================================================ */}

        <section
          className="
            relative
            flex min-h-0 flex-col
            bg-[#f7f0e6]
            dark:bg-[#191b17]
          "
        >
          {/* Background SAI */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -right-8 top-[8%]
              hidden
              select-none
              font-heading
              text-[clamp(8rem,14vw,15rem)]
              italic
              leading-none
              tracking-[-0.09em]
              text-[#173d2c]/[0.022]
              xl:block
              dark:text-white/[0.015]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            SAI
          </span>

          {/* vertical editorial guide */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute bottom-0 left-[7%] top-0
              hidden w-px
              bg-[#173d2c]/[0.06]
              xl:block
              dark:bg-white/[0.04]
            "
          />

          {/* Desktop navigation */}

          <div
            className="
              hidden
              h-[74px]
              flex-shrink-0
              items-center
              justify-between
              border-b border-[#173d2c]/10
              px-[9%]
              lg:flex
              dark:border-white/[0.07]
            "
          >
            <Link
              href="/"
              className="
                group
                flex items-center gap-2.5
                text-[6.5px] font-bold uppercase
                tracking-[0.25em]
                text-[#173d2c]/35
                transition-colors duration-300
                hover:text-[#a17a34]
                dark:text-white/30
                dark:hover:text-[#d2b56b]
              "
            >
              <ArrowLeft
                className="
                  h-3 w-3
                  transition-transform duration-300
                  group-hover:-translate-x-1
                "
              />

              Return to Experience
            </Link>

            <span
              className="
                pr-12
                text-[6px] font-semibold uppercase
                tracking-[0.25em]
                text-[#173d2c]/20
                dark:text-white/15
              "
            >
              SAI · Private Portal
            </span>
          </div>

          {/* ========================================================== */}
          {/* CHILD CONTENT                                              */}
          {/* ========================================================== */}

          <div
            className="
              relative z-10
              flex min-h-0 flex-1
              justify-center

              px-5 py-7

              sm:px-8 sm:py-8

              lg:overflow-y-auto
              lg:px-[10%]
              lg:py-7

              xl:px-[12%]

              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-thumb]:bg-[#173d2c]/10
              dark:[&::-webkit-scrollbar-thumb]:bg-white/10
            "
          >
            <div
              className="
                my-auto
                w-full
                max-w-[680px]
              "
            >
              {children}
            </div>
          </div>

          {/* desktop footer */}

          <div
            className="
              hidden
              h-[48px]
              flex-shrink-0
              items-center
              justify-between
              border-t border-[#173d2c]/10
              px-[9%]
              lg:flex
              dark:border-white/[0.07]
            "
          >
            <span
              className="
                text-[5.5px] font-semibold uppercase
                tracking-[0.24em]
                text-[#173d2c]/22
                dark:text-white/18
              "
            >
              Private · Secure · Personal
            </span>

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rotate-45 bg-[#a17a34]/60" />

              <span
                className="
                  font-heading
                  text-[10px] italic
                  text-[#173d2c]/40
                  dark:text-[#d2b56b]/55
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                SAI Events
              </span>
            </div>
          </div>

          {/* Mobile return */}

          <div
            className="
              border-t border-[#173d2c]/10
              px-5 py-4
              text-center
              lg:hidden
              dark:border-white/[0.07]
            "
          >
            <Link
              href="/"
              className="
                inline-flex items-center gap-2
                text-[6.5px] font-bold uppercase
                tracking-[0.22em]
                text-[#173d2c]/35
                transition-colors
                hover:text-[#a17a34]
                dark:text-white/25
              "
            >
              <ArrowLeft className="h-3 w-3" />
              Return to Experience
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}