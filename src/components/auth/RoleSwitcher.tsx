"use client";

import { UserRole } from "@/lib/types";

interface RoleSwitcherProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSwitcher({ value, onChange }: RoleSwitcherProps) {
  return (
    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-950 border border-border rounded-xl w-full">
      <button
        type="button"
        onClick={() => onChange("customer")}
        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
          value === "customer"
            ? "bg-purple-600 text-white shadow-sm"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`}
      >
        I am a Customer
      </button>
      <button
        type="button"
        onClick={() => onChange("vendor")}
        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
          value === "vendor"
            ? "bg-purple-600 text-white shadow-sm"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`}
      >
        I am a Vendor
      </button>
    </div>
  );
}
