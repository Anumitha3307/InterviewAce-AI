"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowLeft, Loader2, Video } from "lucide-react";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { InterviewLayout } from "@/components/interview/InterviewLayout";
import type { InterviewSessionData } from "@/components/interview/types";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving">("saved");
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

          // Restore answers from localStorage
          try {
            const savedAnswers = localStorage.getItem(storageKeyAnswers);
            if (savedAnswers) {
              const parsed = JSON.parse(savedAnswers);
              if (parsed && typeof parsed === "object") {
                setAnswers(parsed);
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

  // Handle answer change with local autosave (Requirement 8)
  const handleAnswerChange = useCallback(
    (questionId: string, answer: string) => {
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

      // Quick timeout to reflect "saved" state
      const timer = setTimeout(() => {
        setAutosaveStatus("saved");
      }, 400);

      return () => clearTimeout(timer);
    },
    [storageKeyAnswers]
  );

  // Handle question index changes and persist position to local storage
  const handleSelectQuestion = useCallback(
    (newIndex: number) => {
      if (!session || !session.questions) return;
      if (newIndex >= 0 && newIndex < session.questions.length) {
        setCurrentIndex(newIndex);
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

  // Prevent leaving page accidentally (Requirement 11)
  const hasAnswersTyped = Object.values(answers).some((ans) => ans && ans.trim().length > 0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnswersTyped) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasAnswersTyped]);

  // Keyboard navigation shortcuts (Requirement 15)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if inside a generic modal or other element
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

  // 1. Loading State (Requirement 12)
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

  // 2. Error State (Requirement 13)
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

  // 3. Empty Questions State (Requirement 14)
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

  const answeredCount = session.questions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
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
          if (hasAnswersTyped) {
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
        autosaveStatus={autosaveStatus}
        onAnswerChange={handleAnswerChange}
        onSelectQuestion={handleSelectQuestion}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFinish={() => {
          // In Phase 6, we do NOT evaluate answers yet.
          // Simply show review or prompt.
          alert(
            `You have answered ${answeredCount} of ${session.questions.length} questions. All answers are saved in local storage. Answer evaluation will be available in Phase 7!`
          );
        }}
      />

      {/* Exit Confirmation Dialog (Requirement 11) */}
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
              You have answers typed for this session. Your responses are autosaved in this browser, but exiting will return you to your dashboard.
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
