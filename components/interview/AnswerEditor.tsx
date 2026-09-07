"use client";

import { useRef, useEffect } from "react";
import { Check, Cloud, Keyboard } from "lucide-react";

interface AnswerEditorProps {
  value: string;
  onChange: (value: string) => void;
  autosaveStatus: "saved" | "saving";
  questionId: string;
  onEnterShortcut?: () => void;
}

export function AnswerEditor({
  value,
  onChange,
  autosaveStatus,
  questionId,
  onEnterShortcut,
}: AnswerEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically focus the textarea when moving to a new question
  useEffect(() => {
    textareaRef.current?.focus();
  }, [questionId]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Enter or Cmd + Enter shortcut to trigger next / advance
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onEnterShortcut?.();
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
        <label
          htmlFor={`answer-textarea-${questionId}`}
          className="text-sm font-semibold text-zinc-200"
        >
          Your Response
        </label>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {/* Autosave Status Indicator */}
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

          <span className="text-zinc-700">•</span>

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
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response here... Speak through your reasoning, state design trade-offs, and outline concrete real-world implementation details."
          className="min-h-[240px] sm:min-h-[280px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm sm:text-base leading-relaxed text-zinc-100 placeholder-zinc-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          aria-label="Interview question answer response"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5" />
          Tip: Press <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-300">Ctrl</kbd> + <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-300">Enter</kbd> to jump to the next question.
        </span>

        <span className="hidden sm:inline">Answers are preserved automatically in browser storage.</span>
      </div>
    </div>
  );
}
