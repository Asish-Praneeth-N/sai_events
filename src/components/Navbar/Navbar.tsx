"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  ChevronDown,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

interface NavbarProps {
  activeSection?: number;
  sections?: {
    label: string;
    id: string;
  }[];
}

/* -------------------------------------------------------------------------- */
/*                              NAVIGATION DATA                               */
/* -------------------------------------------------------------------------- */

const GUEST_NAV = [
  { label: "Home", href: "#home" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Atelier", href: "#categories" },
  { label: "Gallery", href: "#gallery" },
  { label: "Journey", href: "#journey" },
  { label: "Chronicle", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const CUSTOMER_NAV = [
  { label: "Home", href: "#home", icon: null },
  {
    label: "My Events",
    href: "/customer/request",
    icon: Calendar,
  },
  {
    label: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Gallery",
    href: "#gallery",
    icon: null,
  },
  {
    label: "Profile",
    href: "/customer/profile",
    icon: User,
  },
];

const VENDOR_NAV = [
  {
    label: "Home",
    href: "#home",
    icon: null,
  },
  {
    label: "Dashboard",
    href: "/vendor/page",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/vendor/bookings",
    icon: Briefcase,
  },
  {
    label: "Portfolio",
    href: "/vendor/services",
    icon: ImageIcon,
  },
  {
    label: "Messages",
    href: "/vendor/inbox",
    icon: Inbox,
  },
  {
    label: "Profile",
    href: "/vendor/profile",
    icon: User,
  },
];

/* -------------------------------------------------------------------------- */
/*                                  NAVBAR                                    */
/* -------------------------------------------------------------------------- */

export default function Navbar({
  activeSection = 0,
  sections = [],
}: NavbarProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                              SUPABASE AUTH                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const supabase = createClient();

    async function fetchProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && mounted) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (mounted) {
          setProfile(data);
          setAuthLoading(false);
        }
      } else {
        if (mounted) {
          setProfile(null);
          setAuthLoading(false);
        }
      }
    }

    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (mounted) {
            setProfile(data);
          }
        } else {
          if (mounted) {
            setProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                                 LOGOUT                                   */
  /* ------------------------------------------------------------------------ */

  const handleLogout = async () => {
    setDropdownOpen(false);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  /* ------------------------------------------------------------------------ */
  /*                             SCROLL LISTENER                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                          MOBILE BODY SCROLL LOCK                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* ------------------------------------------------------------------------ */
  /*                         ROLE-BASED NAVIGATION                            */
  /* ------------------------------------------------------------------------ */

  const role = profile?.role ?? "guest";

  const navItems =
    role === "customer"
      ? CUSTOMER_NAV
      : role === "vendor"
        ? VENDOR_NAV
        : GUEST_NAV;

  const currentSectionLabel =
    sections[activeSection]?.label ?? "";

  /* ------------------------------------------------------------------------ */
  /*                                  UI                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* ==================================================================== */}
      {/*                         DESKTOP / TOP NAV                            */}
      {/* ==================================================================== */}

      <motion.nav
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : -18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.85,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`
          fixed
          left-0
          top-0
          z-50

          w-full

          border-b

          transition-all
          duration-500

          ${
            scrolled
              ? `
                border-[#173d2c]/10
                bg-[#f7f0e6]/90
                shadow-[0_10px_40px_rgba(31,52,41,0.05)]
                backdrop-blur-xl

                dark:border-white/[0.07]
                dark:bg-[#151711]/90
                dark:shadow-[0_10px_40px_rgba(0,0,0,0.18)]
              `
              : `
                border-transparent
                bg-transparent
              `
          }
        `}
      >
        {/* subtle top gold line */}

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: scrolled ? 1 : 0 }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            absolute
            left-0
            top-0

            h-px
            w-full

            origin-left

            bg-gradient-to-r
            from-transparent
            via-[#a17a34]/45
            to-transparent

            dark:via-[#d4af37]/35
          "
        />

        <div
          className={`
            relative

            mx-auto
            flex
            w-full
            max-w-[1500px]

            items-center
            justify-between

            px-6

            transition-[height,padding]
            duration-500

            sm:px-8
            lg:px-[5%]

            ${
              scrolled
                ? "h-[68px]"
                : "h-[86px]"
            }
          `}
        >
          {/* ================================================================ */}
          {/*                             BRAND                                */}
          {/* ================================================================ */}

          <Link
            href="#home"
            className="
              group

              relative

              flex
              flex-shrink-0

              items-center
              gap-3

              select-none

              no-underline
            "
          >
            {/* monogram */}

            <div
              className="
                relative

                flex
                h-9
                w-9

                items-center
                justify-center
              "
            >
              <span
                className="
                  absolute
                  inset-0

                  rotate-45

                  border
                  border-[#173d2c]/20

                  transition-transform
                  duration-500

                  group-hover:rotate-[135deg]

                  dark:border-[#d4af37]/25
                "
              />

              <Sparkles
                className="
                  relative
                  z-10

                  h-3.5
                  w-3.5

                  stroke-[1.5]

                  text-[#9a742f]

                  dark:text-[#d4af37]
                "
              />
            </div>

            {/* wordmark */}

            <div className="leading-none">
              <span
                className="
                  block

                  font-heading

                  text-[14px]
                  font-normal
                  uppercase
                  tracking-[0.24em]

                  text-[#143d2b]

                  transition-colors
                  duration-300

                  dark:text-[#eee5d7]
                "
                style={{
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Sai Events
              </span>

              <span
                className="
                  mt-1.5
                  hidden

                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.24em]

                  text-[#143d2b]/60

                  sm:block

                  dark:text-white/50
                "
              >
                Curated Celebrations
              </span>
            </div>
          </Link>

          {/* ================================================================ */}
          {/*                       ACTIVE SECTION LABEL                       */}
          {/* ================================================================ */}

          <AnimatePresence mode="wait">
            {activeSection > 0 &&
              currentSectionLabel && (
                <motion.div
                  key={currentSectionLabel}
                  initial={{
                    opacity: 0,
                    y: -6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 6,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
                    pointer-events-none

                    absolute
                    left-1/2
                    top-1/2

                    hidden

                    -translate-x-1/2
                    -translate-y-1/2

                    items-center
                    gap-3

                    xl:flex
                  "
                >
                  <span
                    className="
                      h-px
                      w-5

                      bg-[#a17a34]/40

                      dark:bg-[#d4af37]/35
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]

                      text-[#143d2b]/60

                      dark:text-[#eee5d7]/60
                    "
                  >
                    {currentSectionLabel}
                  </span>

                  <span
                    className="
                      h-px
                      w-5

                      bg-[#a17a34]/40

                      dark:bg-[#d4af37]/35
                    "
                  />
                </motion.div>
              )}
          </AnimatePresence>

          {/* ================================================================ */}
          {/*                           DESKTOP NAV                            */}
          {/* ================================================================ */}

          <div
            className="
              hidden
              items-center
              gap-3

              lg:flex
              lg:gap-4
              xl:gap-5
            "
          >
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration:
                    shouldReduceMotion
                      ? 0.2
                      : 0.55,
                  delay:
                    shouldReduceMotion
                      ? 0
                      : 0.08 + index * 0.045,
                }}
                className="
                  group
                  relative

                  py-2
                  whitespace-nowrap

                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]

                  text-[#143d2b]/80

                  transition-colors
                  duration-300

                  hover:text-[#143d2b]

                  lg:text-[11px]
                  xl:text-[12px]

                  dark:text-[#eee5d7]/80
                  dark:hover:text-[#eee5d7]
                "
              >
                {item.label}

                <span
                  className="
                    absolute
                    bottom-0
                    left-1/2

                    h-px
                    w-0

                    -translate-x-1/2

                    bg-[#9b742f]

                    transition-all
                    duration-300

                    group-hover:w-full

                    dark:bg-[#d4af37]
                  "
                />
              </motion.a>
            ))}
          </div>

          {/* ================================================================ */}
          {/*                         RIGHT ACTIONS                            */}
          {/* ================================================================ */}

          <div
            className="
              hidden
              items-center
              gap-3

              lg:flex
            "
          >
            {/* theme toggle */}

            <div
              className="
                flex
                items-center

                border-l
                border-[#143d2b]/10

                pl-3

                dark:border-white/[0.08]
              "
            >
              <ThemeToggle />
            </div>

            {/* ------------------------------------------------------------- */}
            {/* AUTH LOADING                                                  */}
            {/* ------------------------------------------------------------- */}

            {authLoading ? (
              <div
                className="
                  h-8
                  w-20

                  animate-pulse

                  bg-[#143d2b]/5

                  dark:bg-white/[0.05]
                "
              />
            ) : profile ? (
              /* ------------------------------------------------------------ */
              /* AUTHENTICATED PROFILE                                        */
              /* ------------------------------------------------------------ */

              <div className="relative">
                <button
                  onClick={() =>
                    setDropdownOpen(
                      !dropdownOpen
                    )
                  }
                  className="
                    group

                    flex
                    cursor-pointer

                    items-center
                    gap-2.5

                    border-l
                    border-[#143d2b]/10

                    py-1
                    pl-4

                    text-[#143d2b]

                    transition-colors
                    duration-300

                    dark:border-white/[0.08]
                    dark:text-[#eee5d7]
                  "
                >
                  {/* avatar */}

                  <div
                    className="
                      relative

                      flex
                      h-8
                      w-8

                      items-center
                      justify-center

                      border
                      border-[#143d2b]/15

                      font-heading

                      text-[10px]
                      font-semibold

                      text-[#143d2b]

                      transition-colors
                      duration-300

                      group-hover:border-[#9b742f]/45

                      dark:border-white/10
                      dark:text-[#eee5d7]
                      dark:group-hover:border-[#d4af37]/40
                    "
                  >
                    {profile.full_name?.[0]?.toUpperCase() ??
                      "U"}

                    <span
                      className="
                        absolute
                        -bottom-[2px]
                        -right-[2px]

                        h-1.5
                        w-1.5

                        bg-[#9b742f]

                        dark:bg-[#d4af37]
                      "
                    />
                  </div>

                  <div
                    className="
                      hidden
                      text-left

                      xl:block
                    "
                  >
                    <span
                      className="
                        block
                        max-w-[110px]

                        truncate

                        text-[9px]
                        font-semibold

                        text-[#143d2b]/75

                        dark:text-[#eee5d7]/70
                      "
                    >
                      {profile.full_name}
                    </span>

                    <span
                      className="
                        mt-0.5
                        block

                        text-[6px]
                        font-bold
                        uppercase
                        tracking-[0.2em]

                        text-[#9b742f]/70

                        dark:text-[#d4af37]/65
                      "
                    >
                      {profile.role}
                    </span>
                  </div>

                  <ChevronDown
                    className={`
                      h-3
                      w-3

                      text-[#143d2b]/35

                      transition-transform
                      duration-300

                      dark:text-white/30

                      ${
                        dropdownOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />
                </button>

                {/* dropdown backdrop */}

                {dropdownOpen && (
                  <div
                    className="
                      fixed
                      inset-0
                      z-40
                    "
                    onClick={() =>
                      setDropdownOpen(false)
                    }
                  />
                )}

                {/* --------------------------------------------------------- */}
                {/* PROFILE DROPDOWN                                          */}
                {/* --------------------------------------------------------- */}

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: [
                          0.16,
                          1,
                          0.3,
                          1,
                        ],
                      }}
                      className="
                        absolute
                        right-0
                        top-12
                        z-50

                        w-[240px]

                        border
                        border-[#143d2b]/10

                        bg-[#f7f0e6]/95

                        p-2

                        shadow-[0_24px_70px_rgba(23,61,44,0.14)]

                        backdrop-blur-xl

                        dark:border-white/[0.08]
                        dark:bg-[#181a15]/95
                        dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]
                      "
                    >
                      {/* profile header */}

                      <div
                        className="
                          border-b
                          border-[#143d2b]/10

                          px-3
                          pb-3
                          pt-2

                          dark:border-white/[0.08]
                        "
                      >
                        <p
                          className="
                            truncate

                            font-heading

                            text-sm
                            font-normal

                            text-[#143d2b]

                            dark:text-[#eee5d7]
                          "
                          style={{
                            fontFamily:
                              '"Playfair Display", serif',
                          }}
                        >
                          {profile.full_name}
                        </p>

                        <div
                          className="
                            mt-1.5
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              h-px
                              w-4

                              bg-[#9b742f]/50

                              dark:bg-[#d4af37]/45
                            "
                          />

                          <span
                            className="
                              text-[7px]
                              font-bold
                              uppercase
                              tracking-[0.22em]

                              text-[#9b742f]

                              dark:text-[#d4af37]
                            "
                          >
                            {profile.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1.5">
                        {profile.role ===
                          "customer" && (
                          <Link
                            href="/customer/dashboard"
                            onClick={() =>
                              setDropdownOpen(
                                false
                              )
                            }
                            className="
                              group

                              flex
                              items-center
                              gap-3

                              px-3
                              py-2.5

                              text-[10px]
                              font-medium

                              text-[#143d2b]/60

                              transition-colors

                              hover:bg-[#143d2b]/[0.035]
                              hover:text-[#143d2b]

                              dark:text-[#eee5d7]/50
                              dark:hover:bg-white/[0.035]
                              dark:hover:text-[#eee5d7]
                            "
                          >
                            <LayoutDashboard
                              className="
                                h-3.5
                                w-3.5

                                text-[#9b742f]

                                dark:text-[#d4af37]
                              "
                            />

                            Customer Portal

                            <ArrowUpRight
                              className="
                                ml-auto
                                h-3
                                w-3

                                opacity-0

                                transition-all

                                group-hover:opacity-50
                              "
                            />
                          </Link>
                        )}

                        {profile.role ===
                          "vendor" && (
                          <Link
                            href="/vendor/inbox"
                            onClick={() =>
                              setDropdownOpen(
                                false
                              )
                            }
                            className="
                              group

                              flex
                              items-center
                              gap-3

                              px-3
                              py-2.5

                              text-[10px]
                              font-medium

                              text-[#143d2b]/60

                              transition-colors

                              hover:bg-[#143d2b]/[0.035]
                              hover:text-[#143d2b]

                              dark:text-[#eee5d7]/50
                              dark:hover:bg-white/[0.035]
                              dark:hover:text-[#eee5d7]
                            "
                          >
                            <Inbox
                              className="
                                h-3.5
                                w-3.5

                                text-[#9b742f]

                                dark:text-[#d4af37]
                              "
                            />

                            Vendor Portal

                            <ArrowUpRight
                              className="
                                ml-auto
                                h-3
                                w-3

                                opacity-0

                                transition-all

                                group-hover:opacity-50
                              "
                            />
                          </Link>
                        )}

                        {profile.role ===
                          "admin" && (
                          <Link
                            href="/admin"
                            onClick={() =>
                              setDropdownOpen(
                                false
                              )
                            }
                            className="
                              group

                              flex
                              items-center
                              gap-3

                              px-3
                              py-2.5

                              text-[10px]
                              font-medium

                              text-[#143d2b]/60

                              transition-colors

                              hover:bg-[#143d2b]/[0.035]
                              hover:text-[#143d2b]

                              dark:text-[#eee5d7]/50
                              dark:hover:bg-white/[0.035]
                              dark:hover:text-[#eee5d7]
                            "
                          >
                            <LayoutDashboard
                              className="
                                h-3.5
                                w-3.5

                                text-[#9b742f]

                                dark:text-[#d4af37]
                              "
                            />

                            Admin Console

                            <ArrowUpRight
                              className="
                                ml-auto
                                h-3
                                w-3

                                opacity-0

                                transition-all

                                group-hover:opacity-50
                              "
                            />
                          </Link>
                        )}

                        <div
                          className="
                            my-1
                            h-px

                            bg-[#143d2b]/10

                            dark:bg-white/[0.08]
                          "
                        />

                        <button
                          onClick={
                            handleLogout
                          }
                          className="
                            flex
                            w-full
                            cursor-pointer

                            items-center
                            gap-3

                            px-3
                            py-2.5

                            text-[10px]
                            font-medium

                            text-red-700/60

                            transition-colors

                            hover:bg-red-500/[0.05]
                            hover:text-red-700

                            dark:text-red-300/60
                            dark:hover:text-red-300
                          "
                        >
                          <LogOut className="h-3.5 w-3.5" />

                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ------------------------------------------------------------ */
              /* GUEST ACTIONS                                                */
              /* ------------------------------------------------------------ */

              <>
                <Link
                  href="/login"
                  className="
                    relative

                    px-2.5
                    py-2
                    whitespace-nowrap

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]

                    text-[#143d2b]/80

                    transition-colors
                    duration-300

                    hover:text-[#143d2b]

                    lg:text-[11px]
                    xl:text-[12px]

                    dark:text-[#eee5d7]/80
                    dark:hover:text-[#eee5d7]
                  "
                >
                  Log In
                </Link>

                <motion.div
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
                          scale: 0.98,
                        }
                  }
                >
                  <Link
                    href="/register"
                    className="
                      group

                      flex
                      items-center
                      gap-2
                      whitespace-nowrap

                      bg-[#143d2b]

                      px-3.5
                      py-2

                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      text-[#f8f1e7]

                      shadow-[0_10px_30px_rgba(20,61,43,0.12)]

                      transition-colors
                      duration-300

                      hover:bg-[#1b4a35]

                      sm:px-4.5
                      sm:py-2.5

                      lg:text-[11px]
                      xl:text-[12px]

                      dark:bg-[#d2b56b]
                      dark:text-[#11130f]
                      dark:hover:bg-[#ddc57f]
                    "
                  >
                    Book Event

                    <ArrowUpRight
                      className="
                        h-3
                        w-3

                        transition-transform
                        duration-300

                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* ================================================================ */}
          {/*                           MOBILE TOGGLE                          */}
          {/* ================================================================ */}

          <div
            className="
              flex
              items-center
              gap-2

              lg:hidden
            "
          >
            <ThemeToggle />

            <button
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="
                relative

                flex
                h-10
                w-10

                cursor-pointer

                items-center
                justify-center

                border
                border-[#143d2b]/15

                text-[#143d2b]

                transition-all
                duration-300

                hover:border-[#9b742f]/45
                hover:text-[#9b742f]

                dark:border-white/10
                dark:text-[#eee5d7]
                dark:hover:border-[#d4af37]/40
                dark:hover:text-[#d4af37]
              "
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ==================================================================== */}
      {/*                          MOBILE MENU                                 */}
      {/* ==================================================================== */}

      <AnimatePresence>
        {mobileOpen && (
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
            transition={{
              duration:
                shouldReduceMotion
                  ? 0.15
                  : 0.35,
            }}
            className="
              fixed
              inset-0
              z-[99999]

              flex
              h-[100dvh]
              w-screen

              flex-col

              overflow-hidden

              bg-[#f2e8da]

              dark:bg-[#12140f]
            "
          >
            {/* giant background word */}

            <motion.span
              aria-hidden="true"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 1,
              }}
              className="
                pointer-events-none

                absolute
                -bottom-[3%]
                -right-[5%]

                hidden

                font-heading

                text-[32vw]
                italic
                leading-none

                text-[#143d2b]/[0.025]

                sm:block

                dark:text-white/[0.018]
              "
              style={{
                fontFamily:
                  '"Playfair Display", serif',
              }}
            >
              SAI
            </motion.span>

            {/* ambient light */}

            <div
              className="
                pointer-events-none

                absolute
                -left-[30%]
                top-[20%]

                h-[450px]
                w-[450px]

                rounded-full

                bg-[#c79c4c]/[0.05]

                blur-[120px]

                dark:bg-[#d4af37]/[0.025]
              "
            />

            {/* ------------------------------------------------------------- */}
            {/* MOBILE HEADER                                                 */}
            {/* ------------------------------------------------------------- */}

            <div
              className="
                relative
                z-10

                flex
                h-[78px]

                flex-shrink-0

                items-center
                justify-between

                border-b
                border-[#143d2b]/10

                px-6

                dark:border-white/[0.08]
              "
            >
              <Link
                href="#home"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    relative

                    flex
                    h-8
                    w-8

                    items-center
                    justify-center
                  "
                >
                  <span
                    className="
                      absolute
                      inset-0

                      rotate-45

                      border
                      border-[#143d2b]/20

                      dark:border-[#d4af37]/25
                    "
                  />

                  <Sparkles
                    className="
                      relative
                      h-3
                      w-3

                      text-[#9b742f]

                      dark:text-[#d4af37]
                    "
                  />
                </div>

                <div>
                  <span
                    className="
                      block

                      font-heading

                      text-[13px]
                      uppercase
                      tracking-[0.23em]

                      text-[#143d2b]

                      dark:text-[#eee5d7]
                    "
                    style={{
                      fontFamily:
                        '"Playfair Display", serif',
                    }}
                  >
                    Sai Events
                  </span>

                  <span
                    className="
                      mt-1
                      block

                      text-[6px]
                      font-bold
                      uppercase
                      tracking-[0.25em]

                      text-[#143d2b]/30

                      dark:text-white/20
                    "
                  >
                    Curated Celebrations
                  </span>
                </div>
              </Link>

              <button
                onClick={() =>
                  setMobileOpen(false)
                }
                aria-label="Close menu"
                className="
                  flex
                  h-10
                  w-10

                  cursor-pointer

                  items-center
                  justify-center

                  border
                  border-[#143d2b]/15

                  text-[#143d2b]/60

                  transition-colors

                  hover:border-[#9b742f]/40
                  hover:text-[#9b742f]

                  dark:border-white/10
                  dark:text-white/50
                  dark:hover:border-[#d4af37]/40
                  dark:hover:text-[#d4af37]
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MOBILE LINKS                                                  */}
            {/* ------------------------------------------------------------- */}

            <nav
              className="
                relative
                z-10

                flex
                flex-1

                flex-col

                justify-center

                overflow-y-auto

                px-6
                py-7

                sm:px-10
              "
            >
              <div
                className="
                  mx-auto
                  w-full
                  max-w-[650px]
                "
              >
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.1,
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
                      w-7

                      bg-[#9b742f]/40

                      dark:bg-[#d4af37]/35
                    "
                  />

                  <span
                    className="
                      text-[7px]
                      font-bold
                      uppercase
                      tracking-[0.3em]

                      text-[#9b742f]/70

                      dark:text-[#d4af37]/60
                    "
                  >
                    Navigation
                  </span>
                </motion.div>

                {navItems.map(
                  (item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      onClick={() =>
                        setMobileOpen(
                          false
                        )
                      }
                      initial={{
                        opacity: 0,
                        x: shouldReduceMotion
                          ? 0
                          : -20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration:
                          shouldReduceMotion
                            ? 0.15
                            : 0.55,
                        delay:
                          shouldReduceMotion
                            ? 0
                            : 0.12 +
                              index *
                                0.055,
                        ease: [
                          0.16,
                          1,
                          0.3,
                          1,
                        ],
                      }}
                      className="
                        group

                        flex
                        items-center

                        border-b
                        border-[#143d2b]/10

                        py-3.5

                        dark:border-white/[0.07]
                      "
                    >
                      <span
                        className="
                          mr-5

                          font-heading

                          text-[11px]
                          italic

                          text-[#9b742f]/45

                          dark:text-[#d4af37]/35
                        "
                        style={{
                          fontFamily:
                            '"Playfair Display", serif',
                        }}
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span
                        className="
                          font-heading

                          text-[clamp(1.35rem,5vw,2rem)]
                          font-normal

                          text-[#143d2b]/80

                          transition-colors
                          duration-300

                          group-hover:text-[#143d2b]

                          dark:text-[#eee5d7]/70
                          dark:group-hover:text-[#eee5d7]
                        "
                        style={{
                          fontFamily:
                            '"Playfair Display", serif',
                        }}
                      >
                        {item.label}
                      </span>

                      <ArrowUpRight
                        className="
                          ml-auto

                          h-4
                          w-4

                          text-[#143d2b]/20

                          transition-all
                          duration-300

                          group-hover:translate-x-1
                          group-hover:-translate-y-1
                          group-hover:text-[#9b742f]

                          dark:text-white/15
                          dark:group-hover:text-[#d4af37]
                        "
                      />
                    </motion.a>
                  )
                )}
              </div>
            </nav>

            {/* ------------------------------------------------------------- */}
            {/* MOBILE AUTH AREA                                              */}
            {/* ------------------------------------------------------------- */}

            <motion.div
              initial={{
                opacity: 0,
                y: shouldReduceMotion
                  ? 0
                  : 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  shouldReduceMotion
                    ? 0
                    : 0.3,
                duration: 0.5,
              }}
              className="
                relative
                z-10

                flex-shrink-0

                border-t
                border-[#143d2b]/10

                px-6
                pb-7
                pt-5

                dark:border-white/[0.08]
              "
            >
              {!authLoading &&
                !profile && (
                  <div
                    className="
                      mx-auto
                      flex
                      w-full
                      max-w-[650px]

                      items-stretch
                      gap-3
                    "
                  >
                    <Link
                      href="/register"
                      onClick={() =>
                        setMobileOpen(
                          false
                        )
                      }
                      className="
                        group

                        flex
                        flex-1

                        items-center
                        justify-center
                        gap-2

                        bg-[#143d2b]

                        px-4
                        py-3.5

                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.2em]

                        text-[#f7f0e6]

                        dark:bg-[#d2b56b]
                        dark:text-[#11130f]
                      "
                    >
                      Book Your Event

                      <ArrowUpRight
                        className="
                          h-3
                          w-3

                          transition-transform

                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </Link>

                    <Link
                      href="/login"
                      onClick={() =>
                        setMobileOpen(
                          false
                        )
                      }
                      className="
                        flex
                        items-center
                        justify-center

                        border
                        border-[#143d2b]/15

                        px-6
                        py-3.5

                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.2em]

                        text-[#143d2b]/65

                        transition-colors

                        hover:border-[#9b742f]/40
                        hover:text-[#143d2b]

                        dark:border-white/10
                        dark:text-[#eee5d7]/55
                        dark:hover:border-[#d4af37]/35
                        dark:hover:text-[#eee5d7]
                      "
                    >
                      Sign In
                    </Link>
                  </div>
                )}

              {!authLoading &&
                profile && (
                  <div
                    className="
                      mx-auto
                      flex
                      w-full
                      max-w-[650px]

                      items-center
                      justify-between

                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          flex-shrink-0

                          items-center
                          justify-center

                          border
                          border-[#143d2b]/15

                          font-heading

                          text-xs

                          text-[#143d2b]

                          dark:border-white/10
                          dark:text-[#eee5d7]
                        "
                      >
                        {profile.full_name?.[0]?.toUpperCase() ??
                          "U"}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            truncate

                            text-[10px]
                            font-semibold

                            text-[#143d2b]/75

                            dark:text-[#eee5d7]/70
                          "
                        >
                          {profile.full_name}
                        </p>

                        <p
                          className="
                            mt-0.5

                            text-[6px]
                            font-bold
                            uppercase
                            tracking-[0.22em]

                            text-[#9b742f]

                            dark:text-[#d4af37]
                          "
                        >
                          {profile.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMobileOpen(
                          false
                        );
                        handleLogout();
                      }}
                      className="
                        flex
                        cursor-pointer

                        items-center
                        gap-2

                        border
                        border-red-800/15

                        px-4
                        py-3

                        text-[7px]
                        font-bold
                        uppercase
                        tracking-[0.18em]

                        text-red-700/60

                        transition-colors

                        hover:bg-red-500/[0.04]
                        hover:text-red-700

                        dark:border-red-300/10
                        dark:text-red-300/50
                        dark:hover:text-red-300
                      "
                    >
                      <LogOut className="h-3 w-3" />

                      Sign Out
                    </button>
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}