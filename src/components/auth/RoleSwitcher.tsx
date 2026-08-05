"use client";

import { UserRole } from "@/lib/types";

interface RoleSwitcherProps {
    value: UserRole;
    onChange: (role: UserRole) => void;
}

export default function RoleSwitcher({ value, onChange }: RoleSwitcherProps) {
    return (
        <div
            className="
        flex p-1
        bg-[#F8F7F4]/80 dark:bg-white/[0.04]
        border border-[#173D2A]/10 dark:border-white/[0.07]
        rounded-xl w-full
        transition-all duration-300
        shadow-[0_1px_3px_rgba(26,25,23,0.05)] dark:shadow-none
      "
        >
            {(["customer", "vendor"] as UserRole[]).map((r) => (
                <button
                    key={r}
                    type="button"
                    onClick={() => onChange(r)}
                    className={`
            flex-1 py-2.5 rounded-lg
            text-[10px] font-bold uppercase tracking-[0.15em]
            transition-all duration-300
            cursor-pointer
            ${value === r
                            ? "bg-gradient-primary text-[#1A1917] dark:text-[#0d0b08] shadow-[0_2px_8px_rgba(200,164,53,0.2)] dark:shadow-[0_2px_8px_rgba(212,175,55,0.18)]"
                            : "text-[#5C5853]/60 dark:text-[#F7F3EC]/40 hover:text-[#1A1917] dark:hover:text-[#F7F3EC]/80"
                        }
          `}
                >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
            ))}
        </div>
    );
}