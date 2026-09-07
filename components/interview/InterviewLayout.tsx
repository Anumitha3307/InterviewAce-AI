"use client";

import { useState } from "react";
import { ListOrdered, AlertCircle } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { AnswerEditor } from "./AnswerEditor";
import { EvaluationPanel } from "./EvaluationPanel";
import { NavigationControls } from "./NavigationControls";
import { ProgressSidebar } from "./ProgressSidebar";
import type { Question, InterviewFeedbackData } from "./types";

interface InterviewLayoutProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  evaluations: Record<string, { feedback: InterviewFeedbackData | null; status: "Completed" | "Pending" }>;
  autosaveStatus: "saved" | "saving";
  isSubmitting?: boolean;
  isRetrying?: boolean;
  submissionError?: string | null;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmitAnswer: () => void;
  onRetryEvaluation: () => void;
  onSelectQuestion: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFinish?: () => void;
}

export function InterviewLayout({
  questions,
  currentIndex,
  answers,
  evaluations,
  autosaveStatus,
  isSubmitting = false,
  isRetrying = false,
  submissionError,
  onAnswerChange,
  onSubmitAnswer,
  onRetryEvaluation,
  onSelectQuestion,
  onPrevious,
  onNext,
  onFinish,
}: InterviewLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return null;
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestion.id] || "";
  const currentEvaluation = evaluations[currentQuestion.id];
  const isSubmitted = Boolean(currentEvaluation);
  const isAnswered = isSubmitted || Boolean(currentAnswer.trim());

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Question & Answer Column */}
      <section
        className="flex-1 w-full space-y-6 min-w-0"
        aria-label="Current interview question"
      >
        {/* Mobile Quick Bar: Toggle questions drawer & question index */}
        <div className="flex lg:hidden items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <span className="text-xs font-medium text-zinc-400">
            Question <strong className="text-white">{currentIndex + 1}</strong> of{" "}
            {questions.length}
          </span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white"
            aria-label="Open questions list drawer"
          >
            <ListOrdered className="h-3.5 w-3.5 text-blue-400" />
            <span>Questions List</span>
          </button>
        </div>

        {/* 1. Question Card */}
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          isAnswered={isAnswered}
        />

        {/* Submission Error Banner */}
        {submissionError && (
          <div
            className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs sm:text-sm text-rose-300"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* 2. Answer Editor */}
        <AnswerEditor
          value={currentAnswer}
          onChange={(val) => onAnswerChange(currentQuestion.id, val)}
          autosaveStatus={autosaveStatus}
          questionId={currentQuestion.id}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
          onSubmit={onSubmitAnswer}
          onEnterShortcut={isLastQuestion ? onFinish : onNext}
        />

        {/* 3. Evaluation Panel (Requirement 9 & 14) */}
        {isSubmitted && (
          <EvaluationPanel
            feedback={currentEvaluation.feedback}
            feedbackStatus={currentEvaluation.status}
            isRetrying={isRetrying}
            onRetry={onRetryEvaluation}
          />
        )}

        {/* 4. Navigation Controls */}
        <NavigationControls
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onPrevious={onPrevious}
          onNext={onNext}
          onFinish={onFinish}
          isLastQuestion={isLastQuestion}
        />
      </section>

      {/* Progress Sidebar (Desktop fixed column / Mobile drawer) */}
      <ProgressSidebar
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        onSelectQuestion={onSelectQuestion}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
    </div>
  );
}
