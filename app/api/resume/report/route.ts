import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { formatResumeAnalysisRecord } from "@/lib/resume/analyzeResume";

/**
 * GET /api/resume/report?id=<resumeId>
 * Fetches the structured AI analysis report for a specific resume
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view the analysis report." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("id");

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID parameter 'id' is required." },
        { status: 400 }
      );
    }

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

    const analysis = formatResumeAnalysisRecord(resume.analysis);

    return NextResponse.json({
      resumeId: resume.id,
      title: resume.title,
      fileName: resume.fileName,
      uploadStatus: "Uploaded",
      analysisStatus: analysis ? "Analyzed" : "Pending Analysis",
      atsScore: analysis ? analysis.atsScore : null,
      strengths: analysis?.strengths || [],
      weaknesses: analysis?.weaknesses || [],
      missingKeywords: analysis?.missingKeywords || [],
      improvementSuggestions: analysis?.improvementSuggestions || [],
      technicalSkills: analysis?.technicalSkills || [],
      softSkills: analysis?.softSkills || [],
      resumeSummary: analysis?.resumeSummary || "",
      experienceLevel: analysis?.experienceLevel || "Not Analyzed",
      recommendedJobRoles: analysis?.recommendedJobRoles || [],
    });
  } catch (error) {
    console.error("View Report API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume analysis report." },
      { status: 500 }
    );
  }
}
