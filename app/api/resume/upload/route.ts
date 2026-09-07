import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { extractResumeText, ResumeExtractionError } from "@/lib/resume/extractText";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/octet-stream",
];

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to upload a resume." },
        { status: 401 }
      );
    }

    // 2. Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form submission. Expected multipart/form-data." },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Please select a resume file to upload." },
        { status: 400 }
      );
    }

    const originalName = file.name || "resume";
    const ext = path.extname(originalName).toLowerCase();

    // 3. File extension validation
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Only PDF (.pdf) and DOCX (.docx) files are allowed.",
        },
        { status: 400 }
      );
    }

    // 4. MIME type validation
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Only PDF and DOCX files are allowed.",
        },
        { status: 400 }
      );
    }

    // 5. File size validation (Max 5 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 5 MB." },
        { status: 400 }
      );
    }

    // 6. Ensure destination directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // 7. Generate unique filename to avoid any collision
    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${sanitizedBase}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Collision safety guard
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File collision detected. Please try uploading again." },
        { status: 409 }
      );
    }

    // 8. Write file to local disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    // 9. Extract plain text from the uploaded resume
    let extractedText = "";
    try {
      extractedText = await extractResumeText(filePath);
    } catch (extractionErr) {
      // Remove corrupted/unreadable file from disk
      await fs.promises.unlink(filePath).catch(() => {});

      if (extractionErr instanceof ResumeExtractionError) {
        return NextResponse.json(
          { error: extractionErr.message },
          { status: 400 }
        );
      }

      throw extractionErr;
    }

    // 10. Standardize mime type for database
    const mimeType =
      ext === ".pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const title =
      path.basename(originalName, ext).trim() ||
      (ext === ".pdf" ? "Resume (PDF)" : "Resume (DOCX)");

    // 11. Persist resume record in database
    const resume = await db.resume.create({
      data: {
        userId: session.user.id,
        title,
        fileName: originalName,
        fileUrl: `/uploads/resumes/${uniqueFileName}`,
        fileSize: buffer.length,
        mimeType,
      },
    });

    return NextResponse.json(
      {
        message: "Resume uploaded and text extracted successfully.",
        resume: {
          id: resume.id,
          title: resume.title,
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          fileSize: resume.fileSize,
          mimeType: resume.mimeType,
          createdAt: resume.createdAt.toISOString(),
          status: "Uploaded",
          atsScore: 85, // Placeholder ATS score for UI
        },
        extractedTextLength: extractedText.length,
        extractedText, // Returned in API response
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resume upload API error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume. Please try again later." },
      { status: 500 }
    );
  }
}
