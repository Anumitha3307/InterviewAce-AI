"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowLeft, Loader2, Video } from "lucide-react";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewLayout } from "@/components/interview/InterviewLayout";
import type { InterviewSessionData, InterviewFeedbackData } from "@/components/interview/types";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function InterviewSessionPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = params ? use(params) : null;
  const clientParams = useParams();
  const sessionId = (resolvedParams?.sessionId || clientParams?.sessionId) as string;

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<
    Record<string, { feedback: InterviewFeedbackData | null; status: "Completed" | "Pending" }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving">("saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // Local storage keys
  const storageKeyAnswers = `interviewace_answers_${sessionId}`;
  const storageKeyIndex = `interviewace_index_${sessionId}`;

  // Fetch session data from API
  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    async function loadSession() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/interview/session?id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Interview session not found or you do not have permission to view it.");
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to load interview session (status: ${res.status}).`);
        }

        const data = await res.json();
        if (!data.session) {
          throw new Error("Invalid session response received.");
        }

        if (isMounted) {
          setSession(data.session);

          // 1. Hydrate answers & evaluations from persisted DB records
          const initialAnswers: Record<string, string> = {};
          const initialEvaluations: Record<
            string,
            { feedback: InterviewFeedbackData | null; status: "Completed" | "Pending" }
          > = {};

          if (data.session.questions && Array.isArray(data.session.questions)) {
            for (const q of data.session.questions) {
              if (q.answers && q.answers.length > 0) {
                const ans = q.answers[0];
                initialAnswers[q.id] = ans.answer;
                initialEvaluations[q.id] = {
                  feedback: ans.feedback || null,
                  status: ans.feedback ? "Completed" : "Pending",
                };
              }
            }
          }

          // 2. Hydrate unsaved local drafts from browser localStorage
          try {
            const savedAnswers = localStorage.getItem(storageKeyAnswers);
            if (savedAnswers) {
              const parsed = JSON.parse(savedAnswers);
              if (parsed && typeof parsed === "object") {
                // Merge local drafts, giving DB answers priority
                for (const [qId, draft] of Object.entries(parsed)) {
                  if (!initialAnswers[qId] && typeof draft === "string") {
                    initialAnswers[qId] = draft;
                  }
                }
              }
            }

            const savedIndex = localStorage.getItem(storageKeyIndex);
            if (savedIndex !== null) {
              const parsedIndex = parseInt(savedIndex, 10);
              if (
                !isNaN(parsedIndex) &&
                parsedIndex >= 0 &&
                parsedIndex < (data.session.questions?.length || 1)
              ) {
                setCurrentIndex(parsedIndex);
              }
            }
          } catch (storageErr) {
            console.warn("Could not restore interview progress from storage:", storageErr);
          }

          setAnswers(initialAnswers);
          setEvaluations(initialEvaluations);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId, storageKeyAnswers, storageKeyIndex]);

  // Handle answer change with local autosave
  const handleAnswerChange = useCallback(
    (questionId: string, answer: string) => {
      // If already submitted, ignore edits
      if (evaluations[questionId]) return;

      setAutosaveStatus("saving");

      setAnswers((prev) => {
        const updated = { ...prev, [questionId]: answer };

        try {
          localStorage.setItem(storageKeyAnswers, JSON.stringify(updated));
        } catch (e) {
          console.warn("Autosave storage write error:", e);
        }

        return updated;
      });

      const timer = setTimeout(() => {
        setAutosaveStatus("saved");
      }, 400);

      return () => clearTimeout(timer);
    },
    [storageKeyAnswers, evaluations]
  );

  // Submit Answer to POST /api/interview/answer (Requirements 8, 9, 10)
  const handleSubmitAnswer = useCallback(async () => {
    if (!session || !session.questions || isSubmitting) return;
    const currentQ = session.questions[currentIndex];
    if (!currentQ) return;

    const answerText = answers[currentQ.id]?.trim();
    if (!answerText) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          answer: answerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit answer.");
      }

      // Update evaluations state
      setEvaluations((prev) => ({
        ...prev,
        [currentQ.id]: {
          feedback: data.feedback,
          status: data.feedbackStatus || (data.feedback ? "Completed" : "Pending"),
        },
      }));

      // Update session status if session is completed
      if (data.sessionStatus) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: data.sessionStatus,
              }
            : null
        );
      }
    } catch (err: unknown) {
      setSubmissionError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }, [session, currentIndex, answers, isSubmitting]);

  // Retry evaluation if pending (Requirement 14)
  const handleRetryEvaluation = useCallback(async () => {
    if (!session || !session.questions || isRetrying) return;
    const currentQ = session.questions[currentIndex];
    if (!currentQ) return;

    const answerText = answers[currentQ.id]?.trim();
    if (!answerText) return;

    setIsRetrying(true);
    setSubmissionError(null);

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          answer: answerText,
          retry: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retry evaluation.");
      }

      setEvaluations((prev) => ({
        ...prev,
        [currentQ.id]: {
          feedback: data.feedback,
          status: data.feedbackStatus || (data.feedback ? "Completed" : "Pending"),
        },
      }));
    } catch (err: unknown) {
      setSubmissionError(err instanceof Error ? err.message : "Retry failed.");
    } finally {
      setIsRetrying(false);
    }
  }, [session, currentIndex, answers, isRetrying]);

  // Question navigation
  const handleSelectQuestion = useCallback(
    (newIndex: number) => {
      if (!session || !session.questions) return;
      if (newIndex >= 0 && newIndex < session.questions.length) {
        setCurrentIndex(newIndex);
        setSubmissionError(null);
        try {
          localStorage.setItem(storageKeyIndex, newIndex.toString());
        } catch (e) {
          console.warn("Could not save index to localStorage:", e);
        }
      }
    },
    [session, storageKeyIndex]
  );

  const handlePrevious = useCallback(() => {
    handleSelectQuestion(currentIndex - 1);
  }, [currentIndex, handleSelectQuestion]);

  const handleNext = useCallback(() => {
    handleSelectQuestion(currentIndex + 1);
  }, [currentIndex, handleSelectQuestion]);

  // Accidental exit warning: only warn if there are unsaved, unsubmitted drafts
  const hasUnsubmittedDraft = Object.entries(answers).some(
    ([qId, ans]) => ans && ans.trim().length > 0 && !evaluations[qId]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsubmittedDraft) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsubmittedDraft]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showExitModal) return;

      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleNext, handlePrevious, showExitModal]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
            <Video className="h-8 w-8 text-blue-400" />
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 animate-spin text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-white">Loading Interview Session</h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-sm">
          Preparing questions, role parameters, and initializing workspace...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error || !session) {
    return (
      <div className="mx-auto max-w-2xl mt-12 rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Unable to Load Interview</h2>
        <p className="mt-2 text-sm text-zinc-300">
          {error || "We couldn't retrieve the details for this interview session."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty Questions State
  if (!session.questions || session.questions.length === 0) {
    return (
      <div className="space-y-6">
        <InterviewHeader
          title={session.title}
          role={session.role}
          company={session.company}
          interviewType={session.interviewType}
          difficulty={session.difficulty}
          startedAt={session.startedAt}
          totalQuestions={0}
          answeredCount={0}
          onExitRequest={() => router.push("/dashboard")}
        />

        <div className="mx-auto max-w-2xl mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center backdrop-blur-sm shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">No Questions Available</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
            Questions could not be generated for this session yet. This may happen if the AI service experienced a temporary hiccup during generation.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Count answered questions (either submitted or typed)
  const answeredCount = session.questions.filter(
    (q) => Boolean(evaluations[q.id]) || Boolean(answers[q.id]?.trim())
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <InterviewHeader
        title={session.title}
        role={session.role}
        company={session.company}
        interviewType={session.interviewType}
        difficulty={session.difficulty}
        startedAt={session.startedAt}
        totalQuestions={session.questions.length}
        answeredCount={answeredCount}
        onExitRequest={() => {
          if (hasUnsubmittedDraft) {
            setShowExitModal(true);
          } else {
            router.push("/dashboard");
          }
        }}
      />

      {/* 2. Main Interview Workspace Layout */}
      <InterviewLayout
        questions={session.questions}
        currentIndex={currentIndex}
        answers={answers}
        evaluations={evaluations}
        autosaveStatus={autosaveStatus}
        isSubmitting={isSubmitting}
        isRetrying={isRetrying}
        submissionError={submissionError}
        onAnswerChange={handleAnswerChange}
        onSubmitAnswer={handleSubmitAnswer}
        onRetryEvaluation={handleRetryEvaluation}
        onSelectQuestion={handleSelectQuestion}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFinish={() => {
          router.push("/dashboard");
        }}
      />

      {/* Exit Confirmation Dialog */}
      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 id="exit-modal-title" className="text-lg font-bold text-white">
                Exit Interview?
              </h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              You have unsubmitted answer drafts. Leaving now will keep your drafts stored in this browser, but returning to your dashboard will pause your live session.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  router.push("/dashboard");
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
