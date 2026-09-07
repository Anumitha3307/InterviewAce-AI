"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";

export type SelectedFileInfo = {
  file: File;
  name: string;
  size: number;
  type: string;
};

export type ResumeDropzoneProps = {
  selectedFile: SelectedFileInfo | null;
  onFileSelect: (fileInfo: SelectedFileInfo | null) => void;
  disabled?: boolean;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ResumeDropzone({
  selectedFile,
  onFileSelect,
  disabled = false,
}: ResumeDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);

    const fileName = file.name.toLowerCase();
    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    const hasValidMime =
      ACCEPTED_MIME_TYPES.includes(file.type) || hasValidExt;

    if (!hasValidExt || !hasValidMime) {
      setErrorMessage("Unsupported format. Please upload a PDF or DOCX file.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 5 MB.`
      );
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect({
        file,
        name: file.name,
        size: file.size,
        type: file.type || (file.name.endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf"),
      });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !selectedFile) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || selectedFile) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input value so the same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setErrorMessage(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Selected File Card */}
      {selectedFile ? (
        <div className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className="uppercase text-[11px] font-medium text-blue-400">
                  {selectedFile.name.endsWith(".pdf") ? "PDF" : "DOCX"}
                </span>
              </div>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove selected file"
              className="ml-3 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            disabled ? "opacity-50 cursor-not-allowed border-zinc-800 bg-zinc-900/30" :
            isDragOver
              ? "border-blue-500 bg-blue-950/20 scale-[0.99]"
              : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-blue-400 shadow-inner mb-4">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="text-base font-semibold text-white">
            Drag &amp; drop your resume here
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            Supported file types: <span className="text-zinc-300 font-medium">PDF, DOCX</span> (Up to 5MB)
          </p>

          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            Browse File
          </button>
        </div>
      )}

      {/* Validation Error */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
