import fs from "fs";
import path from "path";
import { extractText } from "unpdf";
import mammoth from "mammoth";

export type SupportedResumeType = "pdf" | "docx";

export class ResumeExtractionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ResumeExtractionError";
  }
}

/**
 * Normalizes extracted text:
 * - Replaces CRLF and CR with LF
 * - Replaces tabs and non-breaking spaces with standard space
 * - Collapses multiple consecutive spaces on the same line
 * - Collapses excessive blank lines (more than 2 consecutive newlines)
 * - Trims leading and trailing whitespace
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    .replace(/\r\n|\r/g, "\n")
    .replace(/[\t\f\v]/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n[ ]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Automatically detects the file type based on file extension
 */
export function detectFileType(filePath: string): SupportedResumeType {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return "pdf";
  }
  if (ext === ".docx") {
    return "docx";
  }

  throw new ResumeExtractionError(
    `Unsupported file type "${ext || "unknown"}". Only PDF and DOCX files are supported.`,
    "UNSUPPORTED_FILE_TYPE"
  );
}

/**
 * Extracts plain text from a PDF file using unpdf
 */
export async function extractPdfText(filePath: string): Promise<string> {
  let buffer: Buffer;
  try {
    buffer = await fs.promises.readFile(filePath);
  } catch {
    throw new ResumeExtractionError(
      `Failed to read PDF file at path: ${filePath}`,
      "FILE_READ_ERROR"
    );
  }

  // Validate PDF header signature (%PDF)
  if (buffer.length < 5 || !buffer.subarray(0, 5).toString().includes("%PDF")) {
    throw new ResumeExtractionError(
      "Corrupted or invalid PDF file: Missing valid PDF header signature.",
      "CORRUPTED_PDF"
    );
  }

  try {
    const { text } = await extractText(new Uint8Array(buffer));
    if (Array.isArray(text)) {
      return text.join("\n\n");
    }
    return text || "";
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ResumeExtractionError(
      `Corrupted or invalid PDF file: ${message}`,
      "CORRUPTED_PDF"
    );
  }
}

/**
 * Extracts plain text from a DOCX file using mammoth
 */
export async function extractDocxText(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new ResumeExtractionError(
      `DOCX file not found at path: ${filePath}`,
      "FILE_NOT_FOUND"
    );
  }

  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result?.value ?? "";
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ResumeExtractionError(
      `Corrupted or invalid DOCX file: ${message}`,
      "CORRUPTED_DOCX"
    );
  }
}

/**
 * Main service entrypoint: Extracts, cleans, and normalizes plain text from a resume file.
 *
 * @param filePath - Absolute or relative path to the PDF or DOCX resume
 * @returns Cleaned and normalized plain text content
 * @throws ResumeExtractionError for unsupported, missing, corrupted, or empty files
 */
export async function extractResumeText(filePath: string): Promise<string> {
  if (!filePath) {
    throw new ResumeExtractionError("File path must be provided.", "INVALID_ARGUMENT");
  }

  if (!fs.existsSync(filePath)) {
    throw new ResumeExtractionError(
      `Resume file does not exist at: ${filePath}`,
      "FILE_NOT_FOUND"
    );
  }

  const fileType = detectFileType(filePath);

  let rawText = "";
  if (fileType === "pdf") {
    rawText = await extractPdfText(filePath);
  } else if (fileType === "docx") {
    rawText = await extractDocxText(filePath);
  }

  const normalized = normalizeText(rawText);

  if (!normalized || normalized.length === 0) {
    throw new ResumeExtractionError(
      "Empty document: The uploaded resume contains no readable text content.",
      "EMPTY_DOCUMENT"
    );
  }

  return normalized;
}
