export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 overflow-hidden">
      {/* Dynamic Animated Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: "-3s" }} />

      <div className="relative z-10 max-w-4xl text-center flex flex-col items-center py-20">
        {/* Accent Tag */}
        <span className="animate-scale-in px-3.5 py-1 text-[11px] font-extrabold tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/30 rounded-full mb-6 uppercase">
          Sai Events Ecosystem
        </span>
        
        {/* Title */}
        <h1 className="animate-fade-in-up stagger-1 text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight leading-tight md:leading-none text-zinc-900 dark:text-white mb-6">
          Crafting Unforgettable <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Event Experiences
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up stagger-2 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans mb-8 leading-relaxed">
          The ultimate unified ecosystem connecting customers, top-tier service vendors, and admin coordinators seamlessly in one place.
        </p>

        {/* CTA Actions */}
        <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 items-center mb-16 w-full sm:w-auto">
          <a
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 text-center"
          >
            Access Platform
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 bg-surface/80 dark:bg-zinc-950/40 backdrop-blur-md text-zinc-700 dark:text-zinc-300 font-bold rounded-xl border border-border/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:scale-105 active:scale-95 transition-all duration-300 text-center"
          >
            Explore Services
          </a>
        </div>

        {/* Platform Pillars (Glassmorphism & Staggered Animations) */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl w-full">
          {/* Pillar 1 */}
          <div className="animate-fade-in-up stagger-3 p-6 rounded-3xl bg-surface/75 dark:bg-zinc-950/50 backdrop-blur-xl border border-border/85 hover:border-purple-500/40 dark:hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-xl hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-foreground mb-2">Customers</h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Browse pre-priced items, calculate automatic estimated budgets, and track event progress.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="animate-fade-in-up stagger-4 p-6 rounded-3xl bg-surface/75 dark:bg-zinc-950/50 backdrop-blur-xl border border-border/85 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-300 shadow-md hover:shadow-xl hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-foreground mb-2">Vendors</h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Receive curated event invitations, manage your categories, and accept bookings.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="animate-fade-in-up stagger-5 p-6 rounded-3xl bg-surface/75 dark:bg-zinc-950/50 backdrop-blur-xl border border-border/85 hover:border-zinc-400/40 dark:hover:border-zinc-700/30 transition-all duration-300 shadow-md hover:shadow-xl hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-4 shadow-[0_0_15px_rgba(161,161,170,0.15)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-foreground mb-2">Admins</h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Centralized dashboard control for categories, vendor onboarding, and routing operations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
