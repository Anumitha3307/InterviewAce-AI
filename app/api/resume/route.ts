import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { formatResumeAnalysisRecord } from "@/lib/resume/analyzeResume";

/**
 * GET /api/resume
 * Fetches all uploaded resumes (or single resume if ?id= is specified) for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view resumes." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get("id");

    if (singleId) {
      const resume = await db.resume.findFirst({
        where: { id: singleId, userId: session.user.id },
        include: { analysis: true },
      });

      if (!resume) {
        return NextResponse.json(
          { error: "Resume not found or access denied." },
          { status: 404 }
        );
      }

      const formattedAnalysis = formatResumeAnalysisRecord(resume.analysis);

      return NextResponse.json({
        resume: {
          id: resume.id,
          title: resume.title,
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          fileSize: resume.fileSize,
          mimeType: resume.mimeType,
          createdAt: resume.createdAt.toISOString(),
          status: "Uploaded",
          uploadStatus: "Uploaded",
          analysisStatus: formattedAnalysis ? "Analyzed" : "Pending Analysis",
          atsScore: formattedAnalysis ? formattedAnalysis.atsScore : null,
          summary: formattedAnalysis ? formattedAnalysis.resumeSummary : null,
          analysis: formattedAnalysis,
        },
      });
    }

    const resumes = await db.resume.findMany({
      where: { userId: session.user.id },
      include: {
        analysis: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = resumes.map((r) => {
      const formattedAnalysis = formatResumeAnalysisRecord(r.analysis);
      return {
        id: r.id,
        title: r.title,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        fileSize: r.fileSize,
        mimeType: r.mimeType,
        createdAt: r.createdAt.toISOString(),
        status: "Uploaded",
        uploadStatus: "Uploaded",
        analysisStatus: formattedAnalysis ? "Analyzed" : "Pending Analysis",
        atsScore: formattedAnalysis ? formattedAnalysis.atsScore : null,
        summary: formattedAnalysis ? formattedAnalysis.resumeSummary : null,
        analysis: formattedAnalysis,
      };
    });

    return NextResponse.json({ resumes: formatted }, { status: 200 });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes from database." },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/resume?id=<id>
 * Deletes a resume record and its stored file
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Resume ID parameter is required." },
        { status: 400 }
      );
    }

    // Verify ownership
    const resume = await db.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or access denied." },
        { status: 404 }
      );
    }

    // Delete record from database
    await db.resume.delete({
      where: { id: resume.id },
    });

    // Remove file from disk if stored locally
    if (resume.fileUrl && resume.fileUrl.startsWith("/uploads/resumes/")) {
      const physicalPath = path.join(
        process.cwd(),
        "public",
        resume.fileUrl.replace(/^\//, "")
      );
      if (fs.existsSync(physicalPath)) {
        try {
          await fs.promises.unlink(physicalPath);
        } catch (unlinkErr) {
          console.warn("Could not delete physical resume file:", unlinkErr);
        }
      }
    }

    return NextResponse.json(
      { message: "Resume deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume." },
      { status: 500 }
    );
  }
}
