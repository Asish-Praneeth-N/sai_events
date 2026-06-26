"use client";

import { usePathname } from "next/navigation";

interface VendorSubHeaderProps {
  businessName: string | null;
}

const links = [
  {
    href: "/vendor/inbox",
    label: "Leads Inbox",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
  {
    href: "/vendor/bookings",
    label: "Bookings",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/vendor/services",
    label: "Services",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/vendor/profile",
    label: "Profile",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function VendorSubHeader({ businessName }: VendorSubHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="bg-surface/60 border-b border-border/50 backdrop-blur-xl sticky top-16 z-40 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          {/* Left: Business identity */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            {businessName && (
              <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[160px] hidden sm:block uppercase tracking-wider">
                {businessName}
              </span>
            )}
          </div>

          {/* Right: Navigation tabs */}
          <nav className="flex items-stretch h-full overflow-x-auto no-scrollbar">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 text-xs font-bold transition-all duration-200 whitespace-nowrap border-b-2 ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400 border-purple-500 bg-purple-500/5"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <span className={isActive ? "text-purple-600 dark:text-purple-400" : "text-zinc-400 dark:text-zinc-500"}>
                    {link.icon}
                  </span>
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.label.split(" ")[0]}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
