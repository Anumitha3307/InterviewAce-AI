import Link from "next/link";
import { Sparkles, ArrowRight, Target } from "lucide-react";

export type WelcomeBannerProps = {
  userName?: string | null;
};

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const displayName = userName ? userName.split(" ")[0] : "Candidate";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-zinc-900/80 p-6 sm:p-8 shadow-xl">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>AI Copilot Active</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {displayName}!
          </h1>

          <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
            You are making strong progress towards your interview goals. Resume readiness is at{" "}
            <span className="font-semibold text-white">84%</span> and you have 3 practice topics recommended for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/interview"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.99]"
          >
            <Target className="h-4 w-4" />
            <span>Start Mock Interview</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/resume"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            Review Resume
          </Link>
        </div>
      </div>
    </div>
  );
}
