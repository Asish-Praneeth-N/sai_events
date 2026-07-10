"use client";

import { UserRole } from "@/lib/types";

interface RoleSwitcherProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSwitcher({ value, onChange }: RoleSwitcherProps) {
  return (
    <div className="flex p-1 bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl w-full transition-all duration-300">
      <button
        type="button"
        onClick={() => onChange("customer")}
        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-250 cursor-pointer ${
          value === "customer"
            ? "bg-gradient-primary text-white dark:text-black shadow-md shadow-accent-gold/15 dark:shadow-accent-gold/20"
            : "text-muted-foreground/60 dark:text-[#F7F3EC]/45 hover:text-foreground dark:hover:text-[#F7F3EC]/80"
        }`}
      >
        Customer
      </button>
      <button
        type="button"
        onClick={() => onChange("vendor")}
        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-250 cursor-pointer ${
          value === "vendor"
            ? "bg-gradient-primary text-white dark:text-black shadow-md shadow-accent-gold/15 dark:shadow-accent-gold/20"
            : "text-muted-foreground/60 dark:text-[#F7F3EC]/45 hover:text-foreground dark:hover:text-[#F7F3EC]/80"
        }`}
      >
        Vendor
      </button>
    </div>
  );
}
