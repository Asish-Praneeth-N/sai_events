"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, FileText, Bell, Clock, X, CornerDownLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "event" | "document" | "notification";
  url: string;
}

interface CustomerSearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerSearchPalette({ isOpen, onClose }: CustomerSearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dbData, setDbData] = useState<{
    events: any[];
    documents: any[];
    notifications: any[];
  }>({ events: [], documents: [], notifications: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sai_customer_recent_searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (_) {}
      }
    }
  }, []);

  // Fetch all customer search items on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Events
      const { data: events } = await supabase
        .from("event_requests")
        .select("id, event_type, location, status, event_date")
        .eq("customer_id", user.id);

      // 2. Fetch Documents
      const { data: documents } = await supabase
        .from("documents")
        .select("id, file_name, file_type, file_url, event_id")
        .eq("uploaded_by", user.id);

      // 3. Fetch Notifications
      const { data: notifications } = await supabase
        .from("notifications")
        .select("id, message, created_at")
        .eq("user_id", user.id);

      setDbData({
        events: events || [],
        documents: documents || [],
        notifications: notifications || []
      });
      setLoading(false);
    };

    fetchData();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen, supabase]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Filter logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const cleanQuery = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Filter events
    dbData.events.forEach((ev) => {
      if (
        ev.event_type.toLowerCase().includes(cleanQuery) ||
        ev.location.toLowerCase().includes(cleanQuery) ||
        ev.status.toLowerCase().includes(cleanQuery)
      ) {
        matches.push({
          id: ev.id,
          title: `${ev.event_type} - ${ev.status}`,
          subtitle: `Event Date: ${ev.event_date} · Location: ${ev.location}`,
          type: "event",
          url: `/customer/dashboard?tab=events&eventId=${ev.id}`
        });
      }
    });

    // Filter documents
    dbData.documents.forEach((doc) => {
      if (doc.file_name.toLowerCase().includes(cleanQuery) || doc.file_type.toLowerCase().includes(cleanQuery)) {
        matches.push({
          id: doc.id,
          title: doc.file_name,
          subtitle: `File Type: ${doc.file_type.toUpperCase()} Reference`,
          type: "document",
          url: doc.file_url
        });
      }
    });

    // Filter notifications
    dbData.notifications.forEach((notif) => {
      if (notif.message.toLowerCase().includes(cleanQuery)) {
        matches.push({
          id: notif.id,
          title: notif.message,
          subtitle: `Notification Logged: ${new Date(notif.created_at).toLocaleDateString()}`,
          type: "notification",
          url: "/customer/dashboard?tab=notifications"
        });
      }
    });

    setResults(matches.slice(0, 8));
  }, [query, dbData]);

  const handleSelectResult = (res: SearchResult) => {
    // Add query to recent searches
    if (query.trim()) {
      const updated = [query.trim(), ...recentSearches.filter((s) => s !== query.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("sai_customer_recent_searches", JSON.stringify(updated));
    }

    onClose();
    if (res.type === "document") {
      window.open(res.url, "_blank");
    } else {
      router.push(res.url);
    }
  };

  const handleRecentClick = (text: string) => {
    setQuery(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex justify-center items-start pt-[12vh] px-4">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-[#f8f2e9] border border-[#173d2c]/15 shadow-[0_24px_80px_rgba(70,45,22,0.15)] overflow-hidden animate-scale-in dark:border-white/[0.10] dark:bg-[#171914] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
      >
        {/* Search Input Area */}
        <div className="p-4 border-b border-[#173d2c]/10 flex items-center gap-3 bg-[#f3eadf]/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
          <Search className="w-4 h-4 text-[#a17a34] dark:text-[#d2b56b]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events, documents, activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-[#173d2c] text-sm focus:outline-none placeholder-[#173d2c]/40 font-light dark:text-[#f0e8db] dark:placeholder-[#eee5d7]/35"
          />
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#173d2c]/[0.05] text-[#173d2c]/50 hover:text-[#173d2c] cursor-pointer transition-colors dark:text-white/40 dark:hover:bg-white/[0.05] dark:hover:text-[#f0e8db]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Help Body */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/40 flex flex-col items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-[#a17a34] border-t-transparent animate-spin dark:border-[#d2b56b]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.22em]">Indexing planning workspace...</span>
            </div>
          ) : query.trim() === "" ? (
            // Default Welcome view
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[7.5px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.22em]">Recent Searches</span>
                  <div className="flex flex-col gap-1">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentClick(search)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#173d2c]/[0.035] text-left text-xs text-[#173d2c] cursor-pointer group dark:text-[#f0e8db] dark:hover:bg-white/[0.035]"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#a17a34]/70 group-hover:text-[#a17a34] transition-colors dark:text-[#d2b56b]/70 dark:group-hover:text-[#d2b56b]" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 bg-[#f3eadf]/40 border border-[#173d2c]/10 dark:border-white/[0.06] dark:bg-white/[0.015]">
                <span className="text-[8px] uppercase font-bold text-[#a17a34] tracking-[0.25em] block mb-1 dark:text-[#d2b56b]">Search Studio Shortcuts</span>
                <p className="text-[11px] text-[#173d2c]/60 leading-relaxed font-light dark:text-[#eee5d7]/50">
                  Type name of any service checklist (e.g. Catering, Decor), uploaded reference doc name, status update, or date parameters to retrieve match sets instantly.
                </p>
              </div>
            </div>
          ) : results.length > 0 ? (
            // Results list
            <div className="space-y-1">
              <span className="text-[7.5px] uppercase font-bold text-[#173d2c]/40 dark:text-white/30 tracking-[0.22em] px-2 block mb-2">Search Results ({results.length})</span>
              <div className="space-y-1">
                {results.map((res) => {
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleSelectResult(res)}
                      className="flex items-center justify-between p-3 hover:bg-[#173d2c]/[0.035] border border-transparent hover:border-[#173d2c]/10 cursor-pointer group transition-all duration-150 dark:hover:bg-white/[0.035] dark:hover:border-white/[0.08]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 border border-[#173d2c]/10 bg-[#f3eadf]/70 flex items-center justify-center text-[#a17a34] shrink-0 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#d2b56b]">
                          {res.type === "event" && <Calendar className="w-4 h-4" />}
                          {res.type === "document" && <FileText className="w-4 h-4" />}
                          {res.type === "notification" && <Bell className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[#173d2c] block truncate group-hover:text-[#9a742e] transition-colors dark:text-[#f0e8db] dark:group-hover:text-[#d2b56b]">
                            {res.title}
                          </span>
                          <span className="text-[9.5px] text-[#173d2c]/50 block truncate mt-0.5 font-light dark:text-[#eee5d7]/40">
                            {res.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2 text-[#a17a34] dark:text-[#d2b56b]">
                        <span className="text-[8px] uppercase tracking-wider font-bold">Open</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // No Results
            <div className="py-12 text-center text-xs text-[#173d2c]/50 dark:text-[#eee5d7]/40 font-light">
              No results matching "<span className="font-semibold text-[#173d2c] dark:text-[#f0e8db]">{query}</span>" in your planning studio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
