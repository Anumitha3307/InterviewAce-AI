"use client";

import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lightbulb,
  HelpCircle,
  RotateCcw,
  Target,
  MessageSquare,
  Cpu,
  Smile,
  Loader2,
  BookOpen,
} from "lucide-react";
import type { InterviewFeedbackData } from "./types";

interface EvaluationPanelProps {
  feedback: InterviewFeedbackData | null;
  feedbackStatus?: "Completed" | "Pending";
  isRetrying?: boolean;
  onRetry?: () => void;
}

export function EvaluationPanel({
  feedback,
  feedbackStatus = "Completed",
  isRetrying = false,
  onRetry,
}: EvaluationPanelProps) {
  // If evaluation is pending (e.g. OpenAI service was unreachable during submission)
  if (feedbackStatus === "Pending" || !feedback) {
    return (
      <div
        className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 sm:p-6 backdrop-blur-sm shadow-xl"
        role="region"
        aria-label="Pending evaluation notice"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Evaluation Pending
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-300">
                Your response is safely recorded. The AI evaluation could not be completed immediately due to service availability.
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-500 disabled:opacity-50 shrink-0"
              aria-label="Retry AI evaluation for this answer"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Evaluation</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Color mapping based on overall score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getSubScoreBar = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div
      className="space-y-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-sm shadow-xl"
      role="region"
      aria-label="AI Answer Evaluation"
    >
      {/* 1. Header: Overall Score & Sub-scores */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Sparkles className="h-4 w-4" />
            AI Evaluation Breakdown
          </div>
          <h3 className="mt-1 text-lg sm:text-xl font-bold text-white">
            Performance Analysis
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-xl">
            {feedback.overallFeedback}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border px-5 py-3 shadow-inner ${getScoreColor(
              feedback.score
            )}`}
          >
            <span className="text-2xl sm:text-3xl font-black font-mono">
              {feedback.score}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              Overall Score
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-scores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Technical Accuracy */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              Technical
            </span>
            <span className="font-mono font-bold text-white">{feedback.technicalAccuracy}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${getSubScoreBar(feedback.technicalAccuracy)}`}
              style={{ width: `${feedback.technicalAccuracy}%` }}
            />
          </div>
        </div>

        {/* Communication */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
              Communication
            </span>
            <span className="font-mono font-bold text-white">{feedback.communication}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${getSubScoreBar(feedback.communication)}`}
              style={{ width: `${feedback.communication}%` }}
            />
          </div>
        </div>

        {/* Problem Solving */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Target className="h-3.5 w-3.5 text-cyan-400" />
              Problem Solving
            </span>
            <span className="font-mono font-bold text-white">{feedback.problemSolving}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${getSubScoreBar(feedback.problemSolving)}`}
              style={{ width: `${feedback.problemSolving}%` }}
            />
          </div>
        </div>

        {/* Confidence */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Smile className="h-3.5 w-3.5 text-emerald-400" />
              Confidence
            </span>
            <span className="font-mono font-bold text-white">{feedback.confidence}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${getSubScoreBar(feedback.confidence)}`}
              style={{ width: `${feedback.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Strengths & Weaknesses 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
            <CheckCircle2 className="h-4 w-4" />
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {feedback.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
            <AlertCircle className="h-4 w-4" />
            Areas for Refinement
          </h4>
          <ul className="space-y-2">
            {feedback.weaknesses.length > 0 ? (
              feedback.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-400 italic">
                No critical weaknesses detected in this response.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. Missing Concepts Tags */}
      {feedback.missingConcepts && feedback.missingConcepts.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Missing / Overlooked Concepts:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {feedback.missingConcepts.map((concept, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 border border-zinc-700/60"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Improvement Suggestions */}
      {feedback.improvementSuggestions && feedback.improvementSuggestions.length > 0 && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
            <Lightbulb className="h-4 w-4" />
            Actionable Improvement Suggestions
          </h4>
          <ul className="space-y-2">
            {feedback.improvementSuggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                <span className="text-blue-400 font-semibold">{i + 1}.</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Ideal Answer Benchmark */}
      {feedback.idealAnswer && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-5">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            <BookOpen className="h-4 w-4" />
            Model Benchmark Response
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-200 italic bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
            &ldquo;{feedback.idealAnswer}&rdquo;
          </p>
        </div>
      )}

      {/* 7. Follow-up Questions */}
      {feedback.followUpQuestions && feedback.followUpQuestions.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            <HelpCircle className="h-4 w-4 text-purple-400" />
            Anticipated Follow-up Questions
          </h4>
          <ul className="space-y-2">
            {feedback.followUpQuestions.map((fq, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                <span className="text-purple-400 font-bold">•</span>
                <span>{fq}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
