"use client";

import { Check, Circle, ListOrdered, X } from "lucide-react";
import type { Question } from "./types";

interface ProgressSidebarProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  onSelectQuestion: (index: number) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function ProgressSidebar({
  questions,
  currentIndex,
  answers,
  onSelectQuestion,
  isOpenMobile,
  onCloseMobile,
}: ProgressSidebarProps) {
  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  ).length;
  const progressPercent =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  const content = (
    <div className="flex h-full flex-col">
      {/* Sidebar Top / Progress Header */}
      <div className="border-b border-zinc-800/80 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <ListOrdered className="h-4 w-4 text-blue-400" />
            Interview Progress
          </h3>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label="Close questions sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-zinc-400 mb-1 font-mono">
            <span>{answeredCount}/{questions.length} answered</span>
            <span>{progressPercent}%</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Interview answer progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <nav
        className="flex-1 overflow-y-auto p-3 space-y-1.5"
        aria-label="Interview questions list"
      >
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answers[q.id]?.trim());

          let itemClass = "border-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200";
          if (isCurrent) {
            itemClass = "border-blue-500/50 bg-blue-500/10 text-white font-medium shadow-sm";
          } else if (isAnswered) {
            itemClass = "border-emerald-500/30 bg-emerald-500/5 text-zinc-300";
          }

          return (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => {
                onSelectQuestion(idx);
                onCloseMobile();
              }}
              aria-current={isCurrent ? "true" : undefined}
              aria-label={`Question ${idx + 1}: ${isAnswered ? "Answered" : "Unanswered"}. ${q.question.slice(0, 40)}...`}
              className={`w-full text-left rounded-xl border p-2.5 transition-all text-xs flex items-start gap-2.5 ${itemClass}`}
            >
              {/* Indicator Icon / Number */}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : isAnswered
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {isAnswered ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Question preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-zinc-300">
                    Q{idx + 1}
                  </span>
                  {q.category && (
                    <span className="truncate text-[10px] text-zinc-500 max-w-[90px]">
                      {q.category}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                  {q.question}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Legend at bottom */}
      <div className="border-t border-zinc-800/80 p-3 text-[11px] text-zinc-500 flex items-center justify-around">
        <span className="flex items-center gap-1.5">
          <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-400" />
          Answered
        </span>
        <span className="flex items-center gap-1.5">
          <Circle className="h-2.5 w-2.5 text-zinc-600" />
          Pending
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed / Column) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm overflow-hidden h-[calc(100vh-140px)] sticky top-20 shadow-lg shadow-black/20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl z-10 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
