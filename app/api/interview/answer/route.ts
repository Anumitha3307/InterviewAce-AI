import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  submitAndEvaluateAnswer,
  EvaluationError,
} from "@/lib/interview/evaluateAnswer";

const submitAnswerRequestSchema = z.object({
  questionId: z.string().trim().min(1, "Question ID is required"),
  answer: z.string().trim().min(1, "Answer cannot be empty"),
  retry: z.boolean().optional(),
});

/**
 * POST /api/interview/answer
 * Submits a candidate's answer for an interview question, runs AI evaluation,
 * persists the results, and updates session progress.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit answers." },
        { status: 401 }
      );
    }

    // 2. Parse & Validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const validation = submitAnswerRequestSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: details }, { status: 400 });
    }

    const { questionId, answer, retry } = validation.data;

    // 3. Verify question existence and session ownership
    const question = await db.interviewQuestion.findUnique({
      where: { id: questionId },
      include: {
        interviewSession: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Interview question not found." },
        { status: 404 }
      );
    }

    if (question.interviewSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied. You do not own this interview session." },
        { status: 403 }
      );
    }

    // 4. Submit & Evaluate
    try {
      const result = await submitAndEvaluateAnswer(session.user.id, {
        interviewSessionId: question.interviewSessionId,
        questionId,
        answerText: answer,
        retry,
      });

      return NextResponse.json(
        {
          message:
            result.feedbackStatus === "Completed"
              ? "Answer submitted and evaluated successfully."
              : "Answer submitted successfully. Evaluation is pending.",
          answer: result.answer,
          feedback: result.feedback,
          feedbackStatus: result.feedbackStatus,
          warning: result.warning,
          sessionStatus: result.sessionStatus,
          totalQuestions: result.totalQuestions,
          answeredQuestionsCount: result.answeredQuestionsCount,
          isCompleted: result.isCompleted,
        },
        { status: 201 }
      );
    } catch (evalErr: unknown) {
      if (evalErr instanceof EvaluationError) {
        if (evalErr.code === "DUPLICATE_SUBMISSION") {
          return NextResponse.json(
            { error: evalErr.message },
            { status: 409 }
          );
        }
        if (evalErr.code === "NOT_FOUND_OR_FORBIDDEN") {
          return NextResponse.json(
            { error: evalErr.message },
            { status: 403 }
          );
        }
      }
      throw evalErr;
    }
  } catch (error) {
    console.error("Error submitting interview answer:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your answer." },
      { status: 500 }
    );
  }
}
