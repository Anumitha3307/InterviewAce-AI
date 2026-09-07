"use client";

import { useRef, useEffect } from "react";
import { Check, Cloud, Keyboard, Send, Lock, Loader2 } from "lucide-react";

interface AnswerEditorProps {
  value: string;
  onChange: (value: string) => void;
  autosaveStatus: "saved" | "saving";
  questionId: string;
  isSubmitted?: boolean;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onEnterShortcut?: () => void;
}

export function AnswerEditor({
  value,
  onChange,
  autosaveStatus,
  questionId,
  isSubmitted = false,
  isSubmitting = false,
  onSubmit,
  onEnterShortcut,
}: AnswerEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically focus the textarea when moving to a new question (if not submitted)
  useEffect(() => {
    if (!isSubmitted) {
      textareaRef.current?.focus();
    }
  }, [questionId, isSubmitted]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If not submitted, Ctrl + Enter submits or advances
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isSubmitted && onSubmit && value.trim().length > 0 && !isSubmitting) {
        onSubmit();
      } else {
        onEnterShortcut?.();
      }
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <label
            htmlFor={`answer-textarea-${questionId}`}
            className="text-sm font-semibold text-zinc-200"
          >
            Your Response
          </label>

          {isSubmitted && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 border border-zinc-700">
              <Lock className="h-3 w-3" />
              Submitted (Read-Only)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {/* Autosave Status Indicator */}
          {!isSubmitted && (
            <div
              className="inline-flex items-center gap-1.5 font-mono text-zinc-400"
              role="status"
              aria-live="polite"
            >
              {autosaveStatus === "saving" ? (
                <>
                  <Cloud className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                  <span className="text-amber-400/90">Autosaving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-zinc-400">Saved locally</span>
                </>
              )}
            </div>
          )}

          {!isSubmitted && <span className="text-zinc-700">•</span>}

          {/* Word & Character Count */}
          <span className="font-mono">
            {wordCount} word{wordCount === 1 ? "" : "s"} ({charCount} char{charCount === 1 ? "" : "s"})
          </span>
        </div>
      </div>

      <div className="mt-4 relative">
        <textarea
          id={`answer-textarea-${questionId}`}
          ref={textareaRef}
          value={value}
          readOnly={isSubmitted}
          onChange={(e) => {
            if (!isSubmitted) {
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isSubmitted
              ? "Your answer has been submitted."
              : "Type your response here... Speak through your reasoning, state design trade-offs, and outline concrete real-world implementation details."
          }
          className={`min-h-[200px] sm:min-h-[240px] w-full resize-y rounded-xl border p-4 text-sm sm:text-base leading-relaxed transition-colors focus:outline-none ${
            isSubmitted
              ? "border-zinc-800/80 bg-zinc-950/40 text-zinc-300 cursor-default"
              : "border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
          }`}
          aria-label="Interview question answer response"
        />
      </div>

      {/* Action Bar: Keyboard Tip & Submit Button */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/40">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Keyboard className="h-3.5 w-3.5" />
          {!isSubmitted ? (
            <span>
              Tip: Press <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-300">Ctrl</kbd> + <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-300">Enter</kbd> to submit answer.
            </span>
          ) : (
            <span>Answer locked. Review AI evaluation below or proceed to next question.</span>
          )}
        </span>

        {!isSubmitted && onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={value.trim().length === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit answer for AI evaluation"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating Answer...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
