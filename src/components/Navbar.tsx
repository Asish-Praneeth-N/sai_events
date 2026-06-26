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
    <header className="w-full bg-surface/80 border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground font-heading">
            Sai Events
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <ThemeToggle />

          {!loading && (
            <>
              {profile ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{profile.full_name}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded uppercase tracking-wider">
                      {profile.role}
                    </span>
                  </div>

                  {profile.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                    >
                      Admin
                    </Link>
                  )}
                  {profile.role === "customer" && (
                    <Link
                      href="/customer/dashboard"
                      className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                  )}
                  {profile.role === "vendor" && (
                    <Link
                      href="/vendor/inbox"
                      className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/");
                      router.refresh();
                    }}
                    className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-sm shadow-purple-500/25 hover:shadow-purple-500/40"
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
