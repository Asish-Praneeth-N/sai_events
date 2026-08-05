"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import AuthForm from "@/components/auth/AuthForm";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full">
      {/* ============================================================
          HEADER
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
          duration: shouldReduceMotion ? 0.2 : 0.75,
          ease: EASE,
        }}
        className="relative mb-8"
      >
        {/* Editorial eyebrow */}

        <div className="mb-6 flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-7 flex-shrink-0 bg-[#9A7531]/50 dark:bg-[#D4AF37]/40"
            />

            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#9A7531] dark:text-[#D4AF37]">
              Client Access
            </span>
          </div>

          <span className="flex-shrink-0 text-[7px] font-semibold uppercase tracking-[0.24em] text-[#173D2A]/25 dark:text-white/20">
            SAI · 01
          </span>
        </div>

        {/* Main title */}

        <div className="relative">
          <h1
            className="
              max-w-[420px]
              text-[clamp(2.8rem,7vw,4.35rem)]
              font-normal leading-[0.94] tracking-[-0.045em]
              text-[#173D2A] dark:text-[#F4EFE6]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Welcome
            <br />

            <span className="italic text-[#9A7531] dark:text-[#D4AF37]">
              back.
            </span>
          </h1>

          {/* Small decorative mark */}

          <div
            aria-hidden="true"
            className="
              absolute right-0 top-2
              hidden sm:flex
              h-12 w-12
              items-center justify-center
              rounded-full
              border border-[#173D2A]/10 dark:border-white/[0.07]
            "
          >
            <Sparkles className="h-3.5 w-3.5 text-[#9A7531]/60 dark:text-[#D4AF37]/55" />
          </div>
        </div>

        {/* Description */}

        <p
          className="
            mt-5 max-w-[390px]
            text-[10px] sm:text-[11px]
            font-light leading-[1.85]
            text-[#173D2A]/45 dark:text-[#F7F3EC]/40
          "
          style={{
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Return to your event journey, review your plans and continue
          creating something memorable with SAI Events.
        </p>

        {/* Decorative rule */}

        <div className="mt-7 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#173D2A]/10 dark:bg-white/[0.08]" />

          <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-[#173D2A]/25 dark:text-white/20">
            Sign in
          </span>

          <span className="h-px w-9 bg-[#9A7531]/35 dark:bg-[#D4AF37]/30" />
        </div>
      </motion.header>

      {/* ============================================================
          AUTHENTICATION FORM

          Authentication functionality intentionally untouched.
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
      >
        <AuthForm mode="login" />
      </motion.div>

      {/* ============================================================
          ACCOUNT CREATION
      ============================================================ */}

      <motion.div
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 12,
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
          mt-8
          border-t border-[#173D2A]/10 dark:border-white/[0.08]
          pt-6
        "
      >
        <Link
          href="/register"
          className="group flex w-full items-center justify-between gap-5"
        >
          <div className="min-w-0 text-left">
            <span className="block text-[7px] font-bold uppercase tracking-[0.25em] text-[#173D2A]/30 dark:text-white/25">
              First time here?
            </span>

            <span
              className="
                mt-1.5 block text-[17px] font-normal
                text-[#173D2A] dark:text-[#F4EFE6]
                transition-colors duration-300
                group-hover:text-[#9A7531] dark:group-hover:text-[#D4AF37]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Begin your event journey
            </span>
          </div>

          {/* Arrow action */}

          <div
            className="
              relative flex h-11 w-11 flex-shrink-0
              items-center justify-center
              overflow-hidden rounded-full
              border border-[#173D2A]/15 dark:border-white/10
              text-[#173D2A]/55 dark:text-white/45
              transition-all duration-500
              group-hover:border-[#9A7531] group-hover:bg-[#9A7531] group-hover:text-white
              dark:group-hover:border-[#D4AF37] dark:group-hover:bg-[#D4AF37] dark:group-hover:text-[#102B1E]
            "
          >
            <ArrowUpRight
              className="
                h-4 w-4
                transition-transform duration-500
                group-hover:translate-x-0.5 group-hover:-translate-y-0.5
              "
            />
          </div>
        </Link>
      </motion.div>

      {/* ============================================================
          TRUST / SECURITY FOOTNOTE
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
          delay: shouldReduceMotion ? 0 : 0.3,
        }}
        className="mt-7 flex items-center justify-center gap-3"
      >
        <span aria-hidden="true" className="h-px w-5 bg-[#173D2A]/10 dark:bg-white/[0.07]" />

        <LockKeyhole className="h-2.5 w-2.5 text-[#9A7531]/55 dark:text-[#D4AF37]/45" />

        <span className="text-[6.5px] font-semibold uppercase tracking-[0.23em] text-[#173D2A]/25 dark:text-white/20">
          Private · Secure · Personal
        </span>

        <span aria-hidden="true" className="h-px w-5 bg-[#173D2A]/10 dark:bg-white/[0.07]" />
      </motion.div>
    </div>
  );
}