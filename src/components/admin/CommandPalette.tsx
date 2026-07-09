"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, GitBranch, Store, Users, BookOpen, X, Loader } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Results structures
  const [bookings, setBookings] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setBookings([]);
      setVendors([]);
      setCategories([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setBookings([]);
      setVendors([]);
      setCategories([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // 1. Search Bookings
        const { data: bookingsData } = await supabase
          .from("event_requests")
          .select("id, event_type, status")
          .ilike("event_type", `%${query}%`)
          .limit(4);
        
        // 2. Search Vendors (role = 'vendor')
        const { data: vendorsData } = await supabase
          .from("profiles")
          .select("id, full_name, business_name")
          .eq("role", "vendor")
          .or(`full_name.ilike.%${query}%,business_name.ilike.%${query}%`)
          .limit(4);

        // 3. Search Categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name")
          .ilike("name", `%${query}%`)
          .limit(4);

        setBookings(bookingsData || []);
        setVendors(vendorsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, supabase]);

  if (!isOpen) return null;

  const navigateTo = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div 
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-start justify-center pt-24 px-4"
    >
      <div className="bg-[#0d0b08] border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bookings, vendors, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-xs focus:outline-none"
          />
          {loading ? (
            <Loader className="w-4 h-4 text-accent-gold animate-spin" />
          ) : (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results grid */}
        <div className="max-h-96 overflow-y-auto p-3.5 space-y-4">
          
          {/* Static Commands */}
          {!query && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase font-bold tracking-[0.22em] text-muted-foreground px-2">Quick Navigation</h4>
              <div className="space-y-1">
                {[
                  { label: "Go to Dashboard", href: "/admin/dashboard", icon: GitBranch },
                  { label: "Configure Catalog Settings", href: "/admin/catalog", icon: BookOpen },
                  { label: "Lookup Vendors Registry", href: "/admin/vendors", icon: Store },
                  { label: "View Clients Log", href: "/admin/customers", icon: Users }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateTo(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all text-left cursor-pointer"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && bookings.length === 0 && vendors.length === 0 && categories.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No matches found for &quot;{query}&quot;
            </div>
          )}

          {/* Bookings Match */}
          {bookings.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase font-bold tracking-[0.22em] text-muted-foreground px-2">Bookings</h4>
              <div className="space-y-1">
                {bookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigateTo(`/admin/bookings/${b.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-surface-raised transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GitBranch className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold" />
                      <span className="text-foreground truncate">{b.event_type}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border border-border">
                      {b.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vendors Match */}
          {vendors.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase font-bold tracking-[0.22em] text-muted-foreground px-2">Vendors</h4>
              <div className="space-y-1">
                {vendors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => navigateTo(`/admin/vendors/${v.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-surface-raised transition text-left cursor-pointer group"
                  >
                    <Store className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold" />
                    <div className="min-w-0">
                      <div className="text-foreground truncate">{v.business_name || v.full_name}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Owner: {v.full_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories Match */}
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase font-bold tracking-[0.22em] text-muted-foreground px-2">Categories</h4>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigateTo(`/admin/catalog`)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-surface-raised transition text-left cursor-pointer group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold" />
                    <span className="text-foreground">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
