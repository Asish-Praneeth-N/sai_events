"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import CommandPalette from "./CommandPalette";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}

export default function AdminLayoutClient({
  children,
  adminName,
  adminEmail,
}: AdminLayoutClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex flex-shrink-0">
        <AdminSidebar adminName={adminName} adminEmail={adminEmail} />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-64 bg-surface z-55 md:hidden animate-scale-in origin-left flex shadow-2xl">
            <AdminSidebar
              adminName={adminName}
              adminEmail={adminEmail}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* ── Main Work Area ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">

        {/* ── Top Header ── */}
        <AdminHeader
          adminName={adminName}
          onSearchClick={() => setSearchOpen(true)}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* ── Page Content Container ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Global Ctrl+K Search Overlay ── */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
