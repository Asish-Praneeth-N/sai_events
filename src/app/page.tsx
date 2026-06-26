export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl text-center flex flex-col items-center py-20">
        {/* Accent Tag */}
        <span className="px-3.5 py-1 text-[11px] font-bold tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/30 rounded-full mb-6 uppercase">
          Sai Events Ecosystem
        </span>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-heading tracking-tight leading-tight md:leading-none text-zinc-900 dark:text-white mb-6">
          Crafting Unforgettable <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Event Experiences
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans mb-8 leading-relaxed">
          The ultimate unified ecosystem connecting customers, top-tier service vendors, and admin coordinators seamlessly in one place.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
          <a
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.01] text-center"
          >
            Access Platform
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 bg-surface hover:bg-surface-raised text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl border border-border hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 text-center"
          >
            Explore Services
          </a>
        </div>

        {/* Platform Pillars */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl">
          <div className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <h3 className="font-heading font-bold text-lg text-purple-600 dark:text-purple-400 mb-2">Customers</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
              Browse pre-priced items, calculate automatic estimated budgets, and track event progress.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <h3 className="font-heading font-bold text-lg text-indigo-600 dark:text-indigo-400 mb-2">Vendors</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
              Receive curated event invitations, manage your categories, and accept bookings.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border hover:border-zinc-400/30 dark:hover:border-zinc-700/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <h3 className="font-heading font-bold text-lg text-zinc-800 dark:text-zinc-300 mb-2">Admins</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
              Centralized dashboard control for categories, vendor onboarding, and routing operations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
