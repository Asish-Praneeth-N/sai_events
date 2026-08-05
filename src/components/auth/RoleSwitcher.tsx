"use client";

import {
  Building2,
  Heart,
} from "lucide-react";

import { UserRole } from "@/lib/types";

interface RoleSwitcherProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const roleContent: Record<
  "customer" | "vendor",
  {
    label: string;
    caption: string;
  }
> = {
  customer: {
    label: "Customer",
    caption: "Planning an event",
  },
  vendor: {
    label: "Vendor",
    caption: "Providing services",
  },
};

export default function RoleSwitcher({
  value,
  onChange,
}: RoleSwitcherProps) {
  const roles = [
    "customer",
    "vendor",
  ] as UserRole[];

  return (
    <div
      className="
        grid w-full
        grid-cols-2
        border border-[#173d2c]/10
        bg-[#173d2c]/[0.015]
        dark:border-white/[0.08]
        dark:bg-white/[0.015]
      "
    >
      {roles.map((role, index) => {
        const active = value === role;

        const Icon =
          role === "customer"
            ? Heart
            : Building2;

        const content =
          roleContent[
            role as "customer" | "vendor"
          ];

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            aria-pressed={active}
            className={`
              group
              relative
              min-w-0
              overflow-hidden

              px-3 py-3

              text-left

              transition-all
              duration-500

              cursor-pointer

              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-[#a17a34]/40
              focus-visible:ring-inset

              ${
                index === 1
                  ? "border-l border-[#173d2c]/10 dark:border-white/[0.08]"
                  : ""
              }

              ${
                active
                  ? `
                    bg-[#143d2b]
                    text-[#fffaf1]
                    dark:bg-[#d2b56b]
                    dark:text-[#161812]
                  `
                  : `
                    text-[#173d2c]
                    hover:bg-[#173d2c]/[0.025]
                    dark:text-[#eee5d7]
                    dark:hover:bg-white/[0.025]
                  `
              }
            `}
          >
            {/* active accent */}

            <span
              className={`
                absolute
                left-0 top-0
                h-[2px]

                transition-all
                duration-500

                ${
                  active
                    ? `
                      w-full
                      bg-[#d2b56b]
                      dark:bg-[#173d2c]/60
                    `
                    : `
                      w-0
                      bg-transparent
                    `
                }
              `}
            />

            <div
              className="
                flex items-center
                gap-3
              "
            >
              <div
                className={`
                  flex h-8 w-8
                  flex-shrink-0
                  items-center justify-center

                  border

                  transition-all
                  duration-500

                  ${
                    active
                      ? `
                        border-white/15
                        bg-white/[0.07]

                        dark:border-[#173d2c]/15
                        dark:bg-[#173d2c]/[0.07]
                      `
                      : `
                        border-[#173d2c]/10
                        bg-transparent

                        dark:border-white/[0.08]
                      `
                  }
                `}
              >
                <Icon
                  className={`
                    h-3.5 w-3.5
                    stroke-[1.5]

                    ${
                      active
                        ? `
                          text-[#d2b56b]
                          dark:text-[#173d2c]
                        `
                        : `
                          text-[#a17a34]
                          dark:text-[#d2b56b]/70
                        `
                    }
                  `}
                />
              </div>

              <div className="min-w-0">
                <span
                  className="
                    block truncate
                    text-[8px] font-bold uppercase
                    tracking-[0.18em]
                    sm:text-[8.5px]
                  "
                >
                  {content.label}
                </span>

                <span
                  className={`
                    mt-0.5
                    hidden truncate
                    text-[6px]
                    font-medium
                    tracking-[0.04em]
                    sm:block

                    ${
                      active
                        ? `
                          text-white/45
                          dark:text-[#173d2c]/50
                        `
                        : `
                          text-[#173d2c]/30
                          dark:text-white/25
                        `
                    }
                  `}
                >
                  {content.caption}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}