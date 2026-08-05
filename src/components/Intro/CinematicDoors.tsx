"use client";

import React, {
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
const DOOR_EASE = [0.22, 1, 0.36, 1] as const;
const EXIT_EASE = [0.4, 0, 1, 1] as const;

/* ==========================================================================
   DEVICE HELPER
============================================================================ */

function getLowPowerDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const lowCPU = (navigator.hardwareConcurrency ?? 8) <= 4;
  const saveData = Boolean(
    (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection?.saveData
  );

  // Screen width is not a performance signal. Modern phones should retain
  // the full visual treatment; only genuinely constrained devices simplify it.
  return lowCPU || saveData;
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
    const updateDeviceProfile = () => {
      setLowPower(getLowPowerDevice());
    };

    updateDeviceProfile();
    window.addEventListener("resize", updateDeviceProfile, { passive: true });

    return () => {
      window.removeEventListener("resize", updateDeviceProfile);
    };
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
        bg-transparent
      "
      style={{
        transform: "translateZ(0)",
        isolation: "isolate",
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
              px-[clamp(12px,4vw,32px)]
              py-[max(12px,env(safe-area-inset-top))]
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
                h-[clamp(420px,76svh,640px)]
                w-[min(94vw,920px)]
                max-h-[calc(100svh-24px)]

                sm:h-[min(76dvh,640px)]
                sm:min-h-[440px]
                sm:w-[min(88vw,920px)]
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

      <RoyalDoor
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
        px-[clamp(24px,8vw,64px)]
        py-[clamp(28px,7svh,48px)]

        sm:px-16
        sm:py-12
        lg:px-20
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
          max-w-[min(660px,100%)]
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
            mt-3
            text-[clamp(1.75rem,10vw,5.5rem)]

            sm:mt-4
            sm:text-[clamp(2.1rem,6vw,5.5rem)]
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
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: opening ? 0 : 1,
        scale: opening ? 1.08 : 1,
      }}
      transition={{
        duration: lowPower ? 0.9 : 1.55,
        ease: DOOR_EASE,
      }}
      className="absolute inset-0 z-0 bg-[#07120c]"
      style={{ willChange: "transform, opacity" }}
    >
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
    </motion.div>
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
   FINAL REVEAL — LUXURY DOUBLE ROYAL DOORS
============================================================================ */

function RoyalDoor({
  opening,
  lowPower,
}: {
  opening: boolean;
  lowPower: boolean;
}) {
  const duration = lowPower ? 1.25 : 2.05;
  const openingEase = [0.77, 0, 0.175, 1] as const;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden="true"
      animate={{ opacity: opening ? [1, 1, 0] : 1 }}
      transition={{
        duration: opening ? duration + 0.25 : 0.25,
        times: [0, 0.88, 1],
        ease: "linear",
      }}
    >
      {/* Architectural surround gives the doors a believable luxury entrance. */}
      <motion.div
        animate={{
          opacity: opening ? [1, 1, 0] : 1,
          scale: opening ? [1, 1.01, 1.055] : 1,
        }}
        transition={{
          duration: duration + 0.12,
          times: [0, 0.72, 1],
          ease: openingEase,
        }}
        className="absolute inset-0 z-0"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="absolute inset-0 bg-[#030805]" />
        <div className="absolute inset-[clamp(5px,1.2vw,20px)] border border-[#d9bd73]/35 shadow-[inset_0_0_90px_rgba(0,0,0,.92),0_0_45px_rgba(0,0,0,.7)]" />
        <div className="absolute inset-[clamp(10px,2vw,34px)] border border-[#8e6b31]/25" />
        <div className="absolute left-1/2 top-[clamp(10px,2.3vw,38px)] h-[clamp(34px,6vw,80px)] w-[clamp(150px,32vw,440px)] -translate-x-1/2 rounded-t-full border border-[#d9bd73]/30 bg-[radial-gradient(ellipse_at_bottom,rgba(196,157,70,.12),transparent_70%)]" />
      </motion.div>

      {/* Soft website reveal. This stays flat: no page-turn perspective. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.86 }}
        animate={
          opening
            ? {
              opacity: [0, 0.15, 0.38, 0],
              scale: [0.86, 0.96, 1.08, 1.22],
            }
            : { opacity: 0, scale: 0.86 }
        }
        transition={{
          duration: duration + 0.18,
          times: [0, 0.28, 0.72, 1],
          ease: openingEase,
        }}
        className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,rgba(255,235,181,.24)_0%,rgba(90,121,87,.08)_34%,transparent_70%)]"
        style={{ willChange: "transform, opacity" }}
      />

      <motion.div
        initial={{ opacity: 0, scaleX: 0.002 }}
        animate={
          opening
            ? {
              opacity: [0, 0.85, 0.28, 0],
              scaleX: [0.002, 0.018, 0.48, 1.18],
            }
            : { opacity: 0, scaleX: 0.002 }
        }
        transition={{
          duration: duration,
          times: [0, 0.12, 0.62, 1],
          ease: openingEase,
        }}
        className="absolute inset-y-0 left-1/2 z-[25] w-full -translate-x-1/2 origin-center bg-[linear-gradient(90deg,transparent,rgba(255,237,185,.18),transparent)] blur-[10px]"
      />

      <DoorWing
        side="left"
        opening={opening}
        lowPower={lowPower}
        duration={duration}
        ease={openingEase}
      />
      <DoorWing
        side="right"
        opening={opening}
        lowPower={lowPower}
        duration={duration}
        ease={openingEase}
      />

      {/* Central lock line disappears first, then the doors glide apart. */}
      <motion.div
        animate={{
          opacity: opening ? [1, 0.9, 0] : 1,
          scaleY: opening ? [1, 1.04, 0.2] : 1,
        }}
        transition={{ duration: lowPower ? 0.35 : 0.52, ease: "easeOut" }}
        className="absolute inset-y-[3%] left-1/2 z-30 w-px -translate-x-1/2 origin-center bg-gradient-to-b from-transparent via-[#f0d68d]/75 to-transparent shadow-[0_0_18px_rgba(238,211,139,.38)]"
      />
    </motion.div>
  );
}

type DoorSide = "left" | "right";

function DoorWing({
  side,
  opening,
  lowPower,
  duration,
  ease,
}: {
  side: DoorSide;
  opening: boolean;
  lowPower: boolean;
  duration: number;
  ease: readonly [number, number, number, number];
}) {
  const isLeft = side === "left";

  return (
    <motion.div
      initial={{ x: "0%", scale: 1 }}
      animate={
        opening
          ? {
            x: isLeft
              ? ["0%", "-1.5%", "-9%", "-108%"]
              : ["0%", "1.5%", "9%", "108%"],
            scale: [1, 1, 0.998, 1.015],
          }
          : { x: "0%", scale: 1 }
      }
      transition={{
        duration,
        times: [0, 0.12, 0.32, 1],
        ease,
      }}
      className={`absolute inset-y-0 z-20 w-[calc(50%+1px)] ${isLeft ? "left-0 origin-right" : "right-0 origin-left"
        }`}
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
        filter: lowPower
          ? undefined
          : isLeft
            ? "drop-shadow(26px 0 38px rgba(0,0,0,.62))"
            : "drop-shadow(-26px 0 38px rgba(0,0,0,.62))",
      }}
    >
      <RoyalDoorLeaf side={side} lowPower={lowPower} />
    </motion.div>
  );
}

function RoyalDoorLeaf({
  side,
  lowPower,
}: {
  side: DoorSide;
  lowPower: boolean;
}) {
  const isLeft = side === "left";

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${isLeft ? "border-r" : "border-l"
        } border-[#e0c779]/35`}
      style={{
        background: isLeft
          ? "linear-gradient(108deg,#020604 0%,#07160e 16%,#123823 47%,#0b291a 76%,#030b07 100%)"
          : "linear-gradient(252deg,#020604 0%,#07160e 16%,#123823 47%,#0b291a 76%,#030b07 100%)",
        boxShadow: isLeft
          ? "inset -30px 0 64px rgba(0,0,0,.58),inset 18px 0 28px rgba(233,207,133,.035)"
          : "inset 30px 0 64px rgba(0,0,0,.58),inset -18px 0 28px rgba(233,207,133,.035)",
      }}
    >
      {/* Fine wood grain remains subtle enough not to shimmer during movement. */}
      {!lowPower && (
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,transparent 0,transparent 8%,rgba(231,203,126,.055) 8.15%,transparent 8.4%)",
          }}
        />
      )}

      <div className="absolute inset-[clamp(7px,1.7vw,30px)] border border-[#e0c779]/36 shadow-[inset_0_0_38px_rgba(0,0,0,.42)]" />
      <div className="absolute inset-[clamp(12px,2.5vw,45px)] border border-[#9d7938]/30" />

      <DoorPanel className="left-[10%] right-[10%] top-[7%] h-[35%] rounded-t-[48%]" arched />
      <DoorPanel className="bottom-[7%] left-[10%] right-[10%] h-[38%]" />

      <RoyalFiligree side={side} />

      <div
        className={`absolute top-[46%] flex size-[clamp(46px,9vw,112px)] -translate-y-1/2 items-center justify-center rounded-full border border-[#f0d68a]/42 bg-[radial-gradient(circle,#143622_0%,#07140d_72%)] shadow-[0_0_34px_rgba(223,194,113,.12),inset_0_0_26px_rgba(223,194,113,.1)] ${isLeft ? "right-[4.5%]" : "left-[4.5%]"
          }`}
      >
        <div className="absolute inset-[10%] rotate-45 border border-[#b89145]/35" />
        <div className="absolute inset-[24%] rounded-full border border-[#efd488]/28" />
        <span
          className="relative text-[clamp(1.15rem,4vw,2.75rem)] font-semibold text-[#ead188]/90"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          S
        </span>
      </div>

      <DoorHandle side={side} />

      {[19, 50, 81].map((top) => (
        <div
          key={top}
          className={`absolute h-[clamp(24px,5svh,48px)] w-[clamp(5px,.65vw,9px)] -translate-y-1/2 rounded-sm border border-[#d0ad5e]/36 bg-[linear-gradient(90deg,#3d2a0d,#a57c35,#4a340f)] ${isLeft ? "left-[1.1%]" : "right-[1.1%]"
            }`}
          style={{ top: `${top}%` }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-45"
        style={{
          background: isLeft
            ? "linear-gradient(118deg,transparent 18%,rgba(255,228,151,.055) 49%,transparent 72%)"
            : "linear-gradient(242deg,transparent 18%,rgba(255,228,151,.055) 49%,transparent 72%)",
        }}
      />
    </div>
  );
}

function DoorPanel({
  className,
  arched = false,
}: {
  className: string;
  arched?: boolean;
}) {
  return (
    <div
      className={`absolute overflow-hidden border border-[#dfc577]/30 bg-[linear-gradient(145deg,rgba(255,255,255,.018),rgba(0,0,0,.14))] shadow-[inset_0_0_44px_rgba(0,0,0,.44)] ${className}`}
    >
      <div
        className={`absolute inset-[7%] border border-[#a8843d]/25 ${arched ? "rounded-t-[48%]" : ""
          }`}
      />
      <div
        className={`absolute inset-x-[22%] inset-y-[17%] border border-[#ddc175]/18 ${arched ? "rounded-t-full" : ""
          }`}
      />
      <div className="absolute left-1/2 top-1/2 size-[clamp(18px,4vw,44px)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#c9a857]/17" />
    </div>
  );
}

function DoorHandle({ side }: { side: DoorSide }) {
  const isLeft = side === "left";

  return (
    <div
      className={`absolute top-[60%] h-[clamp(48px,9svh,88px)] w-[clamp(10px,1.2vw,16px)] -translate-y-1/2 rounded-full border border-[#f3db96]/48 bg-[linear-gradient(90deg,#604314,#d1ae5d,#8b6425)] shadow-[0_0_20px_rgba(229,199,120,.2),inset_1px_0_2px_rgba(255,244,195,.35)] ${isLeft ? "right-[3.6%]" : "left-[3.6%]"
        }`}
    >
      <div className="absolute left-1/2 top-0 size-[clamp(11px,2vw,16px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f0d58e]/42 bg-[#9b722d]" />
      <div className="absolute bottom-0 left-1/2 size-[clamp(11px,2vw,16px)] -translate-x-1/2 translate-y-1/2 rounded-full border border-[#f0d58e]/42 bg-[#9b722d]" />
      <div className="absolute left-1/2 top-1/2 h-[60%] w-px -translate-x-1/2 -translate-y-1/2 bg-white/20" />
    </div>
  );
}

function RoyalFiligree({ side }: { side: DoorSide }) {
  const isLeft = side === "left";

  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      className={`absolute top-[13%] h-[clamp(72px,15vw,150px)] w-[clamp(100px,23vw,220px)] opacity-55 ${isLeft ? "right-[9%]" : "left-[9%] -scale-x-100"
        }`}
    >
      <path
        d="M14 142C60 126 64 75 108 72C151 69 161 30 206 17"
        stroke="#d8bb6d"
        strokeWidth="1"
      />
      <path
        d="M48 121C74 117 84 98 84 77C58 79 44 94 48 121Z"
        stroke="#b89449"
        strokeWidth=".8"
      />
      <path
        d="M115 69C137 62 148 45 143 27C122 31 111 47 115 69Z"
        stroke="#b89449"
        strokeWidth=".8"
      />
      <circle cx="107" cy="72" r="3" fill="#d8bb6d" />
    </svg>
  );
}