"use client";

import React, { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";

import { LANDING_PAGE_CONFIG } from "@/constants/introConfig";

import {
  ArrowUpRight,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  /* ====================================================================== */
  /* FORM STATE                                                             */
  /* ====================================================================== */

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  /* ====================================================================== */
  /* SUBMISSION                                                             */
  /* ====================================================================== */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(
        "/api/guest-enquiry",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            formData
          ),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to submit enquiry."
        );
      }

      setSuccessMessage(
        data.message ||
          "Thank you for reaching out. Our team has received your enquiry and will get in touch with you soon."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "Wedding",
        message: "",
      });
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "An error occurred while sending your enquiry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ====================================================================== */
  /* CONTACT INFORMATION                                                    */
  /* ====================================================================== */

  const contactInfoItems = [
    {
      Icon: Mail,
      label: "Email",
      value:
        LANDING_PAGE_CONFIG.contact.email,
      href: `mailto:${LANDING_PAGE_CONFIG.contact.email}`,
    },

    {
      Icon: Phone,
      label: "Telephone",
      value:
        LANDING_PAGE_CONFIG.contact.phone,
      href: `tel:${LANDING_PAGE_CONFIG.contact.phone}`,
    },

    {
      Icon: MapPin,
      label: "Studio",
      value:
        LANDING_PAGE_CONFIG.contact.address,
    },

    {
      Icon: Clock,
      label: "Office Hours",
      value:
        LANDING_PAGE_CONFIG.contact
          .workingHours,
    },
  ];

  /* ====================================================================== */
  /* MOTION                                                                 */
  /* ====================================================================== */

  const containerVariants: Variants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren:
          shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const entryVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration:
          shouldReduceMotion
            ? 0.2
            : 0.75,

        ease: EASE,
      },
    },
  };

  /* ====================================================================== */
  /* RENDER                                                                 */
  /* ====================================================================== */

  return (
    <section
      id="contact"
      className="
        relative
        w-full
        overflow-hidden

        border-t
        border-[#143d2b]/10

        bg-[#f3eadf]

        py-24

        text-[#143d2b]

        select-none

        sm:py-32
        lg:py-40

        dark:border-white/[0.07]
        dark:bg-[#12140f]
        dark:text-[#eee5d7]
      "
    >
      {/* ================================================================ */}
      {/* BACKGROUND DETAILS                                               */}
      {/* ================================================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[10%]
          top-[10%]

          h-[520px]
          w-[520px]

          rounded-full

          bg-[#a47b35]/[0.04]

          blur-[160px]

          dark:bg-[#d4af37]/[0.02]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[5%]
          left-[-10%]

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#143d2b]/[0.025]

          blur-[160px]

          dark:bg-white/[0.01]
        "
      />

      {/* huge CONTACT watermark */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[2%]
          top-[3%]

          hidden

          font-heading

          text-[clamp(8rem,18vw,18rem)]
          italic
          leading-none
          tracking-[-0.07em]

          text-[#143d2b]/[0.022]

          lg:block

          dark:text-white/[0.014]
        "
        style={{
          fontFamily:
            '"Playfair Display", serif',
        }}
      >
        Contact
      </div>

      {/* side rails */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-[4.5%]
          top-0

          hidden
          w-px

          bg-[#143d2b]/[0.07]

          xl:block

          dark:bg-white/[0.04]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          right-[4.5%]
          top-0

          hidden
          w-px

          bg-[#143d2b]/[0.07]

          xl:block

          dark:bg-white/[0.04]
        "
      />

      {/* ================================================================ */}
      {/* CONTENT                                                          */}
      {/* ================================================================ */}

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
        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}

        <div
          className="
            grid
            grid-cols-1

            gap-8

            border-b
            border-[#143d2b]/10

            pb-14

            lg:grid-cols-[1fr_auto]
            lg:items-end

            dark:border-white/[0.07]
          "
        >
          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion
                  ? 0
                  : -18,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.2
                    : 0.7,
                ease: EASE,
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

                  bg-[#9b742f]/50

                  dark:bg-[#d4af37]/45
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

                  text-[#9b742f]/75

                  dark:text-[#d4af37]/65
                "
              >
                Get In Touch
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: shouldReduceMotion
                  ? 0
                  : 22,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.2
                    : 0.9,
                ease: EASE,
              }}
              className="
                max-w-[850px]

                font-heading

                text-[clamp(3.2rem,7vw,7rem)]
                font-normal
                leading-[0.93]
                tracking-[-0.055em]

                text-[#143d2b]

                dark:text-[#eee5d7]
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              Begin the
              <br />

              <span
                className="
                  italic

                  text-[#9b742f]

                  dark:text-[#d2b56b]
                "
              >
                conversation.
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay:
                shouldReduceMotion
                  ? 0
                  : 0.2,
            }}
            className="
              flex
              items-center
              gap-3

              lg:pb-2
            "
          >
            <span
              className="
                font-heading

                text-sm
                italic

                text-[#9b742f]

                dark:text-[#d2b56b]
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              06
            </span>

            <span
              className="
                h-px
                w-12

                bg-[#143d2b]/15

                dark:bg-white/10
              "
            />

            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-[0.28em]

                text-[#143d2b]/35

                dark:text-white/25
              "
            >
              Contact
            </span>
          </motion.div>
        </div>

        {/* ================================================================ */}
        {/* MAIN GRID                                                        */}
        {/* ================================================================ */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-80px",
          }}
          className="
            mt-14

            grid
            grid-cols-1

            gap-16

            lg:mt-20
            lg:grid-cols-[0.78fr_1.22fr]
            lg:gap-20

            xl:gap-28
          "
        >
          {/* ============================================================== */}
          {/* LEFT INFORMATION                                               */}
          {/* ============================================================== */}

          <motion.div
            variants={entryVariants}
          >
            <p
              className="
                max-w-[430px]

                text-[12px]
                leading-[1.9]

                text-[#143d2b]/50

                sm:text-[13px]

                dark:text-[#eee5d7]/42
              "
              style={{
                fontFamily:
                  '"Poppins", sans-serif',
              }}
            >
              Planning something meaningful?
              Share the first details with us.
              Our team will guide you through
              the possibilities, the process,
              and what happens next.
            </p>

            {/* contact rows */}

            <div
              className="
                mt-10

                border-t
                border-[#143d2b]/10

                dark:border-white/[0.07]
              "
            >
              {contactInfoItems.map(
                (
                  {
                    Icon,
                    label,
                    value,
                    href,
                  },
                  index
                ) => (
                  <motion.div
                    key={label}
                    initial={{
                      opacity: 0,
                      x: shouldReduceMotion
                        ? 0
                        : -15,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration:
                        shouldReduceMotion
                          ? 0.2
                          : 0.6,

                      delay:
                        shouldReduceMotion
                          ? 0
                          : index *
                            0.07,

                      ease: EASE,
                    }}
                    className="
                      group

                      grid
                      grid-cols-[32px_1fr]

                      gap-4

                      border-b
                      border-[#143d2b]/10

                      py-6

                      dark:border-white/[0.07]
                    "
                  >
                    <Icon
                      className="
                        mt-0.5

                        h-4
                        w-4

                        stroke-[1.35]

                        text-[#9b742f]

                        transition-transform
                        duration-300

                        group-hover:scale-110

                        dark:text-[#d2b56b]
                      "
                    />

                    <div>
                      <span
                        className="
                          block

                          text-[7px]
                          font-bold
                          uppercase
                          tracking-[0.28em]

                          text-[#143d2b]/35

                          dark:text-white/25
                        "
                      >
                        {label}
                      </span>

                      {href ? (
                        <a
                          href={href}
                          className="
                            mt-2
                            inline-block

                            font-heading

                            text-[17px]
                            font-normal

                            text-[#143d2b]/80

                            transition-colors

                            hover:text-[#9b742f]

                            dark:text-[#eee5d7]/70
                            dark:hover:text-[#d2b56b]
                          "
                          style={{
                            fontFamily:
                              '"Playfair Display", serif',
                          }}
                        >
                          {value}
                        </a>
                      ) : (
                        <span
                          className="
                            mt-2
                            block

                            max-w-[360px]

                            font-heading

                            text-[17px]
                            font-normal
                            leading-[1.45]

                            text-[#143d2b]/80

                            dark:text-[#eee5d7]/70
                          "
                          style={{
                            fontFamily:
                              '"Playfair Display", serif',
                          }}
                        >
                          {value}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* location footer */}

            <div className="mt-9">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group

                  inline-flex
                  items-center
                  gap-3

                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.24em]

                  text-[#9b742f]

                  transition-colors

                  hover:text-[#143d2b]

                  dark:text-[#d2b56b]
                  dark:hover:text-[#eee5d7]
                "
              >
                View Our Location

                <ArrowUpRight
                  className="
                    h-3.5
                    w-3.5

                    transition-transform
                    duration-300

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </a>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* FORM                                                           */}
          {/* ============================================================== */}

          <motion.div
            variants={entryVariants}
            className="
              relative

              border-l-0
              border-[#143d2b]/10

              lg:border-l
              lg:pl-14

              xl:pl-20

              dark:border-white/[0.07]
            "
          >
            {/* form heading */}

            <div
              className="
                mb-9

                flex
                items-end
                justify-between

                border-b
                border-[#143d2b]/10

                pb-5

                dark:border-white/[0.07]
              "
            >
              <div>
                <span
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.3em]

                    text-[#9b742f]/70

                    dark:text-[#d4af37]/55
                  "
                >
                  Your Enquiry
                </span>

                <h3
                  className="
                    mt-2

                    font-heading

                    text-2xl
                    font-normal

                    text-[#143d2b]

                    sm:text-3xl

                    dark:text-[#eee5d7]
                  "
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  Tell us what you&apos;re
                  planning.
                </h3>
              </div>

              <span
                className="
                  hidden

                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]

                  text-[#143d2b]/25

                  sm:block

                  dark:text-white/20
                "
              >
                * Required
              </span>
            </div>

            {/* status messages */}

            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="
                    mb-7

                    overflow-hidden

                    border-y
                    border-emerald-700/20

                    py-4

                    text-[11px]
                    leading-relaxed

                    text-emerald-800

                    dark:border-emerald-400/15
                    dark:text-emerald-300
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <Check
                      className="
                        mt-0.5
                        h-3.5
                        w-3.5
                        shrink-0
                      "
                    />

                    {successMessage}
                  </div>
                </motion.div>
              )}

              {errorMessage && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="
                    mb-7

                    overflow-hidden

                    border-y
                    border-red-700/20

                    py-4

                    text-[11px]
                    leading-relaxed

                    text-red-700

                    dark:border-red-400/15
                    dark:text-red-300
                  "
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ============================================================ */}
            {/* ACTUAL FORM                                                  */}
            {/* ============================================================ */}

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* name */}

              <EditorialInput
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    name: value,
                  })
                }
                required
              />

              {/* email + phone */}

              <div
                className="
                  grid
                  grid-cols-1

                  gap-8

                  sm:grid-cols-2
                  sm:gap-7
                "
              >
                <EditorialInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      email: value,
                    })
                  }
                  required
                />

                <EditorialInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      phone: value,
                    })
                  }
                  required
                />
              </div>

              {/* event type */}

              <div className="relative">
                <label
                  htmlFor="eventType"
                  className="
                    mb-3
                    block

                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.28em]

                    text-[#143d2b]/40

                    dark:text-white/30
                  "
                >
                  Event Being Planned *
                </label>

                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventType:
                        e.target.value,
                    })
                  }
                  className="
                    w-full

                    appearance-none

                    border-0
                    border-b
                    border-[#143d2b]/20

                    bg-transparent

                    px-0
                    py-3

                    font-heading

                    text-[16px]

                    text-[#143d2b]

                    outline-none

                    transition-colors
                    duration-300

                    focus:border-[#9b742f]

                    dark:border-white/15
                    dark:text-[#eee5d7]
                    dark:focus:border-[#d2b56b]
                  "
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  <option
                    value="Wedding"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Wedding
                  </option>

                  <option
                    value="Corporate Event"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Corporate Event
                  </option>

                  <option
                    value="Birthday"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Birthday
                  </option>

                  <option
                    value="Engagement"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Engagement
                  </option>

                  <option
                    value="Reception"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Reception
                  </option>

                  <option
                    value="Private Event"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Private Event
                  </option>

                  <option
                    value="Other"
                    className="bg-[#f3eadf] text-[#143d2b] dark:bg-[#12140f] dark:text-[#eee5d7]"
                  >
                    Other
                  </option>
                </select>

                <span
                  className="
                    pointer-events-none

                    absolute
                    bottom-[14px]
                    right-1

                    text-[10px]

                    text-[#9b742f]

                    dark:text-[#d2b56b]
                  "
                >
                  ↓
                </span>
              </div>

              {/* message */}

              <div className="relative">
                <label
                  htmlFor="message"
                  className="
                    mb-3
                    block

                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.28em]

                    text-[#143d2b]/40

                    dark:text-white/30
                  "
                >
                  Tell Us About The Event *
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message:
                        e.target.value,
                    })
                  }
                  required
                  rows={5}
                  placeholder="Share your vision, date, location, guest count, or anything else you'd like us to know..."
                  className="
                    w-full

                    resize-none

                    border-0
                    border-b
                    border-[#143d2b]/20

                    bg-transparent

                    px-0
                    py-3

                    text-[12px]
                    leading-[1.8]

                    text-[#143d2b]

                    outline-none

                    placeholder:text-[#143d2b]/25

                    transition-colors
                    duration-300

                    focus:border-[#9b742f]

                    dark:border-white/15
                    dark:text-[#eee5d7]
                    dark:placeholder:text-white/20
                    dark:focus:border-[#d2b56b]
                  "
                  style={{
                    fontFamily:
                      '"Poppins", sans-serif',
                  }}
                />
              </div>

              {/* submit */}

              <div
                className="
                  flex
                  flex-col

                  gap-4

                  pt-2

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    max-w-[310px]

                    text-[9px]
                    leading-[1.7]

                    text-[#143d2b]/30

                    dark:text-white/22
                  "
                >
                  By submitting this enquiry,
                  you&apos;re simply starting a
                  conversation with our event
                  team.
                </p>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    submitting ||
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -3,
                        }
                  }
                  whileTap={
                    submitting ||
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.98,
                        }
                  }
                  className="
                    group

                    flex
                    min-w-[190px]

                    cursor-pointer

                    items-center
                    justify-center
                    gap-3

                    bg-[#143d2b]

                    px-7
                    py-4

                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[#f7f0e6]

                    shadow-[0_12px_30px_rgba(20,61,43,0.12)]

                    transition-colors
                    duration-300

                    hover:bg-[#1b4a35]

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    dark:bg-[#d2b56b]
                    dark:text-[#11130f]
                    dark:hover:bg-[#dec47c]
                  "
                >
                  {submitting ? (
                    <>
                      <span
                        className="
                          h-3
                          w-3

                          animate-spin

                          rounded-full

                          border
                          border-current
                          border-t-transparent
                        "
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send
                        className="
                          h-3.5
                          w-3.5

                          transition-transform
                          duration-300

                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />

                      Send Enquiry

                      <ArrowUpRight
                        className="
                          h-3
                          w-3

                          opacity-50

                          transition-transform
                          duration-300

                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ======================================================================== */
/* EDITORIAL INPUT                                                          */
/* ======================================================================== */

function EditorialInput({
  label,
  name,
  type,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="group relative">
      <label
        htmlFor={name}
        className="
          mb-3
          block

          text-[7px]
          font-bold
          uppercase
          tracking-[0.28em]

          text-[#143d2b]/40

          transition-colors

          group-focus-within:text-[#9b742f]

          dark:text-white/30
          dark:group-focus-within:text-[#d2b56b]
        "
      >
        {label}
        {required && " *"}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        required={required}
        className="
          w-full

          border-0
          border-b
          border-[#143d2b]/20

          bg-transparent

          px-0
          py-3

          font-heading

          text-[16px]

          text-[#143d2b]

          outline-none

          transition-colors
          duration-300

          focus:border-[#9b742f]

          dark:border-white/15
          dark:text-[#eee5d7]
          dark:focus:border-[#d2b56b]
        "
        style={{
          fontFamily:
            '"Playfair Display", serif',
        }}
      />
    </div>
  );
}