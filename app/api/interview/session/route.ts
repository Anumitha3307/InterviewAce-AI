import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createSessionSchema,
  createInterviewSession,
  getUserInterviewSessions,
  getInterviewSessionById,
  deleteInterviewSession,
  formatQuestionRecord,
  SessionError,
} from "@/lib/interview/session";
import {
  generateInterviewQuestions,
  saveInterviewQuestions,
} from "@/lib/interview/questionGenerator";

const queryIdSchema = z.string().trim().min(1, "Session ID parameter is required");

/**
 * POST /api/interview/session
 * Creates a new interview session for the authenticated user and generates questions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create an interview session." },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const validation = createSessionSchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues.map((i) => i.message);
      return NextResponse.json(
        {
          error: "Validation failed.",
          details: issues,
        },
        { status: 400 }
      );
    }

    // 1. Create Session in Database
    const interviewSession = await createInterviewSession(
      session.user.id,
      validation.data
    );

    // 2. Generate and Store Questions via AI
    let questions: ReturnType<typeof formatQuestionRecord>[] = [];
    let warning: string | undefined = undefined;

    try {
      const generated = await generateInterviewQuestions({
        role: validation.data.role,
        company: validation.data.company,
        interviewType: validation.data.interviewType,
        difficulty: validation.data.difficulty,
        resumeText: validation.data.resumeText,
      });

      const savedRecords = await saveInterviewQuestions(
        interviewSession.id,
        generated
      );

      questions = savedRecords.map(formatQuestionRecord);
    } catch (aiErr) {
      console.warn("AI question generation failed during session creation:", aiErr);
      // Graceful error handling per requirements:
      // Session should still be created.
      // Status remains NOT_STARTED.
      // Questions remain empty.
      // Return warning: "Questions could not be generated."
      warning = "Questions could not be generated.";
      questions = [];
    }

    return NextResponse.json(
      {
        message: warning
          ? "Interview session created, but questions could not be generated."
          : "Interview session and questions created successfully.",
        session: {
          ...interviewSession,
          questions,
        },
        questions,
        ...(warning ? { warning } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating interview session:", error);
    return NextResponse.json(
      { error: "Failed to create interview session." },
      { status: 500 }
    );
  }
}


/**
 * GET /api/interview/session
 * GET /api/interview/session?id=...
 * Retrieves either all interview sessions or a specific one for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view interview sessions." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    // Single session lookup
    if (sessionId) {
      const idValidation = queryIdSchema.safeParse(sessionId);
      if (!idValidation.success) {
        return NextResponse.json(
          { error: idValidation.error.issues[0]?.message || "Invalid session ID." },
          { status: 400 }
        );
      }

      try {
        const interviewSession = await getInterviewSessionById(
          session.user.id,
          idValidation.data
        );
        return NextResponse.json({ session: interviewSession }, { status: 200 });
      } catch (err) {
        if (err instanceof SessionError && err.code === "SESSION_NOT_FOUND") {
          return NextResponse.json(
            { error: "Interview session not found or access denied." },
            { status: 404 }
          );
        }
        throw err;
      }
    }

    // List all sessions for user
    const sessions = await getUserInterviewSessions(session.user.id);
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching interview sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview sessions." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interview/session?id=...
 * Deletes an interview session and cascades all related questions/answers
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to delete an interview session." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");

    const idValidation = queryIdSchema.safeParse(rawId);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: idValidation.error.issues[0]?.message || "Session ID is required." },
        { status: 400 }
      );
    }

    try {
      await deleteInterviewSession(session.user.id, idValidation.data);
      return NextResponse.json(
        { message: "Interview session deleted successfully." },
        { status: 200 }
      );
    } catch (err) {
      if (err instanceof SessionError && err.code === "SESSION_NOT_FOUND") {
        return NextResponse.json(
          { error: "Interview session not found or access denied." },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Error deleting interview session:", error);
    return NextResponse.json(
      { error: "Failed to delete interview session." },
      { status: 500 }
    );
  }
}
