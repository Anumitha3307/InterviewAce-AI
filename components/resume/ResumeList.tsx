"use client";

import { FileText, Award, Calendar, Trash2, Eye, FileQuestion } from "lucide-react";
import { formatFileSize } from "./ResumeDropzone";

export type ResumeItem = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  atsScore?: number;
  status: "analyzed" | "processing";
};

export type ResumeListProps = {
  resumes: ResumeItem[];
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
};

export function ResumeList({ resumes, onDelete, onView }: ResumeListProps) {
  if (resumes.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-800/80 text-zinc-500 mb-4">
          <FileQuestion className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-white">
          No resumes uploaded yet
        </h3>
        <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
          Upload your resume above to get instant ATS feedback, keyword gap analysis, and tailored interview recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          Your Resumes ({resumes.length})
        </h3>
        <span className="text-xs text-zinc-400">Manage &amp; view reports</span>
      </div>

      <div className="space-y-3">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h4 className="text-sm font-semibold text-white truncate">
                  {resume.title || resume.fileName}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span>{formatFileSize(resume.fileSize)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    {resume.createdAt}
                  </span>
                  <span className="uppercase text-[10px] rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                    {resume.fileName.endsWith(".pdf") ? "PDF" : "DOCX"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-zinc-800/60 sm:border-0">
              {resume.atsScore !== undefined ? (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <Award className="h-3.5 w-3.5" />
                  <span>ATS: {resume.atsScore}%</span>
                </div>
              ) : (
                <span className="rounded-full border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-xs font-medium text-amber-400">
                  Processing
                </span>
              )}

              <div className="flex items-center gap-1">
                {onView && (
                  <button
                    type="button"
                    onClick={() => onView(resume.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(resume.id)}
                    aria-label="Delete resume"
                    className="rounded-xl p-2 text-zinc-400 hover:bg-red-950/40 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
