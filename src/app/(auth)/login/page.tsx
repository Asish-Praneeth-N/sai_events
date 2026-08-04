"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, LockKeyhole, Sparkles } from "lucide-react";

import AuthForm from "@/components/auth/AuthForm";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full">
      {/* ============================================================
          EDITORIAL HEADER
      ============================================================ */}

      <motion.div
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
        className="mb-8"
      >
        {/* Eyebrow */}

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-px w-6 bg-[#9b742f]/50 dark:bg-[#D4AF37]/45" />

            <Sparkles className="h-3 w-3 text-[#9b742f] dark:text-[#D4AF37]" />

            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#9b742f] dark:text-[#D4AF37]">
              Client Access
            </span>
          </div>

          <span className="text-[8px] font-semibold tracking-[0.2em] text-foreground/25 dark:text-white/20">
            01
          </span>
        </div>

        {/* Main heading */}

        <h1
          className="
            text-[clamp(2.7rem,6vw,4rem)]
            font-normal
            leading-[0.98]
            tracking-[-0.045em]
            text-[#143d2b]
            transition-colors
            duration-300
            dark:text-[#F3EBDD]
          "
          style={{
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Welcome
          <span className="italic text-[#9b742f] dark:text-[#D4AF37]">
            {" "}
            back.
          </span>
        </h1>

        <p
          className="
            mt-4
            max-w-sm
            text-[10px]
            font-light
            leading-[1.8]
            text-[#143d2b]/45
            transition-colors
            duration-300
            sm:text-[11px]
            dark:text-[#F7F3EC]/40
          "
          style={{
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Return to your event journey, review your plans and continue
          creating something memorable with SAI Events.
        </p>

        {/* Divider */}

        <div className="mt-7 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#143d2b]/10 dark:bg-white/[0.08]" />

          <LockKeyhole className="h-3 w-3 text-[#9b742f]/50 dark:text-[#D4AF37]/45" />

          <span className="h-px w-8 bg-[#9b742f]/35 dark:bg-[#D4AF37]/30" />
        </div>
      </motion.div>

      {/* ============================================================
          AUTH FORM
          Functional component remains untouched.
      ============================================================ */}

      <motion.div
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.7,
          delay: shouldReduceMotion ? 0 : 0.12,
          ease: EASE,
        }}
      >
        <AuthForm mode="login" />
      </motion.div>

      {/* ============================================================
          ACCOUNT SWITCH
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
          delay: shouldReduceMotion ? 0 : 0.22,
          ease: EASE,
        }}
        className="
          mt-8
          border-t
          border-[#143d2b]/10
          pt-6
          dark:border-white/[0.08]
        "
      >
        <Link
          href="/register"
          className="
            group
            flex
            w-full
            items-center
            justify-between
            gap-5
            transition-all
            duration-300
          "
        >
          <div className="text-left">
            <span className="block text-[8px] font-bold uppercase tracking-[0.24em] text-[#143d2b]/35 dark:text-white/25">
              New to SAI Events?
            </span>

            <span
              className="
                mt-1
                block
                text-base
                text-[#143d2b]
                transition-colors
                duration-300
                group-hover:text-[#9b742f]
                dark:text-[#F3EBDD]
                dark:group-hover:text-[#D4AF37]
              "
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Create your account
            </span>
          </div>

          <div
            className="
              flex
              h-10
              w-10
              flex-shrink-0
              items-center
              justify-center
              border
              border-[#143d2b]/15
              text-[#143d2b]/55
              transition-all
              duration-300
              group-hover:border-[#9b742f]
              group-hover:bg-[#9b742f]
              group-hover:text-white
              dark:border-white/10
              dark:text-white/45
              dark:group-hover:border-[#D4AF37]
              dark:group-hover:bg-[#D4AF37]
              dark:group-hover:text-[#102b1e]
            "
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>
      </motion.div>

      {/* ============================================================
          MICRO TRUST NOTE
      ============================================================ */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.7,
          delay: shouldReduceMotion ? 0 : 0.32,
        }}
        className="mt-7 flex items-center justify-center gap-2"
      >
        <span className="h-[3px] w-[3px] rounded-full bg-[#9b742f]/60 dark:bg-[#D4AF37]/55" />

        <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-[#143d2b]/25 dark:text-white/20">
          Private · Secure · Personal
        </span>

        <span className="h-[3px] w-[3px] rounded-full bg-[#9b742f]/60 dark:bg-[#D4AF37]/55" />
      </motion.div>
    </div>
  );
}