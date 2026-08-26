
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Feather,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import AuthForm from "@/components/auth/AuthForm";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ==================================================================
   REGISTER CONTENT
================================================================== */

function RegisterPageContent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full">
      {/* ============================================================
          EDITORIAL HEADER
      ============================================================ */}

      <motion.header
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.8,
          ease: EASE,
        }}
      >
        {/* ----------------------------------------------------------
            TITLE
        ---------------------------------------------------------- */}

        <div className="mb-3 flex items-center justify-between">
          <h1
            className="
              font-heading
              text-[clamp(2.7rem,7vw,4.55rem)]
              font-normal
              leading-[1.02]
              tracking-[-0.055em]
              text-[#143d2b]

              dark:text-[#f0e8db]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Your story{" "}
            <span
              className="
                italic
                text-[#9a742e]
                dark:text-[#d2b56b]
              "
            >
              begins.
            </span>
          </h1>
        </div>

        {/* ----------------------------------------------------------
            DESCRIPTION
        ---------------------------------------------------------- */}

        <p
          className="
            max-w-[480px]
            text-[13px]
            leading-[1.75]
            text-[#17392b]/80

            sm:text-[14px]

            dark:text-[#eee5d7]/80
          "
          style={{
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Create your private SAI Events account and bring your
          celebration from first thought to beautifully managed
          experience.
        </p>

        <div className="mt-5 h-px w-full bg-[#173d2c]/10 dark:bg-white/[0.08]" />
      </motion.header>

      {/* ============================================================
          AUTHENTICATION FORM
      ============================================================ */}

      <motion.div
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.7,
          delay: shouldReduceMotion ? 0 : 0.1,
          ease: EASE,
        }}
        className="mt-5"
      >
        <AuthForm mode="register" />
      </motion.div>

      {/* ============================================================
          EXISTING ACCOUNT
      ============================================================ */}

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
          duration: shouldReduceMotion ? 0.2 : 0.65,
          delay: shouldReduceMotion ? 0 : 0.2,
          ease: EASE,
        }}
        className="
          mt-5
          border-t border-[#173d2c]/10
          pt-4

          dark:border-white/[0.08]
        "
      >
        <Link
          href="/login"
          className="
            group
            flex w-full
            items-center
            justify-between
            gap-5
          "
        >
          {/* Text */}

          <div className="min-w-0 text-left">
            <span
              className="
                block
                text-[6px] font-bold uppercase
                tracking-[0.24em]
                text-[#173d2c]/30

                dark:text-white/22
              "
            >
              Already part of SAI?
            </span>

            <span
              className="
                mt-1 block
                font-heading
                text-[16px]
                text-[#173d2c]

                transition-colors
                duration-300

                group-hover:text-[#9a742e]

                dark:text-[#f0e8db]
                dark:group-hover:text-[#d2b56b]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Return to your account
            </span>
          </div>

          {/* Arrow */}

          <div
            className="
              relative
              flex h-9 w-9
              flex-shrink-0
              items-center
              justify-center

              overflow-hidden

              border border-[#173d2c]/15

              text-[#173d2c]/50

              transition-all
              duration-500

              group-hover:border-[#143d2b]
              group-hover:bg-[#143d2b]
              group-hover:text-white

              dark:border-white/10
              dark:text-white/40

              dark:group-hover:border-[#d2b56b]
              dark:group-hover:bg-[#d2b56b]
              dark:group-hover:text-[#161812]
            "
          >
            <ArrowUpRight
              className="
                h-3.5 w-3.5

                transition-transform
                duration-300

                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </div>
        </Link>
      </motion.div>

      {/* ============================================================
          MOBILE TRUST SIGNATURE

          Desktop AuthLayout already provides the footer trust line,
          so this is intentionally hidden on large screens.
      ============================================================ */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.7,
          delay: shouldReduceMotion ? 0 : 0.28,
        }}
        className="
          mt-5
          flex items-center
          justify-center
          gap-3

          lg:hidden
        "
      >
        <span
          aria-hidden="true"
          className="
            h-px w-5
            bg-[#173d2c]/10
            dark:bg-white/[0.07]
          "
        />

        <span
          aria-hidden="true"
          className="
            h-[3px] w-[3px]
            rotate-45
            bg-[#a17a34]/55

            dark:bg-[#d2b56b]/50
          "
        />

        <span
          className="
            text-center
            text-[5.5px] font-semibold uppercase
            tracking-[0.2em]
            text-[#173d2c]/22

            dark:text-white/18
          "
        >
          One Account · One Journey · One Team
        </span>

        <span
          aria-hidden="true"
          className="
            h-[3px] w-[3px]
            rotate-45
            bg-[#a17a34]/55

            dark:bg-[#d2b56b]/50
          "
        />

        <span
          aria-hidden="true"
          className="
            h-px w-5
            bg-[#173d2c]/10
            dark:bg-white/[0.07]
          "
        />
      </motion.div>
    </div>
  );
}

/* ==================================================================
   LOADING STATE
================================================================== */

function RegistrationFallback() {
  return (
    <div
      className="
        flex min-h-[280px]
        w-full
        flex-col
        items-center
        justify-center
      "
    >
      {/* Seal loader */}

      <div
        className="
          relative
          flex h-16 w-16
          items-center
          justify-center
          rounded-full

          border border-[#173d2c]/10

          dark:border-white/[0.08]
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute inset-[6px]
            rounded-full

            border border-dashed
            border-[#a17a34]/25

            dark:border-[#d2b56b]/25
          "
        />

        <LoaderCircle
          className="
            h-4 w-4
            animate-spin

            text-[#a17a34]

            dark:text-[#d2b56b]
          "
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="
            h-px w-5
            bg-[#173d2c]/15

            dark:bg-white/10
          "
        />

        <span
          className="
            text-[6.5px] font-bold uppercase
            tracking-[0.27em]
            text-[#173d2c]/35

            dark:text-[#eee5d7]/30
          "
        >
          Preparing your journey
        </span>

        <span
          aria-hidden="true"
          className="
            h-px w-5
            bg-[#173d2c]/15

            dark:bg-white/10
          "
        />
      </div>

      <span
        className="
          mt-3
          font-heading
          text-[11px] italic
          text-[#a17a34]/50

          dark:text-[#d2b56b]/45
        "
        style={{
          fontFamily: '"Playfair Display", serif',
        }}
      >
        SAI Events
      </span>
    </div>
  );
}

/* ==================================================================
   PAGE
================================================================== */

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegistrationFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}
