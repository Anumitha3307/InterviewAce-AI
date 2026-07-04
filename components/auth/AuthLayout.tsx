import type { ReactNode } from "react";
import Link from "next/link";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-10">
        <div className="flex flex-1 flex-col justify-between rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30 lg:p-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white">
                AI
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                InterviewAce
              </span>
            </Link>

            <div className="mt-10 max-w-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                AI interview preparation
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Practice like a top candidate.
              </h1>
              <p className="mt-5 text-lg leading-8 text-zinc-400">
                Simulate real conversations, improve your delivery, and receive clear feedback before your next big interview.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              Why teams rely on InterviewAce
            </p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              <li>• Realistic mock interviews tailored to your target role.</li>
              <li>• Resume insights and ATS-aware recommendations.</li>
              <li>• Clear progress tracking that keeps you motivated.</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-0 py-8 lg:px-6 lg:py-0">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
