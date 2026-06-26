"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/status-history", label: "Status" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/notifications", label: "Notifications" },
];

export default function AdminSubHeader() {
  const pathname = usePathname();

  return (
    <div className="bg-surface/60 border-b border-border/50 backdrop-blur-xl sticky top-16 z-40 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          {/* Left: Active Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
            </span>
            <span className="text-[10px] font-bold text-muted-foreground hidden sm:block uppercase tracking-wider">
              Admin Console
            </span>
          </div>

          {/* Right: Links */}
          <nav className="flex items-stretch h-full overflow-x-auto no-scrollbar">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center px-3 text-xs font-bold transition-all duration-200 whitespace-nowrap border-b-2 ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400 border-purple-500 bg-purple-500/5"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
