"use client";

import { useState, useRef } from "react";
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { ResumeDropzone, SelectedFileInfo } from "./ResumeDropzone";
import { UploadProgress } from "./UploadProgress";
import { ResumeItem } from "./ResumeList";

export type ResumeUploadCardProps = {
  onUploadSuccess?: (newResume: ResumeItem) => void;
};

export function ResumeUploadCard({ onUploadSuccess }: ResumeUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleAnalyze = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile.file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    // Real upload progress listener
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      xhrRef.current = null;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setSuccessMessage(`"${selectedFile.name}" uploaded successfully!`);
          setProgress(100);

          if (onUploadSuccess && data.resume) {
            onUploadSuccess(data.resume);
          }

          setSelectedFile(null);
        } catch {
          setSuccessMessage(`"${selectedFile.name}" uploaded successfully!`);
          setSelectedFile(null);
        }
      } else {
        let errText = "Upload failed. Please try again.";
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.error) errText = data.error;
        } catch {
          // fallback
        }
        setErrorMessage(errText);
        setProgress(0);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      xhrRef.current = null;
      setErrorMessage("Network error occurred while uploading. Please check your connection.");
      setProgress(0);
    };

    xhr.onabort = () => {
      setIsUploading(false);
      xhrRef.current = null;
      setProgress(0);
    };

    xhr.open("POST", "/api/resume/upload");
    xhr.send(formData);
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setIsUploading(false);
    setProgress(0);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Upload Your Resume
          </h2>
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/20">
            <Sparkles className="h-3 w-3" />
            <span>AI Powered</span>
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Upload your latest resume in PDF or DOCX format (Max 5MB). Our AI will analyze your experience, calculate your ATS match, and suggest improvements.
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <ResumeDropzone
        selectedFile={selectedFile}
        onFileSelect={(file) => {
          setSelectedFile(file);
          setSuccessMessage(null);
          setErrorMessage(null);
        }}
        disabled={isUploading}
      />

      {/* Real Upload Progress */}
      {isUploading && (
        <UploadProgress
          progress={progress}
          statusText={
            progress < 100
              ? `Uploading document (${progress}%)...`
              : "Finalizing upload and saving..."
          }
          onCancel={handleCancel}
        />
      )}

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800/60">
        <div className="text-xs text-zinc-500 text-center sm:text-left">
          <span>Supported: .pdf, .docx • Max file size: 5 MB</span>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || isUploading}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isUploading ? "Uploading..." : "Analyze Resume"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
