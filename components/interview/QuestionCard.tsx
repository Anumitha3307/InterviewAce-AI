"use client";

import { Clock, Tag, HelpCircle, CheckCircle2 } from "lucide-react";
import type { Question } from "./types";

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  isAnswered: boolean;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  isAnswered,
}: QuestionCardProps) {
  return (
    <article
      className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 sm:p-6 backdrop-blur-sm shadow-lg shadow-black/20"
      aria-labelledby="current-question-heading"
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span
            id="current-question-heading"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20"
          >
            Question {currentIndex + 1} of {totalQuestions}
          </span>

          {isAnswered ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Answered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <HelpCircle className="h-3.5 w-3.5" />
              Unanswered
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {question.category && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700/60">
              <Tag className="h-3 w-3 text-zinc-400" />
              {question.category}
            </span>
          )}

          {typeof question.estimatedMinutes === "number" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700/60 font-mono">
              <Clock className="h-3 w-3 text-amber-400" />
              ~{question.estimatedMinutes} min{question.estimatedMinutes > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Main Question Text */}
      <div className="mt-5">
        <h2 className="text-lg sm:text-xl font-medium leading-relaxed text-zinc-100">
          {question.question}
        </h2>
      </div>

      {/* Expected Topics (Requirement 9) */}
      {question.expectedTopics && question.expectedTopics.length > 0 && (
        <div className="mt-6 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Target Discussion Points / Expected Topics:
          </p>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Expected topics">
            {question.expectedTopics.map((topic, idx) => (
              <span
                key={idx}
                role="listitem"
                className="inline-flex items-center rounded-md bg-zinc-800/60 px-2 py-1 text-xs text-zinc-300 border border-zinc-700/40"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
