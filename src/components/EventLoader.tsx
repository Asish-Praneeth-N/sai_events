import React from "react";

export default function EventLoader() {
  return (
    <div className="events-loader-container">
      <div className="spinner-3d">
        {/* Page 1: Engagement -> Wedding */}
        <div className="spinner-page">
          <div
            className="page-side page-front"
            style={{ backgroundImage: "url('/images/engagement.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Engagement</span>
          </div>
          <div
            className="page-side page-back"
            style={{ backgroundImage: "url('/images/wedding.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Wedding</span>
          </div>
        </div>

        {/* Page 2: Birthday -> Decor */}
        <div className="spinner-page">
          <div
            className="page-side page-front"
            style={{ backgroundImage: "url('/images/birthday.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Birthday</span>
          </div>
          <div
            className="page-side page-back"
            style={{ backgroundImage: "url('/images/decor.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Decoration</span>
          </div>
        </div>

        {/* Page 3: Catering -> Music */}
        <div className="spinner-page">
          <div
            className="page-side page-front"
            style={{ backgroundImage: "url('/images/catering.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Catering</span>
          </div>
          <div
            className="page-side page-back"
            style={{ backgroundImage: "url('/images/music.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Music & DJ</span>
          </div>
        </div>

        {/* Page 4: Photography -> Corporate */}
        <div className="spinner-page">
          <div
            className="page-side page-front"
            style={{ backgroundImage: "url('/images/photography.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Photography</span>
          </div>
          <div
            className="page-side page-back"
            style={{ backgroundImage: "url('/images/corporate.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Corporate</span>
          </div>
        </div>

        {/* Page 5: Wedding Stage -> Engagement/Memories */}
        <div className="spinner-page">
          <div
            className="page-side page-front"
            style={{ backgroundImage: "url('/images/wedding.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Grand Stage</span>
          </div>
          <div
            className="page-side page-back"
            style={{ backgroundImage: "url('/images/engagement.png')" }}
          >
            <div className="page-overlay" />
            <span className="page-label">Celebrations</span>
          </div>
        </div>
      </div>

      {/* Centered Floating Brand Logo Overlay */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none select-none">
        <div className="px-5 py-3 rounded-2xl bg-black/45 dark:bg-black/65 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(139,92,246,0.35)] flex flex-col items-center gap-1.5 animate-scale-in">
          {/* Glowing mini star-sparkle icon */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-extrabold font-heading text-white tracking-[0.25em] uppercase whitespace-nowrap">
            Sai Events
          </span>
        </div>
      </div>
    </div>
  );
}
