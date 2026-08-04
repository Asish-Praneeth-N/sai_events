"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

/* ==========================================================================
   TYPES
============================================================================ */

interface CinematicDoorsProps {
  onComplete: () => void;
  onOpening: () => void;
}

type Phase =
  | "arrival"
  | "sealed"
  | "unfold"
  | "reveal"
  | "opening"
  | "done";

/* ==========================================================================
   MOTION CONSTANTS
============================================================================ */

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;
const CURTAIN_EASE = [0.86, 0, 0.07, 1] as const;
const EXIT_EASE = [0.4, 0, 1, 1] as const;

/* ==========================================================================
   DEVICE HELPER
============================================================================ */

function getLowPowerDevice() {
  if (typeof window === "undefined") return false;

  const lowCPU =
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency ?? 8) <= 4;

  return window.innerWidth < 768 || lowCPU;
}

/* ==========================================================================
   MAIN COMPONENT
============================================================================ */

export default function CinematicDoors({
  onComplete,
  onOpening,
}: CinematicDoorsProps) {
  const shouldReduceMotion = useReducedMotion();

  const [phase, setPhase] =
    useState<Phase>("arrival");

  const [lowPower, setLowPower] =
    useState(false);

  /*
   * Keep latest callbacks without restarting
   * the cinematic timeline if the parent rerenders.
   */
  const openingCallbackRef =
    useRef(onOpening);

  const completeCallbackRef =
    useRef(onComplete);

  useEffect(() => {
    openingCallbackRef.current = onOpening;
  }, [onOpening]);

  useEffect(() => {
    completeCallbackRef.current = onComplete;
  }, [onComplete]);

  /* =========================================================================
     DEVICE DETECTION
  ========================================================================= */

  useEffect(() => {
    setLowPower(getLowPowerDevice());
  }, []);

  const quick =
    lowPower || Boolean(shouldReduceMotion);

  /* =========================================================================
     CINEMATIC SEQUENCE
  ========================================================================= */

  useEffect(() => {
    let mounted = true;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    /*
      TIMELINE
      ------------------------------------------------

      00:00   Atmosphere
      00:30   Invitation enters
      01:25   Wax seal responds
      02:10   Invitation unfolds
      03:00   Typography + botanicals
      04:40   Final reveal begins
      06:20   Intro removed

      Reduced/mobile version is intentionally shorter.
    */

    const timers: ReturnType<
      typeof setTimeout
    >[] = [];

    const schedule = (
      callback: () => void,
      delay: number
    ) => {
      timers.push(
        setTimeout(() => {
          if (mounted) callback();
        }, delay)
      );
    };

    schedule(
      () => setPhase("sealed"),
      quick ? 700 : 1250
    );

    schedule(
      () => setPhase("unfold"),
      quick ? 1300 : 2100
    );

    schedule(
      () => setPhase("reveal"),
      quick ? 1900 : 3000
    );

    schedule(
      () => {
        setPhase("opening");
        openingCallbackRef.current();
      },
      quick ? 2850 : 4450
    );

    schedule(
      () => {
        setPhase("done");
        completeCallbackRef.current();
      },
      quick ? 4200 : 6250
    );

    return () => {
      mounted = false;

      timers.forEach(clearTimeout);

      document.body.style.overflow =
        previousOverflow;
    };
  }, [quick]);

  if (phase === "done") {
    return null;
  }

  const invitationVisible =
    phase !== "arrival";

  const unfolded =
    phase === "unfold" ||
    phase === "reveal" ||
    phase === "opening";

  const contentVisible =
    phase === "reveal";

  const opening =
    phase === "opening";

  /* =========================================================================
     RENDER
  ========================================================================= */

  return (
    <div
      aria-hidden="true"
      className="
        fixed inset-0 z-[99999]
        overflow-hidden
        select-none
        bg-[#07120c]
      "
      style={{
        transform: "translateZ(0)",
      }}
    >
      {/* ================================================================
          BACKGROUND ATMOSPHERE
      ================================================================= */}

      <Atmosphere
        opening={opening}
        lowPower={quick}
      />

      {/* ================================================================
          AMBIENT PARTICLES
      ================================================================= */}

      {!quick && !opening && (
        <FloatingDust />
      )}

      {/* ================================================================
          VERY SUBTLE EDITORIAL FRAME
      ================================================================= */}

      {!opening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.5,
            delay: 0.3,
          }}
          className="
            pointer-events-none
            absolute
            inset-5
            z-[3]
            border
            border-[#d7bd70]/[0.06]

            sm:inset-8
          "
        />
      )}

      {/* ================================================================
          INVITATION
      ================================================================= */}

      <AnimatePresence>
        {!opening && (
          <motion.div
            key="invitation-stage"
            initial={{
              opacity: 0,
              y: quick ? 28 : 60,
              scale: 0.94,
              rotateX: quick ? 0 : 7,
            }}
            animate={
              invitationVisible
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                  }
                : {}
            }
            exit={{
              opacity: 0,
              scale: 1.025,
              y: -8,
            }}
            transition={{
              duration: quick ? 0.55 : 1.05,
              ease: CINEMATIC_EASE,
            }}
            className="
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              px-5
              [perspective:1600px]
            "
          >
            {/* ==========================================================
                PAPER
            =========================================================== */}

            <motion.div
              animate={{
                scaleX: unfolded
                  ? 1
                  : 0.72,

                scaleY: unfolded
                  ? 1
                  : 0.62,
              }}
              transition={{
                duration: quick ? 0.55 : 1,
                ease: CINEMATIC_EASE,
              }}
              className="
                relative
                h-[min(76vh,640px)]
                w-[min(88vw,920px)]
                overflow-hidden
                shadow-[0_35px_100px_rgba(0,0,0,0.58)]
              "
              style={{
                background:
                  "linear-gradient(135deg,#f8f1e2 0%,#eee0c5 47%,#faf4e8 100%)",

                transformOrigin: "center",
                willChange: "transform",
              }}
            >
              <PaperTexture />

              {/* ========================================================
                  PAPER DEPTH
              ========================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                "
                style={{
                  boxShadow:
                    "inset 0 0 60px rgba(104,79,35,.08)",
                }}
              />

              {/* ========================================================
                  DOUBLE BORDER
              ========================================================= */}

              <motion.div
                animate={{
                  opacity: unfolded
                    ? 1
                    : 0.25,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-[14px]
                  border
                  border-[#173d2a]/20

                  sm:inset-[22px]
                "
              />

              <motion.div
                animate={{
                  opacity: unfolded ? 1 : 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-[19px]
                  border
                  border-[#a78135]/20

                  sm:inset-[28px]
                "
              />

              {/* ========================================================
                  CENTER PAPER CREASE
              ========================================================= */}

              <motion.div
                animate={{
                  opacity: unfolded ? 0.17 : 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-1/2
                  z-[2]
                  w-px
                  -translate-x-1/2
                "
                style={{
                  background:
                    "linear-gradient(to bottom,transparent,rgba(93,68,28,.35),transparent)",
                }}
              />

              {/* ========================================================
                  CLOSED ENVELOPE
              ========================================================= */}

              <AnimatePresence>
                {!unfolded && (
                  <motion.div
                    key="closed-envelope"
                    initial={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.025,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: EXIT_EASE,
                    }}
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <EnvelopeGeometry />

                    {/* INVITATION LABEL */}

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: quick
                          ? 0.1
                          : 0.45,
                      }}
                      className="
                        absolute
                        top-[18%]
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          h-px
                          w-6
                          bg-[#9c7835]/25
                        "
                      />

                      <span
                        className="
                          text-[6px]
                          font-bold
                          uppercase
                          tracking-[0.42em]
                          text-[#173d2a]/45

                          sm:text-[8px]
                        "
                      >
                        You&apos;re Invited
                      </span>

                      <span
                        className="
                          h-px
                          w-6
                          bg-[#9c7835]/25
                        "
                      />
                    </motion.div>

                    <WaxSeal
                      active={
                        phase === "sealed"
                      }
                      releasing={
                        phase === "unfold"
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ========================================================
                  OPEN INVITATION
              ========================================================= */}

              {unfolded && (
                <InvitationContent
                  visible={contentVisible}
                  lowPower={quick}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
          FINAL REVEAL
      ================================================================= */}

      <RevealCurtains
        opening={opening}
        lowPower={quick}
      />

      {/* ================================================================
          CENTER LIGHT
      ================================================================= */}

      <AnimatePresence>
        {opening && (
          <>
            <motion.div
              initial={{
                opacity: 0,
                scaleY: 0.2,
              }}
              animate={{
                opacity: [
                  0,
                  0.85,
                  0.25,
                  0,
                ],

                scaleY: [
                  0.2,
                  1,
                  1,
                  1,
                ],
              }}
              transition={{
                duration: quick
                  ? 0.8
                  : 1.3,

                ease: "easeOut",
              }}
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-1/2
                z-50
                w-px
                -translate-x-1/2
                bg-[#f0d790]
                shadow-[0_0_50px_12px_rgba(240,215,144,0.28)]
              "
            />

            {!quick && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.4,
                }}
                animate={{
                  opacity: [0, 0.16, 0],
                  scale: [0.4, 1.2, 1.6],
                }}
                transition={{
                  duration: 1.45,
                  ease: "easeOut",
                }}
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  z-40
                  h-[70vh]
                  w-[28vw]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-[#efd48a]
                  blur-[100px]
                "
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   ENVELOPE GEOMETRY
============================================================================ */

function EnvelopeGeometry() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Top flap */}

      <div
        className="
          absolute
          inset-0
          opacity-55
        "
        style={{
          clipPath:
            "polygon(0 0, 50% 56%, 100% 0)",

          background:
            "linear-gradient(180deg,rgba(255,255,255,.55),rgba(185,151,88,.08))",
        }}
      />

      {/* Left fold */}

      <div
        className="
          absolute
          inset-0
          opacity-25
        "
        style={{
          clipPath:
            "polygon(0 0,50% 55%,0 100%)",

          background:
            "linear-gradient(90deg,rgba(164,126,57,.15),transparent)",
        }}
      />

      {/* Right fold */}

      <div
        className="
          absolute
          inset-0
          opacity-25
        "
        style={{
          clipPath:
            "polygon(100% 0,50% 55%,100% 100%)",

          background:
            "linear-gradient(270deg,rgba(164,126,57,.15),transparent)",
        }}
      />

      {/* Bottom fold */}

      <div
        className="
          absolute
          inset-0
          opacity-20
        "
        style={{
          clipPath:
            "polygon(0 100%,50% 48%,100% 100%)",

          background:
            "linear-gradient(0deg,rgba(140,104,44,.15),transparent)",
        }}
      />
    </div>
  );
}

/* ==========================================================================
   INVITATION CONTENT
============================================================================ */

function InvitationContent({
  visible,
  lowPower,
}: {
  visible: boolean;
  lowPower: boolean;
}) {
  return (
    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        overflow-hidden
        px-9
        py-12

        sm:px-20
      "
    >
      {/* ================================================================
          BOTANICAL ART
      ================================================================= */}

      {!lowPower && (
        <>
          <BotanicalCorner
            className="
              absolute
              -left-5
              -top-5
              h-[190px]
              w-[190px]

              sm:h-[290px]
              sm:w-[290px]
            "
          />

          <BotanicalCorner
            flip
            className="
              absolute
              -bottom-5
              -right-5
              h-[190px]
              w-[190px]
              rotate-180

              sm:h-[290px]
              sm:w-[290px]
            "
          />
        </>
      )}

      {/* ================================================================
          SIDE MONOGRAMS
      ================================================================= */}

      {!lowPower && (
        <>
          <span
            className="
              absolute
              left-[7%]
              top-1/2
              -translate-y-1/2
              -rotate-90
              text-[6px]
              font-semibold
              uppercase
              tracking-[0.4em]
              text-[#173d2a]/20
            "
          >
            Celebrations · Weddings · Experiences
          </span>

          <span
            className="
              absolute
              right-[7%]
              top-1/2
              -translate-y-1/2
              rotate-90
              text-[6px]
              font-semibold
              uppercase
              tracking-[0.4em]
              text-[#173d2a]/20
            "
          >
            SAI Events · Since 2014
          </span>
        </>
      )}

      {/* ================================================================
          MAIN CONTENT
      ================================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={
          visible
            ? {
                opacity: 1,
                y: 0,
              }
            : {
                opacity: 0,
                y: 18,
              }
        }
        transition={{
          duration: 0.95,
          ease: CINEMATIC_EASE,
        }}
        className="
          relative
          z-10
          flex
          max-w-[660px]
          flex-col
          items-center
          text-center
        "
      >
        {/* EYEBROW */}

        <motion.div
          initial={{
            opacity: 0,
            scaleX: 0.8,
          }}
          animate={
            visible
              ? {
                  opacity: 1,
                  scaleX: 1,
                }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: 0.08,
          }}
          className="
            mb-5
            flex
            items-center
            gap-3

            sm:mb-7
          "
        >
          <span className="h-px w-8 bg-[#a47d32]/35 sm:w-14" />

          <span
            className="
              whitespace-nowrap
              text-[6px]
              font-bold
              uppercase
              tracking-[0.42em]
              text-[#8d6a2c]

              sm:text-[8px]
            "
          >
            The Art of Celebration
          </span>

          <span className="h-px w-8 bg-[#a47d32]/35 sm:w-14" />
        </motion.div>

        {/* BRAND */}

        <motion.span
          initial={{
            opacity: 0,
            letterSpacing: "0.32em",
          }}
          animate={
            visible
              ? {
                  opacity: 1,
                  letterSpacing: "0.16em",
                }
              : {}
          }
          transition={{
            duration: 1,
            delay: 0.14,
            ease: CINEMATIC_EASE,
          }}
          className="
            text-[clamp(0.75rem,1.5vw,1.05rem)]
            font-semibold
            uppercase
            text-[#173d2a]
          "
        >
          SAI EVENTS
        </motion.span>

        {/* TITLE */}

        <motion.h1
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={
            visible
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.95,
            delay: 0.25,
            ease: CINEMATIC_EASE,
          }}
          className="
            mt-4
            text-[clamp(2.1rem,6vw,5.5rem)]
            font-normal
            leading-[0.94]
            tracking-[-0.045em]
            text-[#123823]
          "
          style={{
            fontFamily:
              "'Playfair Display', serif",
          }}
        >
          Every Moment
          <br />

          <span
            className="
              italic
              text-[#98712c]
            "
          >
            deserves a story.
          </span>
        </motion.h1>

        {/* ORNAMENT */}

        <motion.div
          initial={{
            opacity: 0,
            scaleX: 0,
          }}
          animate={
            visible
              ? {
                  opacity: 1,
                  scaleX: 1,
                }
              : {}
          }
          transition={{
            duration: 0.75,
            delay: 0.46,
          }}
          className="
            my-5
            flex
            items-center
            gap-3

            sm:my-7
          "
        >
          <span className="h-px w-10 bg-[#9b742f]/30" />

          <span
            className="
              h-[5px]
              w-[5px]
              rotate-45
              border
              border-[#9b742f]/60
            "
          />

          <span className="h-px w-10 bg-[#9b742f]/30" />
        </motion.div>

        {/* COPY */}

        <motion.p
          initial={{
            opacity: 0,
            y: 7,
          }}
          animate={
            visible
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.75,
            delay: 0.55,
          }}
          className="
            max-w-md
            text-[8px]
            font-light
            leading-[1.9]
            tracking-[0.055em]
            text-[#173d2a]/55

            sm:text-[10px]
          "
          style={{
            fontFamily:
              "'Poppins', sans-serif",
          }}
        >
          Thoughtfully planned.
          Beautifully composed.
          Unforgettably yours.
        </motion.p>

        {/* EST */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={
            visible
              ? { opacity: 1 }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: 0.72,
          }}
          className="
            mt-5
            text-[6px]
            font-semibold
            uppercase
            tracking-[0.34em]
            text-[#9b742f]/60

            sm:mt-7
            sm:text-[7px]
          "
        >
          Est. 2014 · SAI Events
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ==========================================================================
   WAX SEAL
============================================================================ */

function WaxSeal({
  active,
  releasing,
}: {
  active: boolean;
  releasing: boolean;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.72,
        rotate: -10,
      }}
      animate={
        releasing
          ? {
              opacity: 0,
              scale: 0.72,
              rotate: 10,
              y: 8,
            }
          : {
              opacity: 1,

              scale: active
                ? [1, 1.07, 1]
                : 1,

              rotate: active
                ? 0
                : -3,

              y: 0,
            }
      }
      transition={{
        opacity: {
          duration: 0.45,
        },

        scale: {
          duration: 0.7,
          ease: CINEMATIC_EASE,
        },

        rotate: {
          duration: 0.7,
        },

        y: {
          duration: 0.45,
        },
      }}
      className="
        relative
        z-10
        flex
        h-[78px]
        w-[78px]
        items-center
        justify-center
        rounded-full

        sm:h-[106px]
        sm:w-[106px]
      "
      style={{
        background:
          "radial-gradient(circle at 34% 24%,#c19c4b 0%,#987027 34%,#664814 70%,#402c0c 100%)",

        boxShadow:
          "0 14px 30px rgba(70,48,12,.32), inset 0 1px 1px rgba(255,232,162,.35)",

        willChange:
          "transform, opacity",
      }}
    >
      {/* Rough outer wax ring */}

      <div
        className="
          absolute
          inset-[5px]
          rounded-full
          border
          border-[#f0d28a]/20
        "
      />

      <div
        className="
          absolute
          inset-[11px]
          rounded-full
          border
          border-[#3b290d]/45
        "
      />

      {/* MONOGRAM */}

      <div className="text-center">
        <span
          className="
            block
            text-xl
            font-semibold
            leading-none
            tracking-[0.06em]
            text-[#ead08b]/90

            sm:text-2xl
          "
          style={{
            fontFamily:
              "'Playfair Display', serif",
          }}
        >
          S
        </span>

        <span
          className="
            mt-1
            block
            text-[4px]
            font-bold
            uppercase
            tracking-[0.22em]
            text-[#ead08b]/50

            sm:text-[5px]
          "
        >
          SAI
        </span>
      </div>

      {/* SEAL SHIMMER */}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-full
            "
          >
            <motion.div
              initial={{
                x: "-170%",
              }}
              animate={{
                x: "220%",
              }}
              transition={{
                duration: 0.85,
                ease: "easeInOut",
              }}
              className="
                h-full
                w-5
                rotate-12
                bg-white/20
                blur-[2px]
              "
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ==========================================================================
   BOTANICAL CORNER
============================================================================ */

function BotanicalCorner({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      className={className}
      style={{
        transform: flip
          ? "scaleX(-1)"
          : undefined,
      }}
    >
      <motion.path
        d="
          M15 215
          C52 188 61 142 49 106
          C41 79 50 52 80 25
        "
        stroke="#234c35"
        strokeWidth="1"
        initial={{
          pathLength: 0,
          opacity: 0,
        }}
        animate={{
          pathLength: 1,
          opacity: 0.55,
        }}
        transition={{
          duration: 1.65,
          delay: 0.1,
          ease: "easeInOut",
        }}
      />

      <motion.path
        d="
          M48 151
          C77 145 91 127 93 104
        "
        stroke="#234c35"
        strokeWidth="0.8"
        initial={{
          pathLength: 0,
          opacity: 0,
        }}
        animate={{
          pathLength: 1,
          opacity: 0.45,
        }}
        transition={{
          duration: 1.2,
          delay: 0.35,
        }}
      />

      <motion.path
        d="
          M52 118
          C25 107 19 88 26 69
          C49 75 60 91 52 118Z
        "
        stroke="#9b742f"
        strokeWidth="0.8"
        initial={{
          pathLength: 0,
          opacity: 0,
        }}
        animate={{
          pathLength: 1,
          opacity: 0.5,
        }}
        transition={{
          duration: 1,
          delay: 0.55,
        }}
      />

      <motion.path
        d="
          M66 78
          C90 70 101 51 96 32
          C74 37 61 53 66 78Z
        "
        stroke="#9b742f"
        strokeWidth="0.8"
        initial={{
          pathLength: 0,
          opacity: 0,
        }}
        animate={{
          pathLength: 1,
          opacity: 0.5,
        }}
        transition={{
          duration: 1,
          delay: 0.72,
        }}
      />

      <motion.circle
        cx="48"
        cy="150"
        r="3"
        fill="#9b742f"
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          opacity: 0.4,
          scale: 1,
        }}
        transition={{
          delay: 0.95,
        }}
      />
    </svg>
  );
}

/* ==========================================================================
   PAPER TEXTURE
============================================================================ */

function PaperTexture() {
  return (
    <>
      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
        style={{
          background:
            "radial-gradient(circle at 50% 28%,rgba(255,255,255,.55),transparent 52%)",
        }}
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.1]
          mix-blend-multiply
        "
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(69,52,28,.08) 0px,
              transparent 1px,
              transparent 4px
            )
          `,
        }}
      />
    </>
  );
}

/* ==========================================================================
   ATMOSPHERE
============================================================================ */

function Atmosphere({
  opening,
  lowPower,
}: {
  opening: boolean;
  lowPower: boolean;
}) {
  return (
    <div className="absolute inset-0 z-0">
      {/* FOUNDATION */}

      <div
        className="
          absolute
          inset-0
        "
        style={{
          background:
            "radial-gradient(circle at 50% 45%,#183d2a 0%,#0d2519 43%,#050e09 100%)",
        }}
      />

      {/* GOLD AMBIENCE */}

      <motion.div
        animate={{
          opacity: opening
            ? 0.32
            : 0.11,

          scale: opening
            ? 1.2
            : 1,
        }}
        transition={{
          duration: 1.35,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[62vh]
          w-[62vw]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
        "
        style={{
          background:
            "radial-gradient(circle,rgba(218,187,103,.28),transparent 68%)",

          filter: lowPower
            ? undefined
            : "blur(70px)",
        }}
      />

      {/* TOP LIGHT */}

      <div
        className="
          absolute
          left-1/2
          top-0
          h-[35vh]
          w-[60vw]
          -translate-x-1/2
        "
        style={{
          background:
            "radial-gradient(ellipse at top,rgba(229,203,127,.06),transparent 68%)",
        }}
      />

      {/* VIGNETTE */}

      <div
        className="
          absolute
          inset-0
        "
        style={{
          background:
            "radial-gradient(circle,transparent 30%,rgba(0,0,0,.64) 100%)",
        }}
      />
    </div>
  );
}

/* ==========================================================================
   FLOATING DUST
============================================================================ */

function FloatingDust() {
  const particles = useMemo(
    () => [
      {
        left: "10%",
        top: "22%",
        size: 2,
        delay: 0,
        duration: 4.6,
      },
      {
        left: "18%",
        top: "68%",
        size: 1,
        delay: 0.7,
        duration: 5,
      },
      {
        left: "29%",
        top: "38%",
        size: 2,
        delay: 1.3,
        duration: 4.2,
      },
      {
        left: "40%",
        top: "15%",
        size: 1,
        delay: 0.4,
        duration: 5.2,
      },
      {
        left: "56%",
        top: "78%",
        size: 2,
        delay: 1.7,
        duration: 4.8,
      },
      {
        left: "67%",
        top: "26%",
        size: 1,
        delay: 1,
        duration: 5.4,
      },
      {
        left: "79%",
        top: "63%",
        size: 2,
        delay: 0.25,
        duration: 4.4,
      },
      {
        left: "89%",
        top: "34%",
        size: 1,
        delay: 1.5,
        duration: 5,
      },
      {
        left: "74%",
        top: "14%",
        size: 1,
        delay: 2,
        duration: 4.8,
      },
      {
        left: "34%",
        top: "82%",
        size: 1,
        delay: 1.1,
        duration: 5.1,
      },
    ],
    []
  );

  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-[2]
      "
    >
      {particles.map(
        (particle, index) => (
          <motion.span
            key={index}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: [
                0,
                0.4,
                0.18,
                0,
              ],

              y: [
                12,
                -5,
                -18,
                -32,
              ],

              x: [
                0,
                2,
                -2,
                1,
              ],
            }}
            transition={{
              duration:
                particle.duration,

              delay:
                particle.delay,

              repeat: Infinity,

              repeatDelay: 0.7,

              ease: "easeInOut",
            }}
            className="
              absolute
              rounded-full
              bg-[#e5ca7c]
            "
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,

              boxShadow:
                "0 0 6px rgba(229,202,124,.45)",
            }}
          />
        )
      )}
    </div>
  );
}

/* ==========================================================================
   FINAL REVEAL CURTAINS
============================================================================ */

function RevealCurtains({
  opening,
  lowPower,
}: {
  opening: boolean;
  lowPower: boolean;
}) {
  return (
    <>
      {/* LEFT */}

      <motion.div
        initial={{ x: 0 }}
        animate={{
          x: opening
            ? "-102%"
            : 0,
        }}
        transition={{
          duration: lowPower
            ? 1.05
            : 1.65,

          ease: CURTAIN_EASE,
        }}
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          z-10
          h-full
          w-1/2
        "
        style={{
          background:
            "linear-gradient(100deg,#06110b,#102d1e 72%,#07140d)",

          boxShadow: lowPower
            ? undefined
            : "15px 0 60px rgba(0,0,0,.55)",

          willChange: "transform",
        }}
      >
        <CurtainDetail side="left" />
      </motion.div>

      {/* RIGHT */}

      <motion.div
        initial={{ x: 0 }}
        animate={{
          x: opening
            ? "102%"
            : 0,
        }}
        transition={{
          duration: lowPower
            ? 1.05
            : 1.65,

          ease: CURTAIN_EASE,
        }}
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          z-10
          h-full
          w-1/2
        "
        style={{
          background:
            "linear-gradient(260deg,#06110b,#102d1e 72%,#07140d)",

          boxShadow: lowPower
            ? undefined
            : "-15px 0 60px rgba(0,0,0,.55)",

          willChange: "transform",
        }}
      >
        <CurtainDetail side="right" />
      </motion.div>
    </>
  );
}

/* ==========================================================================
   CURTAIN DETAIL
============================================================================ */

function CurtainDetail({
  side,
}: {
  side: "left" | "right";
}) {
  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
      "
    >
      {/* GOLD EDGE */}

      <div
        className={`
          absolute
          bottom-[5%]
          top-[5%]
          w-px

          bg-gradient-to-b
          from-transparent
          via-[#d4b868]/25
          to-transparent

          ${
            side === "left"
              ? "right-[5%]"
              : "left-[5%]"
          }
        `}
      />

      {/* VERY SUBTLE FABRIC LIGHT */}

      <div
        className="
          absolute
          inset-0
        "
        style={{
          background:
            side === "left"
              ? "linear-gradient(110deg,transparent 20%,rgba(214,186,105,.028) 55%,transparent 80%)"
              : "linear-gradient(250deg,transparent 20%,rgba(214,186,105,.028) 55%,transparent 80%)",
        }}
      />
    </div>
  );
}