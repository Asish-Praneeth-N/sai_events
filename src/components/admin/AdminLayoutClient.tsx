"use client";

import React, { useState, useEffect } from "react";
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
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      
      {/* ── Collapsible Sidebar ── */}
      <AdminSidebar adminName={adminName} adminEmail={adminEmail} />

      {/* ── Main Work Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ── Top Header ── */}
        <AdminHeader adminName={adminName} onSearchClick={() => setSearchOpen(true)} />

        {/* ── Page Content Container ── */}
        <main className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Global Ctrl+K Search Overlay ── */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
