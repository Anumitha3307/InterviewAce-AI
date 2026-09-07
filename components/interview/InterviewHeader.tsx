"use client";

import Link from "next/link";
import { Building2, Briefcase, ChevronLeft, Layers, Zap } from "lucide-react";
import { InterviewTimer } from "./InterviewTimer";
import type { InterviewType, InterviewDifficulty } from "./types";

interface InterviewHeaderProps {
  title: string;
  role: string;
  company?: string | null;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  startedAt?: string | null;
  totalQuestions: number;
  answeredCount: number;
  onExitRequest?: () => void;
}

const typeColorMap: Record<InterviewType, { label: string; badge: string }> = {
  TECHNICAL: {
    label: "Technical",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  HR: {
    label: "HR & Behavioral",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  SYSTEM_DESIGN: {
    label: "System Design",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  },
  BEHAVIORAL: {
    label: "Behavioral",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
};

const difficultyColorMap: Record<InterviewDifficulty, { label: string; badge: string }> = {
  EASY: {
    label: "Easy",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  HARD: {
    label: "Hard",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
};

export function InterviewHeader({
  title,
  role,
  company,
  interviewType,
  difficulty,
  startedAt,
  totalQuestions,
  answeredCount,
  onExitRequest,
}: InterviewHeaderProps) {
  const typeConfig = typeColorMap[interviewType] || {
    label: interviewType,
    badge: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  const difficultyConfig = difficultyColorMap[difficulty] || {
    label: difficulty,
    badge: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Back Link & Title & Metadata */}
        <div className="flex items-start gap-3">
          {onExitRequest ? (
            <button
              type="button"
              onClick={onExitRequest}
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              aria-label="Exit interview"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="truncate text-base sm:text-lg font-semibold text-white tracking-tight">
              {title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{role}</span>
              </span>

              {company && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="truncate max-w-[120px]">{company}</span>
                  </span>
                </>
              )}

              <span className="text-zinc-600">•</span>
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium ${typeConfig.badge}`}
              >
                <Layers className="h-3 w-3" />
                {typeConfig.label}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium ${difficultyConfig.badge}`}
              >
                <Zap className="h-3 w-3" />
                {difficultyConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Timer & Answer Progress */}
        <div className="flex items-center justify-between sm:justify-end gap-3 self-end lg:self-auto w-full lg:w-auto pt-2 lg:pt-0 border-t border-zinc-900 lg:border-none">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500 font-mono">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          <InterviewTimer startedAt={startedAt} />
        </div>
      </div>
    </header>
  );
}
