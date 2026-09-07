"use client";

import { ChevronLeft, ChevronRight, CheckCheck } from "lucide-react";

interface NavigationControlsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish?: () => void;
  isLastQuestion: boolean;
}

export function NavigationControls({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onFinish,
  isLastQuestion,
}: NavigationControlsProps) {
  const isFirst = currentIndex === 0;

  return (
    <nav
      className="flex items-center justify-between gap-3 pt-2"
      aria-label="Question navigation"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Go to previous question"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>Previous</span>
      </button>

      {/* Center status */}
      <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
        Question {currentIndex + 1} of {totalQuestions}
      </span>

      {/* Next or Finish Button */}
      {isLastQuestion ? (
        <button
          type="button"
          onClick={onFinish || onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-[0.98]"
          aria-label="Review and complete interview"
        >
          <span>Complete Review</span>
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98]"
          aria-label="Go to next question"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
