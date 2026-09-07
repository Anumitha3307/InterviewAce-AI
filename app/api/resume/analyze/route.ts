import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { extractResumeText } from "@/lib/resume/extractText";
import {
  analyzeResumeText,
  saveResumeAnalysis,
  formatResumeAnalysisRecord,
} from "@/lib/resume/analyzeResume";

/**
 * POST /api/resume/analyze
 * Allows re-analysis of an existing uploaded resume
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to analyze a resume." },
        { status: 401 }
      );
    }

    let resumeId: string | null = null;
    try {
      const body = await req.json();
      resumeId = body.resumeId;
    } catch {
      // invalid or empty JSON
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeId" },
        { status: 400 }
      );
    }

    // Verify ownership
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
      include: { analysis: true },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or access denied." },
        { status: 404 }
      );
    }

    // Resolve physical file path
    const localRelPath = resume.fileUrl.replace(/^\//, "");
    const physicalPath = path.join(process.cwd(), "public", localRelPath);

    if (!fs.existsSync(physicalPath)) {
      return NextResponse.json(
        { error: "Stored resume file could not be found on server." },
        { status: 404 }
      );
    }

    // 1. Re-extract text
    const extractedText = await extractResumeText(physicalPath);

    // 2. Run AI Analysis
    const analysisResult = await analyzeResumeText(extractedText);

    // 3. Persist to DB
    const savedRecord = await saveResumeAnalysis(resume.id, analysisResult);

    const formatted = formatResumeAnalysisRecord(savedRecord);

    return NextResponse.json({
      message: "Resume analyzed successfully.",
      atsScore: analysisResult.atsScore,
      analysisStatus: "Analyzed",
      analysis: formatted,
    });
  } catch (error) {
    console.error("Resume re-analysis API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze resume. Please try again later.",
      },
      { status: 500 }
    );
  }
}
