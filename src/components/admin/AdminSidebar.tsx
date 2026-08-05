"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  GitBranch,
  Store,
  Users,
  BookOpen,
  Image,
  Bell,
  User,
  LogOut,
  Shield,
  Send,
  Briefcase,
  TrendingUp,
  History,
  X,
  UserCheck,
  HelpCircle,
  Video,
  Award,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  onClose?: () => void;
}

export default function AdminSidebar({
  adminName,
  adminEmail,
  onClose,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  /*
   * Routes remain exactly the same.
   * Only visual grouping has been improved.
   */
  const navGroups = [
    {
      group: "Command",
      items: [
        {
          href: "/admin/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: "Event Operations",
      items: [
        {
          href: "/admin/enquiries",
          label: "Guest Enquiries",
          icon: HelpCircle,
        },
        {
          href: "/admin/meetings",
          label: "Meeting Requests",
          icon: Video,
        },
        {
          href: "/admin/bookings",
          label: "Event Cases",
          icon: GitBranch,
        },
        {
          href: "/admin/assignments",
          label: "Event Assignments",
          icon: Shield,
        },
        {
          href: "/admin/vendor-invitations",
          label: "Vendor Invitations",
          icon: Send,
        },
      ],
    },
    {
      group: "People & Partners",
      items: [
        {
          href: "/admin/operational-managers",
          label: "Operations Team",
          icon: Briefcase,
        },
        {
          href: "/admin/vendors",
          label: "Vendors Registry",
          icon: Store,
        },
        {
          href: "/admin/customers",
          label: "Clients Directory",
          icon: Users,
        },
        {
          href: "/admin/users",
          label: "Users Management",
          icon: UserCheck,
        },
      ],
    },
    {
      group: "Experience",
      items: [
        {
          href: "/admin/catalog",
          label: "Service Catalog",
          icon: BookOpen,
        },
        {
          href: "/admin/packages",
          label: "Package Builder",
          icon: Award,
        },
        {
          href: "/admin/event-parts",
          label: "Event Parts Master",
          icon: GitBranch,
        },
        {
          href: "/admin/recommendations",
          label: "Recommendations Master",
          icon: Sparkles,
        },
      ],
    },
    {
      group: "Intelligence",
      items: [
        {
          href: "/admin/reports",
          label: "Analytics & Reports",
          icon: TrendingUp,
        },
        {
          href: "/admin/status-history",
          label: "Audit Trail",
          icon: History,
        },
        {
          href: "/admin/media",
          label: "Media Library",
          icon: Image,
        },
        {
          href: "/admin/notifications",
          label: "Notifications",
          icon: Bell,
        },
      ],
    },
    {
      group: "Account",
      items: [
        {
          href: "/admin/profile",
          label: "Profile",
          icon: User,
        },
      ],
    },
  ];

  return (
    <aside
      className={`
        relative z-30 flex h-full shrink-0 flex-col
        border-r border-border
        bg-surface
        transition-[width] duration-300 ease-out
        select-none

        ${isCollapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* ================================================================
          BRAND
      ================================================================ */}

      <div
        className={`
          relative flex h-[68px] shrink-0
          items-center border-b border-border

          ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}
        `}
      >
        <Link
          href="/admin/dashboard"
          className={`
            group flex min-w-0 items-center
            ${isCollapsed ? "justify-center" : "gap-3"}
          `}
        >
          {/* Brand Mark */}

          <div
            className="
              relative flex h-9 w-9
              shrink-0 items-center justify-center
              border border-accent-gold/30
              bg-accent-gold/[0.06]
              text-accent-gold
              transition-all duration-300

              group-hover:border-accent-gold/60
              group-hover:bg-accent-gold/[0.1]
            "
          >
            <Sparkles className="h-4 w-4" />

            <span
              className="
                absolute -bottom-px -right-px
                h-2 w-2
                border-b border-r
                border-accent-gold
              "
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 animate-fade-in">
              <div className="flex items-center gap-2">
                <span
                  className="
                    whitespace-nowrap
                    text-[13px] font-semibold
                    tracking-[0.13em]
                    text-foreground
                  "
                  style={{
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  SAI EVENTS
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-px w-3 bg-accent-gold/70" />

                <span
                  className="
                    whitespace-nowrap
                    text-[6px] font-bold
                    uppercase tracking-[0.24em]
                    text-accent-gold
                  "
                >
                  Administration
                </span>
              </div>
            </div>
          )}
        </Link>

        {onClose && !isCollapsed && (
          <button
            type="button"
            onClick={onClose}
            className="
              flex h-8 w-8
              items-center justify-center
              text-muted-foreground
              transition-colors

              hover:bg-foreground/[0.04]
              hover:text-foreground

              md:hidden
            "
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ================================================================
          NAVIGATION
      ================================================================ */}

      <nav
        className={`
          flex-1 overflow-y-auto
          overflow-x-hidden
          scrollbar-thin

          ${
            isCollapsed
              ? "px-2 py-4"
              : "px-3 py-5"
          }
        `}
      >
        <div className={isCollapsed ? "space-y-3" : "space-y-6"}>
          {navGroups.map((group, groupIdx) => (
            <div
              key={group.group}
              className="relative"
            >
              {/* Group heading */}

              {!isCollapsed ? (
                <div className="mb-2 flex items-center gap-2 px-2.5">
                  <span
                    className="
                      text-[6px] font-bold
                      uppercase tracking-[0.24em]
                      text-muted-foreground/50
                    "
                  >
                    {group.group}
                  </span>

                  <span className="h-px flex-1 bg-border/60" />
                </div>
              ) : (
                groupIdx > 0 && (
                  <div className="mx-auto mb-3 h-px w-6 bg-border" />
                )
              )}

              {/* Group items */}

              <div className={isCollapsed ? "space-y-1" : "space-y-0.5"}>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      aria-label={isCollapsed ? item.label : undefined}
                      className={`
                        group/item relative flex
                        items-center
                        transition-all duration-200

                        ${
                          isCollapsed
                            ? "h-10 justify-center px-2"
                            : "min-h-10 gap-3 px-3 py-2.5"
                        }

                        ${
                          active
                            ? `
                              bg-accent-gold/[0.055]
                              text-accent-gold
                            `
                            : `
                              text-muted-foreground
                              hover:bg-foreground/[0.025]
                              hover:text-foreground
                            `
                        }
                      `}
                    >
                      {/* Active gold rail */}

                      {active && (
                        <span
                          className="
                            absolute left-0 top-1/2
                            h-5 w-[2px]
                            -translate-y-1/2
                            bg-accent-gold
                          "
                        />
                      )}

                      {/* Icon */}

                      <span
                        className={`
                          flex h-6 w-6
                          shrink-0 items-center
                          justify-center
                          transition-colors

                          ${
                            active
                              ? "text-accent-gold"
                              : "text-muted-foreground group-hover/item:text-foreground"
                          }
                        `}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                      </span>

                      {/* Label */}

                      {!isCollapsed && (
                        <>
                          <span
                            className={`
                              min-w-0 flex-1 truncate
                              text-[10px]
                              tracking-[0.01em]

                              ${
                                active
                                  ? "font-semibold text-accent-gold"
                                  : "font-medium"
                              }
                            `}
                          >
                            {item.label}
                          </span>

                          {active && (
                            <span className="h-1 w-1 shrink-0 rounded-full bg-accent-gold" />
                          )}
                        </>
                      )}

                      {/* Collapsed tooltip */}

                      {isCollapsed && (
                        <div
                          className="
                            pointer-events-none
                            absolute left-[calc(100%+10px)]
                            top-1/2 z-50
                            -translate-y-1/2
                            whitespace-nowrap

                            border border-border
                            bg-surface
                            px-3 py-2

                            text-[9px] font-semibold
                            text-foreground

                            opacity-0 shadow-xl
                            transition-opacity duration-150

                            group-hover/item:opacity-100
                          "
                        >
                          {item.label}

                          <span
                            className="
                              absolute right-full top-1/2
                              h-2 w-2
                              -translate-y-1/2
                              translate-x-1
                              rotate-45

                              border-b border-l
                              border-border
                              bg-surface
                            "
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* ================================================================
          COLLAPSE CONTROL
      ================================================================ */}

      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -right-[13px] top-[82px]
          z-40 hidden
          h-[26px] w-[26px]
          items-center justify-center

          border border-border
          bg-surface
          text-muted-foreground
          shadow-sm

          transition-all duration-200

          hover:border-accent-gold/40
          hover:text-accent-gold

          md:flex
        "
        aria-label={
          isCollapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* ================================================================
          ADMIN PROFILE
      ================================================================ */}

      <div
        className={`
          shrink-0 border-t border-border
          ${isCollapsed ? "p-2" : "p-3"}
        `}
      >
        <Link
          href="/admin/profile"
          title={isCollapsed ? adminName || "Administrator" : undefined}
          className={`
            group/profile relative flex
            items-center transition-colors

            hover:bg-foreground/[0.025]

            ${
              isCollapsed
                ? "justify-center py-2"
                : "gap-3 px-2 py-2.5"
            }
          `}
        >
          <div
            className="
              relative flex h-8 w-8
              shrink-0 items-center
              justify-center

              border border-accent-gold/20
              bg-accent-gold/[0.04]

              text-[9px] font-bold
              uppercase tracking-wide
              text-accent-gold

              transition-colors

              group-hover/profile:border-accent-gold/45
            "
          >
            {adminName
              ? adminName.substring(0, 2)
              : "AD"}

            <span
              className="
                absolute bottom-0 right-0
                h-2 w-2
                rounded-full
                border-2 border-surface
                bg-emerald-500
              "
            />
          </div>

          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <span
                  className="
                    block truncate
                    text-[9px] font-semibold
                    text-foreground
                  "
                >
                  {adminName || "Administrator"}
                </span>

                <span
                  className="
                    mt-0.5 block truncate
                    text-[7px]
                    text-muted-foreground
                  "
                >
                  {adminEmail}
                </span>
              </div>

              <ChevronRight
                className="
                  h-3 w-3
                  shrink-0
                  text-muted-foreground/40
                  transition-transform

                  group-hover/profile:translate-x-0.5
                  group-hover/profile:text-accent-gold
                "
              />
            </>
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`
            group/logout mt-1 flex
            w-full items-center
            text-red-500/80
            transition-all duration-200

            hover:bg-red-500/[0.045]
            hover:text-red-500

            ${
              isCollapsed
                ? "h-9 justify-center"
                : "gap-3 px-3 py-2.5"
            }
          `}
        >
          <LogOut className="h-[14px] w-[14px] shrink-0" />

          {!isCollapsed && (
            <span className="text-[9px] font-semibold">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}