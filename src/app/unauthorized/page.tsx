import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <span className="px-3 py-1 text-xs font-semibold tracking-wider text-red-400 bg-red-950/40 border border-red-800/30 rounded-full mb-6 inline-block">
          ACCESS DENIED
        </span>

        <h1 className="text-4xl font-bold font-heading mb-4 text-zinc-100">
          Unauthorized Access
        </h1>

        <p className="text-zinc-400 font-sans mb-8">
          Your account does not possess the correct role permissions required to view this directory dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 transition text-sm"
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl transition text-sm"
          >
            Log In Again
          </Link>
        </div>
      </div>
    </main>
  );
}
