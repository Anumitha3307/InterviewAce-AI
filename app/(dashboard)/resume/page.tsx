"use client";

import { useState, useEffect } from "react";
import { ResumeUploadCard } from "@/components/resume/ResumeUploadCard";
import { ResumeList, ResumeItem, ResumeAnalysisData } from "@/components/resume/ResumeList";
import {
  FileCheck,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Tag,
  Briefcase,
  Layers,
  X,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalId, setViewModalId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [modalAnalysis, setModalAnalysis] = useState<ResumeAnalysisData | null>(null);
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadResumes = async () => {
      try {
        const res = await fetch("/api/resume");
        if (res.ok && isMounted) {
          const data = await res.json();
          setResumes(data.resumes || []);
        }
      } catch (err) {
        console.error("Error fetching resumes:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadResumes();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleUploadSuccess = () => {
    // Increment key to trigger resume reload from database
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/resume?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
        if (viewModalId === id) {
          setViewModalId(null);
        }
      } else {
        const data = await res.json();
        console.error("Failed to delete resume:", data.error);
      }
    } catch (err) {
      console.error("Delete resume request failed:", err);
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local resumes list
        setResumes((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  atsScore: data.atsScore,
                  analysisStatus: "Analyzed",
                  summary: data.analysis?.resumeSummary,
                  analysis: data.analysis,
                }
              : r
          )
        );

        if (viewModalId === id && data.analysis) {
          setModalAnalysis(data.analysis);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error("Analysis request failed:", err);
      alert("An error occurred while analyzing the resume.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleView = async (id: string) => {
    setViewModalId(id);
    const item = resumes.find((r) => r.id === id);
    if (item?.analysis) {
      setModalAnalysis(item.analysis);
      return;
    }

    // Fetch full report from API
    setIsFetchingReport(true);
    try {
      const res = await fetch(`/api/resume/report?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.analysisStatus === "Analyzed") {
          const formatted: ResumeAnalysisData = {
            atsScore: data.atsScore,
            technicalSkills: data.technicalSkills,
            softSkills: data.softSkills,
            missingKeywords: data.missingKeywords,
            strengths: data.strengths,
            weaknesses: data.weaknesses,
            improvementSuggestions: data.improvementSuggestions,
            resumeSummary: data.resumeSummary,
            experienceLevel: data.experienceLevel,
            recommendedJobRoles: data.recommendedJobRoles,
          };
          setModalAnalysis(formatted);
          // Also update item in state
          setResumes((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    atsScore: data.atsScore,
                    analysisStatus: "Analyzed",
                    summary: data.resumeSummary,
                    analysis: formatted,
                  }
                : r
            )
          );
        } else {
          setModalAnalysis(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setIsFetchingReport(false);
    }
  };

  const activeResume = resumes.find((r) => r.id === viewModalId);
  const report = modalAnalysis || activeResume?.analysis;

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
          Optimize your resume for applicant tracking systems (ATS) and get tailored AI feedback for software engineering roles.
        </p>
      </div>

      {/* Upload Card */}
      <ResumeUploadCard onUploadSuccess={handleUploadSuccess} />

      {/* Resumes List or Empty State */}
      <ResumeList
        resumes={resumes}
        isLoading={isLoading}
        onDelete={handleDelete}
        onView={handleView}
        onAnalyze={handleAnalyze}
        analyzingId={analyzingId}
      />

      {/* View Report Modal */}
      {viewModalId && activeResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">
                    ATS Evaluation Report: {activeResume.title || activeResume.fileName}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span>File: {activeResume.fileName}</span>
                  <span>•</span>
                  <span>
                    Status:{" "}
                    <span
                      className={
                        activeResume.analysisStatus === "Analyzed"
                          ? "text-emerald-400 font-medium"
                          : "text-amber-400 font-medium"
                      }
                    >
                      {activeResume.analysisStatus || "Pending Analysis"}
                    </span>
                  </span>
                  {report?.experienceLevel && (
                    <>
                      <span>•</span>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-blue-300 font-medium">
                        Level: {report.experienceLevel}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewModalId(null);
                  setModalAnalysis(null);
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            {isFetchingReport ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-sm font-medium text-white">Loading analysis report...</p>
              </div>
            ) : report ? (
              <div className="space-y-6">
                {/* ATS Score Showcase */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                  <div className="flex items-center gap-4 sm:col-span-1">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5">
                      <Award className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 font-medium">ATS Match Score</p>
                      <p className="text-3xl font-black text-emerald-400">
                        {report.atsScore}%
                      </p>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex flex-col justify-center space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">System Readiness Rating</span>
                      <span className="font-semibold text-emerald-400">
                        {report.atsScore >= 80
                          ? "High Compatibility"
                          : report.atsScore >= 65
                          ? "Good Match (Room for Optimization)"
                          : "Needs Improvement"}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, report.atsScore))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Calculated using keyword matching, quantifiable metrics density, and recruiter parsing standards.
                    </p>
                  </div>
                </div>

                {/* Candidate Summary */}
                {report.resumeSummary && (
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Executive Summary</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {report.resumeSummary}
                    </p>
                  </div>
                )}

                {/* Recommended Roles */}
                {report.recommendedJobRoles?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                      <Briefcase className="h-4 w-4 text-blue-400" />
                      <span>Recommended Job Roles</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report.recommendedJobRoles.map((role, idx) => (
                        <span
                          key={idx}
                          className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Technical Skills */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      <span>Technical Skills Identified</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {report.technicalSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 text-[11px] font-medium text-cyan-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Soft Skills */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>Soft Skills &amp; Leadership</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {report.softSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-purple-500/20 bg-purple-950/30 px-2 py-0.5 text-[11px] font-medium text-purple-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Key Strengths</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {report.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>Identified Weaknesses &amp; Gaps</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {report.weaknesses?.map((wk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Missing Keywords */}
                {report.missingKeywords?.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <Tag className="h-4 w-4 text-amber-400" />
                      <span>Missing High-Value Keywords</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Adding these keywords where relevant will help increase candidate ranking in automated recruiter queries:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {report.missingKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-amber-500/30 bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-200"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {report.improvementSuggestions?.length > 0 && (
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-950/10 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                      <span>Actionable Improvement Suggestions</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {report.improvementSuggestions.map((sug, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">→</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              /* Pending Analysis State in Modal */
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-white">
                    Analysis is Pending
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    This resume was uploaded successfully, but has not completed AI evaluation yet.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={analyzingId === activeResume.id}
                  onClick={() => handleAnalyze(activeResume.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {analyzingId === activeResume.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {analyzingId === activeResume.id ? "Analyzing..." : "Generate AI Report Now"}
                  </span>
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
              {report && (
                <button
                  type="button"
                  disabled={analyzingId === activeResume.id}
                  onClick={() => handleAnalyze(activeResume.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      analyzingId === activeResume.id ? "animate-spin" : ""
                    }`}
                  />
                  <span>Re-run Analysis</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setViewModalId(null);
                  setModalAnalysis(null);
                }}
                className="ml-auto rounded-xl bg-zinc-800 px-5 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

