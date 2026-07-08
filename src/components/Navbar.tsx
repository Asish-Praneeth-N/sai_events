"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, [supabase]);

  return (
    <header className="w-full sticky top-0 z-50 px-4 py-3 bg-transparent">
      <div className="max-w-6xl mx-auto bg-surface/75 dark:bg-zinc-950/60 backdrop-blur-xl border border-border/80 rounded-2xl px-5 h-14 flex items-center justify-between shadow-lg shadow-purple-500/[0.015] transition-all duration-300">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/25">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-base font-extrabold tracking-tight text-foreground font-heading">
            Sai Events
          </span>
        </Link>

        {/* Nav Actions */}
        <nav className="flex items-center gap-3 relative">
          <ThemeToggle />

          {!loading && (
            <>
              {profile ? (
                <>
                  {/* Vertical separator */}
                  <div className="w-px h-5 bg-border/80" />

                  {/* Dropdown Menu Trigger */}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all duration-200 cursor-pointer text-left"
                  >
                    {/* User Avatar with gradient background */}
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-purple-500/25">
                      {profile.full_name ? profile.full_name[0].toUpperCase() : "U"}
                    </div>
                    
                    <div className="hidden sm:block">
                      <p className="text-[11px] font-bold text-foreground leading-none">{profile.full_name}</p>
                      <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest block mt-0.5">
                        {profile.role}
                      </span>
                    </div>

                    <svg className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Transparent Click-Away Backdrop */}
                  {isOpen && (
                    <div
                      className="fixed inset-0 z-40 bg-transparent cursor-default"
                      onClick={() => setIsOpen(false)}
                    />
                  )}

                  {/* Dropdown List (Shadcn-Style Overlay) */}
                  {isOpen && (
                    <div className="absolute right-0 top-11 w-56 bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl py-2 z-50 animate-scale-in origin-top-right">
                      {/* User metadata header */}
                      <div className="px-3.5 py-2 border-b border-border/50 mb-1">
                        <p className="text-xs font-bold text-foreground truncate">{profile.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{profile.email}</p>
                      </div>

                      {/* Role portal shortcut */}
                      <div className="px-1.5">
                        {profile.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                          >
                            <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Admin Console
                          </Link>
                        )}
                        {profile.role === "customer" && (
                          <Link
                            href="/customer/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                          >
                            <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Portal
                          </Link>
                        )}
                        {profile.role === "vendor" && (
                          <Link
                            href="/vendor/inbox"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                          >
                            <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                            </svg>
                            Vendor Portal
                          </Link>
                        )}
                      </div>

                      {/* Separator */}
                      <div className="h-px bg-border/50 my-1" />

                      {/* Sign Out link */}
                      <div className="px-1.5">
                        <button
                          onClick={async () => {
                            setIsOpen(false);
                            await supabase.auth.signOut();
                            router.push("/");
                            router.refresh();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-left"
                        >
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
