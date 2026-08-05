"use client";

import React from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import AuthForm from "@/components/auth/AuthForm";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full">
      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}

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
        {/* Eyebrow */}

        <div
          className="
            mb-4
            flex items-center
            justify-between
            gap-4
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-px w-7 flex-shrink-0 bg-[#173d2c]/35 dark:bg-[#d2b56b]/40" />

            <Sparkles className="h-2.5 w-2.5 text-[#a17a34] dark:text-[#d2b56b]" />

            <span
              className="
                text-[7px] font-bold uppercase
                tracking-[0.28em]
                text-[#173d2c]/55
                dark:text-[#d9c88d]/65
              "
            >
              Client Access
            </span>
          </div>

          <span
            className="
              text-[6px] font-semibold uppercase
              tracking-[0.22em]
              text-[#173d2c]/22
              dark:text-white/18
            "
          >
            01 / SIGN IN
          </span>
        </div>

        {/* Main title row */}

        <div
          className="
            flex items-end
            justify-between
            gap-6
          "
        >
          <h1
            className="
              font-heading
              text-[clamp(2.85rem,7vw,4.65rem)]
              font-normal
              leading-[0.86]
              tracking-[-0.055em]
              text-[#143d2b]
              dark:text-[#f0e8db]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Welcome{" "}
            <span
              className="
                italic
                text-[#9a742e]
                dark:text-[#d2b56b]
              "
            >
              back.
            </span>
          </h1>

          <span
            aria-hidden="true"
            className="
              mb-1 hidden
              font-heading
              text-3xl italic
              text-[#173d2c]/[0.08]
              sm:block
              dark:text-white/[0.05]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            S
          </span>
        </div>

        <div
          className="
            mt-4
            grid grid-cols-1
            items-end
            gap-4
            sm:grid-cols-[1fr_auto]
          "
        >
          <p
            className="
              max-w-[430px]
              text-[10px]
              leading-[1.75]
              text-[#17392b]/50
              sm:text-[11px]
              dark:text-[#eee5d7]/42
            "
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Continue your event journey and pick up exactly
            where you left off.
          </p>

          <span
            className="
              hidden
              text-[6px] font-semibold uppercase
              tracking-[0.23em]
              text-[#a17a34]/65
              sm:block
              dark:text-[#d2b56b]/55
            "
          >
            Welcome home
          </span>
        </div>

        {/* Editorial divider */}

        <div className="mt-5 flex items-center gap-3">
          <span
            className="
              text-[6.5px] font-bold uppercase
              tracking-[0.25em]
              text-[#a17a34]
              dark:text-[#d2b56b]
            "
          >
            Credentials
          </span>

          <span className="h-px flex-1 bg-[#173d2c]/10 dark:bg-white/[0.08]" />

          <span className="h-1.5 w-1.5 rotate-45 bg-[#a17a34]/55" />
        </div>
      </motion.header>

      {/* ================================================================ */}
      {/* FORM                                                             */}
      {/* ================================================================ */}

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
        <AuthForm mode="login" />
      </motion.div>

      {/* ================================================================ */}
      {/* REGISTRATION CTA                                                 */}
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
          href="/register"
          className="
            group
            flex w-full
            items-center
            justify-between
            gap-5
          "
        >
          <div className="min-w-0">
            <span
              className="
                block
                text-[6px] font-bold uppercase
                tracking-[0.24em]
                text-[#173d2c]/30
                dark:text-white/22
              "
            >
              New to SAI?
            </span>

            <span
              className="
                mt-1 block
                font-heading
                text-[16px]
                text-[#173d2c]
                transition-colors duration-300
                group-hover:text-[#9a742e]
                dark:text-[#f0e8db]
                dark:group-hover:text-[#d2b56b]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Begin your event journey
            </span>
          </div>

          <div
            className="
              flex h-9 w-9
              flex-shrink-0
              items-center justify-center
              border border-[#173d2c]/15
              text-[#173d2c]/50
              transition-all duration-400

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
                transition-transform duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}