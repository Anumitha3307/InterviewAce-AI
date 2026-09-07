"use client";

import { useState } from "react";
import { ResumeUploadCard } from "@/components/resume/ResumeUploadCard";
import { ResumeList, ResumeItem } from "@/components/resume/ResumeList";
import { FileCheck, Sparkles } from "lucide-react";

const initialMockResumes: ResumeItem[] = [
  {
    id: "res-1",
    title: "Software_Engineer_Resume_2026",
    fileName: "Software_Engineer_Resume_2026.pdf",
    fileSize: 1420000,
    mimeType: "application/pdf",
    createdAt: "2 days ago",
    atsScore: 86,
    status: "analyzed",
  },
  {
    id: "res-2",
    title: "FullStack_Developer_TechLead",
    fileName: "FullStack_Developer_TechLead.docx",
    fileSize: 2150000,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    createdAt: "1 week ago",
    atsScore: 78,
    status: "analyzed",
  },
];

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeItem[]>(initialMockResumes);
  const [viewModalId, setViewModalId] = useState<string | null>(null);

  const handleUploadSuccess = (newResume: ResumeItem) => {
    setResumes((prev) => [newResume, ...prev]);
  };

  const handleDelete = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleView = (id: string) => {
    setViewModalId(id);
  };

  const activeResume = resumes.find((r) => r.id === viewModalId);

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <FileCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Resume Analyzer
          </h1>
        </div>
        <p className="text-sm text-zinc-400">
          Optimize your resume for applicant tracking systems (ATS) and get tailored feedback for software engineering roles.
        </p>
      </div>

      {/* Upload Card */}
      <ResumeUploadCard onUploadSuccess={handleUploadSuccess} />

      {/* Resumes List or Empty State */}
      <ResumeList
        resumes={resumes}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* View Details Modal (Mock Preview) */}
      {viewModalId && activeResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold text-white">
                  Resume Overview: {activeResume.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewModalId(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-zinc-900/60 p-3">
                <span className="text-zinc-400">ATS Match Score</span>
                <span className="font-bold text-emerald-400 text-base">
                  {activeResume.atsScore}%
                </span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-zinc-300">Top Strengths:</p>
                <ul className="list-inside list-disc text-xs text-zinc-400 space-y-1">
                  <li>Strong quantifiable metrics in recent project descriptions</li>
                  <li>Relevant tech stack alignment: React, Next.js, TypeScript, PostgreSQL</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-zinc-300">Key Improvement:</p>
                <p className="text-xs text-zinc-400">
                  Add more details regarding system design and cloud deployments (e.g. AWS, Docker, Kubernetes).
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewModalId(null)}
                className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
