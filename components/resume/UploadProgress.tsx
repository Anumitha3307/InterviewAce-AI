"use client";

import { Loader2, X } from "lucide-react";

export type UploadProgressProps = {
  progress: number;
  statusText?: string;
  onCancel?: () => void;
};

export function UploadProgress({
  progress,
  statusText = "Processing resume...",
  onCancel,
}: UploadProgressProps) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-blue-400 font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{statusText}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">{Math.round(progress)}%</span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel upload"
              className="text-zinc-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
