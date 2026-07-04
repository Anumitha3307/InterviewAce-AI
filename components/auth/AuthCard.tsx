import Link from "next/link";

import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";

export function AuthCard() {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/95 p-8 shadow-2xl shadow-black/40 sm:p-10">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
          Welcome back
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Sign in to InterviewAce
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Continue your interview prep with an AI coach built for modern software roles.
        </p>
      </div>

      <div className="mt-8">
        <SocialLogin />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs uppercase tracking-[0.35em] text-zinc-500">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-zinc-400">
        New to InterviewAce?{" "}
        <Link href="/signup" className="font-semibold text-blue-400 transition-colors hover:text-blue-300">
          Create an account
        </Link>
      </p>
    </div>
  );
}
