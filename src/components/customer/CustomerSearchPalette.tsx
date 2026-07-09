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
        className="w-full max-w-2xl bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
      >
        {/* Search Input Area */}
        <div className="p-4 border-b border-border/60 flex items-center gap-3 bg-background/50">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events, documents, activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-foreground text-sm focus:outline-none placeholder-muted-foreground font-light"
          />
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-raised rounded-xl text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Help Body */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
              <span>Indexing planning workspace...</span>
            </div>
          ) : query.trim() === "" ? (
            // Default Welcome view
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Recent Searches</span>
                  <div className="flex flex-col gap-1">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentClick(search)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-surface-raised rounded-xl text-left text-xs text-foreground cursor-pointer group"
                      >
                        <Clock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-gold transition-colors" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 bg-background/30 border border-border/40 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-1">Search Shortcuts</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-light">
                  Type name of any service checklist (e.g. Catering, Decor), uploaded reference doc name, status update, or date parameters to retrieve match sets instantly.
                </p>
              </div>
            </div>
          ) : results.length > 0 ? (
            // Results list
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider px-2 block mb-2">Search Results ({results.length})</span>
              <div className="space-y-1">
                {results.map((res) => {
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleSelectResult(res)}
                      className="flex items-center justify-between p-3 hover:bg-surface-raised border border-transparent hover:border-border/30 rounded-2xl cursor-pointer group transition-all duration-150"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-accent-gold shrink-0">
                          {res.type === "event" && <Calendar className="w-4 h-4" />}
                          {res.type === "document" && <FileText className="w-4 h-4" />}
                          {res.type === "notification" && <Bell className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate group-hover:text-accent-gold transition-colors">
                            {res.title}
                          </span>
                          <span className="text-[9.5px] text-muted-foreground block truncate mt-0.5 font-light">
                            {res.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2 text-muted-foreground">
                        <span className="text-[9px] uppercase tracking-wider">Open</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // No Results
            <div className="py-12 text-center text-xs text-muted-foreground font-light">
              No results matching "<span className="font-semibold text-foreground">{query}</span>" in your planning studio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
