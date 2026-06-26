import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background text-foreground px-4 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-surface border border-border rounded-3xl backdrop-blur-md shadow-xl shadow-zinc-500/5 dark:shadow-purple-950/10 flex flex-col items-center">
        <Link href="/" className="text-xl font-bold font-heading tracking-wider text-purple-600 dark:text-purple-400 mb-6 hover:opacity-80 transition">
          SAI EVENTS
        </Link>
        {children}
      </div>
    </main>
  );
}
