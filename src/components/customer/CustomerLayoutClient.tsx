"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CustomerSidebar from "./CustomerSidebar";
import CustomerHeader from "./CustomerHeader";
import CustomerSearchPalette from "./CustomerSearchPalette";

interface CustomerLayoutClientProps {
  children: React.ReactNode;
  customerName: string;
  customerEmail: string;
}

export default function CustomerLayoutClient({
  children,
  customerName,
  customerEmail,
}: CustomerLayoutClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard shortcut Ctrl+K listener
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
    <div className="flex h-screen w-full bg-[#f7f0e6] text-[#173d2c] dark:bg-[#191b17] dark:text-[#f0e8db] font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* ── Fixed Desktop Sidebar Container ── */}
      <div className="hidden md:flex flex-shrink-0 h-full select-none z-30">
        <CustomerSidebar
          customerName={customerName}
          customerEmail={customerEmail}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-64 bg-[#f2e9dc] dark:bg-[#141612] z-55 md:hidden animate-scale-in origin-left flex shadow-2xl border-r border-[#173d2c]/10 dark:border-white/[0.08]">
            <CustomerSidebar 
              customerName={customerName} 
              customerEmail={customerEmail} 
              onClose={() => setMobileMenuOpen(false)} 
            />
          </div>
        </>
      )}

      {/* ── Main Work Area ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        
        {/* ── Top Header ── */}
        <CustomerHeader 
          customerName={customerName} 
          onSearchClick={() => setSearchOpen(true)} 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />

        {/* ── Page Content Container with Independent Vertical Scroll ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scrollbar-none px-3 sm:px-6 py-6 md:py-8 max-w-7xl xl:max-w-[1560px] w-full mx-auto animate-fade-in-up">
          {children}
        </main>
      </div>

      {/* ── Global Ctrl+K Search Overlay ── */}
      <CustomerSearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
