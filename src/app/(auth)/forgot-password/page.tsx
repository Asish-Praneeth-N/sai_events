
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const labelClass = `
  mb-1.5 block
  text-[6.5px] font-bold uppercase tracking-[0.22em]
  text-[#a17a34]
  sm:text-[7px]
  dark:text-[#d2b56b]/75
`;

const inputClass = `
  w-full
  border-0 border-b border-[#173d2c]/15
  bg-transparent
  px-0 pb-2.5 pt-1
  text-[12px] font-normal
  text-[#173d2c]
  outline-none
  placeholder:text-[#173d2c]/22
  transition-all duration-300
  focus:border-[#a17a34]
  sm:text-[13px]
  dark:border-white/[0.10]
  dark:text-[#eee5d7]
  dark:placeholder:text-white/18
  dark:focus:border-[#d2b56b]
`;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });

      if (resetError) throw resetError;

      setMessage(
        "A password reset link has been sent to your email address. Please follow the instructions in the email to set a new password."
      );

      setEmail("");
    } catch (err: any) {
      setError(
        err.message ||
          "An error occurred while requesting a password reset."
      );
    } finally {
      setLoading(false);
    }
  };

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
          duration: shouldReduceMotion ? 0.2 : 0.8,
          ease: EASE,
        }}
      >
        {/* Eyebrow */}

        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="
                h-px w-7 flex-shrink-0
                bg-[#173d2c]/35
                dark:bg-[#d2b56b]/40
              "
            />

            <KeyRound
              className="
                h-2.5 w-2.5 flex-shrink-0
                text-[#a17a34]
                dark:text-[#d2b56b]
              "
            />

            <span
              className="
                truncate
                text-[7px] font-bold uppercase tracking-[0.28em]
                text-[#173d2c]/55
                dark:text-[#d9c88d]/65
              "
            >
              Account Recovery
            </span>
          </div>

          <span
            className="
              flex-shrink-0
              text-[6px] font-semibold uppercase tracking-[0.22em]
              text-[#173d2c]/22
              dark:text-white/18
            "
          >
            03 / RECOVER
          </span>
        </div>

        {/* Title */}

        <div className="flex items-end justify-between gap-6">
          <h1
            className="
              font-heading
              text-[clamp(2.75rem,7vw,4.55rem)]
              font-normal leading-[0.87]
              tracking-[-0.055em]
              text-[#143d2b]
              dark:text-[#f0e8db]
            "
            style={{
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Find your way{" "}
            <span className="italic text-[#9a742e] dark:text-[#d2b56b]">
              back.
            </span>
          </h1>

          <span
            aria-hidden="true"
            className="
              mb-1 hidden select-none
              font-heading text-3xl italic
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

        {/* Description */}

        <div
          className="
            mt-4 grid grid-cols-1 items-end gap-4
            sm:grid-cols-[1fr_auto]
          "
        >
          <p
            className="
              max-w-[440px]
              text-[10px] leading-[1.75]
              text-[#17392b]/50
              sm:text-[11px]
              dark:text-[#eee5d7]/42
            "
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Enter the email connected to your SAI Events account.
            We&apos;ll send you a secure link to create a new password.
          </p>

          <span
            className="
              hidden
              text-[6px] font-semibold uppercase tracking-[0.23em]
              text-[#a17a34]/65
              sm:block
              dark:text-[#d2b56b]/55
            "
          >
            Secure recovery
          </span>
        </div>

        {/* Divider */}

        <div className="mt-5 flex items-center gap-3">
          <span
            className="
              text-[6.5px] font-bold uppercase tracking-[0.25em]
              text-[#a17a34]
              dark:text-[#d2b56b]
            "
          >
            Recovery Email
          </span>

          <span
            aria-hidden="true"
            className="h-px flex-1 bg-[#173d2c]/10 dark:bg-white/[0.08]"
          />

          <Mail className="h-3 w-3 text-[#a17a34]/55 dark:text-[#d2b56b]/50" />

          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rotate-45 bg-[#a17a34]/55"
          />
        </div>
      </motion.header>

      {/* ============================================================
          FORM
      ============================================================ */}

      <motion.form
        onSubmit={handleSubmit}
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
        className="mt-6 w-full"
      >
        {/* Error */}

        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden"
            >
              <div
                className="
                  mb-5
                  flex items-start gap-2.5
                  border-l-2 border-red-500/55
                  bg-red-50/55
                  px-3 py-2.5
                  dark:bg-red-500/[0.06]
                "
              >
                <span
                  className="
                    mt-0.5
                    flex h-3.5 w-3.5 flex-shrink-0
                    items-center justify-center
                    rounded-full
                    border border-red-500/35
                    text-[7px] font-bold
                    text-red-700
                    dark:text-red-400
                  "
                >
                  !
                </span>

                <span className="text-[9px] font-medium leading-[1.55] text-red-700 dark:text-red-400">
                  {error}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address
          </label>

          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@example.com"
              className={`${inputClass} pr-9`}
            />

            <Mail
              aria-hidden="true"
              className="
                absolute bottom-2.5 right-0
                h-3.5 w-3.5
                text-[#173d2c]/25
                dark:text-white/20
              "
            />
          </div>
        </div>

        {/* Small recovery note */}

        <div
          className="
            mt-4
            flex items-start gap-3
            border-l border-[#a17a34]/30
            pl-3
          "
        >
          <LockKeyhole
            className="
              mt-0.5 h-3 w-3 flex-shrink-0
              text-[#a17a34]/60
              dark:text-[#d2b56b]/55
            "
          />

          <p
            className="
              max-w-[420px]
              text-[8px] leading-[1.65]
              text-[#173d2c]/35
              dark:text-white/28
            "
          >
            For your security, the recovery link will only be sent
            to the email registered with your account.
          </p>
        </div>

        {/* Action */}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  y: -2,
                }
          }
          whileTap={
            shouldReduceMotion
              ? undefined
              : {
                  scale: 0.99,
                }
          }
          className="
            group relative mt-6
            flex w-full items-center justify-between
            overflow-hidden
            bg-[#143d2b]
            px-5 py-3.5
            text-[#fffaf1]
            shadow-[0_9px_24px_rgba(20,61,43,0.13)]
            transition-all duration-500
            cursor-pointer
            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:bg-[#d2b56b]
            dark:text-[#161812]
          "
        >
          <span
            aria-hidden="true"
            className="
              absolute inset-y-0 -left-[55%]
              w-[38%] skew-x-[-20deg]
              bg-gradient-to-r
              from-transparent via-white/15 to-transparent
              transition-[left] duration-700
              group-hover:left-[120%]
            "
          />

          <span className="relative z-10 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rotate-45 bg-[#d2b56b] dark:bg-[#173d2c]" />

            <span className="text-[7.5px] font-bold uppercase tracking-[0.23em]">
              {loading ? "Sending link..." : "Send Reset Link"}
            </span>
          </span>

          <ArrowRight
            className="
              relative z-10 h-3.5 w-3.5
              transition-transform duration-500
              group-hover:translate-x-1
            "
          />
        </motion.button>

        {/* Back */}

        <div
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
              group flex w-full items-center justify-between gap-5
            "
          >
            <div>
              <span
                className="
                  block
                  text-[6px] font-bold uppercase tracking-[0.24em]
                  text-[#173d2c]/30
                  dark:text-white/22
                "
              >
                Remembered your password?
              </span>

              <span
                className="
                  mt-1 block
                  font-heading text-[16px]
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
                Return to sign in
              </span>
            </div>

            <div
              className="
                flex h-9 w-9 flex-shrink-0
                items-center justify-center
                border border-[#173d2c]/15
                text-[#173d2c]/50
                transition-all duration-500
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
              <ArrowLeft
                className="
                  h-3.5 w-3.5
                  transition-transform duration-300
                  group-hover:-translate-x-0.5
                "
              />
            </div>
          </Link>
        </div>

        {/* Trust */}

        <div className="mt-4 flex items-center justify-center gap-2.5">
          <span className="h-px w-5 bg-[#173d2c]/10 dark:bg-white/[0.07]" />

          <LockKeyhole className="h-2 w-2 text-[#a17a34]/45 dark:text-[#d2b56b]/40" />

          <span
            className="
              text-[5.5px] font-semibold uppercase tracking-[0.2em]
              text-[#173d2c]/22
              dark:text-white/18
            "
          >
            Protected account recovery
          </span>

          <span className="h-px w-5 bg-[#173d2c]/10 dark:bg-white/[0.07]" />
        </div>
      </motion.form>

      {/* ============================================================
          SUCCESS MODAL
      ============================================================ */}

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed inset-0 z-[99999]
              flex items-center justify-center
              bg-[#0b1710]/88
              p-4
              backdrop-blur-md
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.95,
                y: shouldReduceMotion ? 0 : 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
              }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.55,
                ease: EASE,
              }}
              className="
                relative
                w-full max-w-[480px]
                overflow-hidden
                border border-[#173d2c]/10
                bg-[#f7f0e6]
                p-6
                shadow-[0_30px_100px_rgba(0,0,0,0.32)]
                sm:p-8

                dark:border-white/[0.08]
                dark:bg-[#191b17]
              "
            >
              {/* Giant watermark */}

              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute -right-5 -top-5
                  select-none
                  font-heading
                  text-[9rem] italic
                  leading-none tracking-[-0.09em]
                  text-[#173d2c]/[0.025]
                  dark:text-white/[0.018]
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                SAI
              </span>

              {/* Eyebrow */}

              <div className="relative z-10 mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#173d2c]/30 dark:bg-[#d2b56b]/40" />

                <span
                  className="
                    text-[6.5px] font-bold uppercase tracking-[0.27em]
                    text-[#a17a34]
                    dark:text-[#d2b56b]
                  "
                >
                  Recovery Email Sent
                </span>
              </div>

              {/* Icon */}

              <div
                className="
                  relative z-10 mb-5
                  flex h-12 w-12
                  items-center justify-center
                  rounded-full
                  border border-[#173d2c]/15
                  dark:border-white/10
                "
              >
                <Check className="h-4 w-4 text-[#a17a34] dark:text-[#d2b56b]" />
              </div>

              {/* Heading */}

              <h3
                className="
                  relative z-10
                  font-heading
                  text-[clamp(2.2rem,8vw,3.3rem)]
                  font-normal leading-[0.9]
                  tracking-[-0.045em]
                  text-[#173d2c]
                  dark:text-[#f0e8db]
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Check your{" "}
                <span className="italic text-[#9a742e] dark:text-[#d2b56b]">
                  inbox.
                </span>
              </h3>

              <p
                className="
                  relative z-10
                  mt-4 max-w-[390px]
                  text-[10px] leading-[1.75]
                  text-[#173d2c]/50
                  dark:text-[#eee5d7]/45
                "
              >
                {message}
              </p>

              <Link
                href="/login"
                onClick={() => setMessage(null)}
                className="
                  group relative z-10
                  mt-6 flex w-full
                  items-center justify-between
                  bg-[#143d2b]
                  px-5 py-3.5
                  text-[#fffaf1]
                  transition-all duration-300

                  dark:bg-[#d2b56b]
                  dark:text-[#161812]
                "
              >
                <span className="text-[7px] font-bold uppercase tracking-[0.22em]">
                  Return to Sign In
                </span>

                <ArrowRight
                  className="
                    h-3.5 w-3.5
                    transition-transform duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <div className="relative z-10 mt-4 flex items-center justify-center gap-2">
                <Sparkles className="h-2 w-2 text-[#a17a34]/45 dark:text-[#d2b56b]/40" />

                <span
                  className="
                    text-[5.5px] font-semibold uppercase tracking-[0.2em]
                    text-[#173d2c]/22
                    dark:text-white/18
                  "
                >
                  SAI Events · Private Access
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
