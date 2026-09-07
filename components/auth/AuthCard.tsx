import type { ReactNode } from "react";
import Link from "next/link";

import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";

export type AuthCardProps = {
  tagline?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  showSocial?: boolean;
};

export function AuthCard({
  tagline = "Welcome back",
  title = "Sign in to InterviewAce",
  description = "Continue your interview prep with an AI coach built for modern software roles.",
  children,
  footer,
  showSocial = true,
}: AuthCardProps = {}) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/95 p-8 shadow-2xl shadow-black/40 sm:p-10">
      <div className="text-center">
        {tagline && (
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            {tagline}
          </p>
        )}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {description}
          </p>
        )}
      </div>

      {showSocial && (
        <>
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
        </>
      )}

      {children ?? <LoginForm />}

      {footer ?? (
        <p className="mt-8 text-center text-sm text-zinc-400">
          New to InterviewAce?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}
