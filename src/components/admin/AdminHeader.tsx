"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Search,
  Bell,
  Plus,
  User,
  LogOut,
  Menu,
  ChevronDown,
  CalendarPlus,
  BookOpen,
  Image as ImageIcon,
  ArrowUpRight,
  Command,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  adminName: string;
  onSearchClick: () => void;
  onMenuClick: () => void;
}

export default function AdminHeader({
  adminName,
  onSearchClick,
  onMenuClick,
}: AdminHeaderProps) {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [quickOpen, setQuickOpen] =
    useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header
      className="
        sticky top-0 z-20
        flex h-[68px]
        items-center justify-between
        border-b border-border
        bg-surface/90
        px-3

        backdrop-blur-xl

        sm:px-5
        lg:px-6
      "
    >
      {/* ================================================================
          LEFT / SEARCH
      ================================================================ */}

      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex h-9 w-9
            shrink-0 items-center
            justify-center

            border border-border
            bg-background/40
            text-muted-foreground

            transition-colors

            hover:border-accent-gold/30
            hover:text-accent-gold

            md:hidden
          "
          aria-label="Open sidebar menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search / Command Trigger */}

        <button
          type="button"
          onClick={onSearchClick}
          className="
            group flex h-9
            w-9 items-center
            justify-center

            border border-border
            bg-background/35
            text-muted-foreground

            transition-all duration-200

            hover:border-accent-gold/30
            hover:bg-accent-gold/[0.025]
            hover:text-foreground

            sm:w-[280px]
            sm:justify-start
            sm:px-3.5
          "
          aria-label="Search"
        >
          <Search
            className="
              h-3.5 w-3.5
              shrink-0
              transition-colors
              group-hover:text-accent-gold
            "
          />

          <span
            className="
              ml-2.5 hidden flex-1
              text-left text-[9px]
              text-muted-foreground
              sm:block
            "
          >
            Search operations...
          </span>

          <div
            className="
              ml-auto hidden
              items-center gap-1
              border-l border-border
              pl-2.5
              sm:flex
            "
          >
            <Command className="h-2.5 w-2.5" />

            <span
              className="
                text-[7px] font-semibold
                text-muted-foreground
              "
            >
              K
            </span>
          </div>
        </button>
      </div>

      {/* ================================================================
          RIGHT ACTIONS
      ================================================================ */}

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* ==============================================================
            CREATE MENU
        ============================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setQuickOpen(!quickOpen);
              setProfileOpen(false);
            }}
            className="
              group flex h-9
              items-center justify-center
              gap-2

              bg-accent-gold
              px-3

              text-[8px] font-bold
              uppercase tracking-[0.14em]
              text-black

              transition-all duration-200

              hover:brightness-105
              active:scale-[0.98]

              sm:px-4
            "
            aria-expanded={quickOpen}
            aria-haspopup="menu"
          >
            <Plus
              className="
                h-3.5 w-3.5
                transition-transform
                group-hover:rotate-90
              "
            />

            <span className="hidden sm:inline">
              Create
            </span>

            <ChevronDown
              className={`
                hidden h-3 w-3
                transition-transform duration-200
                sm:block

                ${quickOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {quickOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setQuickOpen(false)}
              />

              <div
                className="
                  absolute right-0 top-full
                  z-50 mt-2
                  w-[230px]

                  border border-border
                  bg-surface
                  shadow-2xl

                  animate-fade-in
                "
              >
                {/* Header */}

                <div className="border-b border-border px-4 py-3">
                  <span
                    className="
                      text-[6px] font-bold
                      uppercase tracking-[0.23em]
                      text-accent-gold
                    "
                  >
                    Quick Create
                  </span>

                  <p className="mt-1 text-[8px] text-muted-foreground">
                    Start a new administrative action
                  </p>
                </div>

                {/* Options */}

                <div className="p-1.5">
                  <QuickAction
                    href="/admin/bookings"
                    icon={<CalendarPlus />}
                    title="New Booking"
                    description="Open event cases"
                    onClick={() =>
                      setQuickOpen(false)
                    }
                  />

                  <QuickAction
                    href="/admin/catalog"
                    icon={<BookOpen />}
                    title="New Category"
                    description="Manage service catalog"
                    onClick={() =>
                      setQuickOpen(false)
                    }
                  />

                  <QuickAction
                    href="/admin/media"
                    icon={<ImageIcon />}
                    title="Upload Media"
                    description="Open media library"
                    onClick={() =>
                      setQuickOpen(false)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==============================================================
            NOTIFICATIONS
        ============================================================== */}

        <Link
          href="/admin/notifications"
          className="
            group relative flex
            h-9 w-9
            items-center justify-center

            border border-border
            bg-background/30
            text-muted-foreground

            transition-all duration-200

            hover:border-accent-gold/30
            hover:bg-accent-gold/[0.025]
            hover:text-accent-gold
          "
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />

          <span
            className="
              absolute right-[7px] top-[7px]
              h-[5px] w-[5px]
              rounded-full
              bg-accent-gold
              ring-2 ring-surface
            "
          />
        </Link>

        {/* ==============================================================
            THEME TOGGLE
        ============================================================== */}

        <div className="flex h-9 items-center justify-center">
          <ThemeToggle />
        </div>

        {/* ==============================================================
            PROFILE
        ============================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setQuickOpen(false);
            }}
            className="
              group flex h-9
              items-center gap-2

              border border-border
              bg-background/30

              px-1.5
              transition-all duration-200

              hover:border-accent-gold/35
              hover:bg-accent-gold/[0.02]
            "
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span
              className="
                flex h-6 w-6
                items-center justify-center

                border border-accent-gold/20
                bg-accent-gold/[0.05]

                text-[7px] font-bold
                uppercase
                text-accent-gold
              "
            >
              {adminName
                ? adminName.substring(0, 2)
                : "AD"}
            </span>

            <div className="hidden max-w-[110px] text-left lg:block">
              <span
                className="
                  block truncate
                  text-[8px] font-semibold
                  text-foreground
                "
              >
                {adminName || "Admin"}
              </span>

              <span
                className="
                  mt-0.5 block
                  text-[6px] font-bold
                  uppercase tracking-[0.14em]
                  text-muted-foreground
                "
              >
                Controller
              </span>
            </div>

            <ChevronDown
              className={`
                hidden h-3 w-3
                text-muted-foreground
                transition-transform
                lg:block

                ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() =>
                  setProfileOpen(false)
                }
              />

              <div
                className="
                  absolute right-0 top-full
                  z-50 mt-2
                  w-[230px]

                  border border-border
                  bg-surface
                  shadow-2xl

                  animate-fade-in
                "
              >
                {/* Identity */}

                <div
                  className="
                    relative overflow-hidden
                    border-b border-border
                    px-4 py-4
                  "
                >
                  <span
                    className="
                      absolute left-0 top-0
                      h-full w-[2px]
                      bg-accent-gold
                    "
                  />

                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-9 w-9
                        shrink-0 items-center
                        justify-center

                        border border-accent-gold/20
                        bg-accent-gold/[0.05]

                        text-[9px] font-bold
                        uppercase
                        text-accent-gold
                      "
                    >
                      {adminName
                        ? adminName.substring(0, 2)
                        : "AD"}
                    </div>

                    <div className="min-w-0">
                      <span
                        className="
                          block truncate
                          text-[10px]
                          font-semibold
                          text-foreground
                        "
                      >
                        {adminName ||
                          "Admin User"}
                      </span>

                      <span
                        className="
                          mt-0.5 block
                          text-[6px] font-bold
                          uppercase tracking-[0.16em]
                          text-accent-gold
                        "
                      >
                        Platform Controller
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}

                <div className="p-1.5">
                  <Link
                    href="/admin/profile"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      group flex
                      items-center gap-3
                      px-3 py-2.5

                      text-foreground
                      transition-colors

                      hover:bg-accent-gold/[0.035]
                    "
                  >
                    <span
                      className="
                        flex h-7 w-7
                        items-center justify-center
                        text-muted-foreground
                        transition-colors
                        group-hover:text-accent-gold
                      "
                    >
                      <User className="h-3.5 w-3.5" />
                    </span>

                    <span
                      className="
                        flex-1 text-[9px]
                        font-semibold
                      "
                    >
                      My Profile
                    </span>

                    <ArrowUpRight
                      className="
                        h-3 w-3
                        text-muted-foreground/40
                        transition-colors
                        group-hover:text-accent-gold
                      "
                    />
                  </Link>

                  <div className="my-1 h-px bg-border" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      group flex w-full
                      items-center gap-3
                      px-3 py-2.5

                      text-left text-red-500
                      transition-colors

                      hover:bg-red-500/[0.04]
                    "
                  >
                    <span
                      className="
                        flex h-7 w-7
                        items-center justify-center
                      "
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </span>

                    <span
                      className="
                        flex-1 text-[9px]
                        font-semibold
                      "
                    >
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   QUICK ACTION
============================================================================ */

function QuickAction({
  href,
  icon,
  title,
  description,
  onClick,
}: {
  href: string;
  icon: React.ReactElement;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group flex
        items-center gap-3
        px-3 py-2.5

        transition-colors duration-200

        hover:bg-accent-gold/[0.035]
      "
    >
      <span
        className="
          flex h-8 w-8
          shrink-0 items-center
          justify-center

          border border-border
          bg-background/30
          text-muted-foreground

          transition-all

          group-hover:border-accent-gold/25
          group-hover:text-accent-gold

          [&>svg]:h-3.5
          [&>svg]:w-3.5
        "
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <span
          className="
            block text-[9px]
            font-semibold
            text-foreground
          "
        >
          {title}
        </span>

        <span
          className="
            mt-0.5 block
            text-[7px]
            text-muted-foreground
          "
        >
          {description}
        </span>
      </div>

      <ArrowUpRight
        className="
          h-3 w-3
          text-muted-foreground/30
          transition-all

          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-accent-gold
        "
      />
    </Link>
  );
}