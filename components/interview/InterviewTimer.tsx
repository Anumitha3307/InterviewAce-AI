"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface InterviewTimerProps {
  startedAt?: string | null;
  className?: string;
}

export function InterviewTimer({ startedAt, className = "" }: InterviewTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // If startedAt is provided, calculate difference from that timestamp;
    // otherwise start from 0 and increment locally.
    const initialStart = startedAt ? new Date(startedAt).getTime() : Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - initialStart) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-mono text-zinc-300 shadow-sm ${className}`}
      role="timer"
      aria-live="off"
      aria-label={`Interview elapsed time: ${formattedTime}`}
    >
      <Timer className="h-3.5 w-3.5 text-blue-400 animate-pulse" aria-hidden="true" />
      <span>{formattedTime}</span>
    </div>
  );
}
