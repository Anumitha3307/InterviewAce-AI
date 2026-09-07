import { z } from "zod";
import { db } from "@/lib/prisma";
import { InterviewType, Difficulty, InterviewStatus } from "@prisma/client";

export class SessionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "SessionError";
  }
}

/**
 * Zod validation schema for creating a new interview session
 */
export const createSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  role: z
    .string()
    .trim()
    .min(1, "Target role is required")
    .max(100, "Role cannot exceed 100 characters"),
  company: z
    .string()
    .trim()
    .max(100, "Company name cannot exceed 100 characters")
    .optional()
    .nullable(),
  interviewType: z.enum(
    ["TECHNICAL", "HR", "SYSTEM_DESIGN", "BEHAVIORAL"],
    { message: "Interview type must be one of: TECHNICAL, HR, SYSTEM_DESIGN, BEHAVIORAL" }
  ),
  difficulty: z.enum(
    ["EASY", "MEDIUM", "HARD"],
    { message: "Difficulty must be one of: EASY, MEDIUM, HARD" }
  ),
  resumeText: z.string().trim().optional().nullable(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * Creates a new interview session for the specified user
 */
export async function createInterviewSession(
  userId: string,
  input: CreateSessionInput
) {
  return await db.interviewSession.create({
    data: {
      userId,
      title: input.title,
      role: input.role,
      company: input.company || null,
      interviewType: input.interviewType as InterviewType,
      difficulty: input.difficulty as Difficulty,
      status: InterviewStatus.NOT_STARTED,
    },
  });
}

/**
 * Retrieves all interview sessions for a given user
 */
export async function getUserInterviewSessions(userId: string) {
  return await db.interviewSession.findMany({
    where: { userId },
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Formats a question record ensuring expectedTopics array and metadata are cleanly exposed
 */
export function formatQuestionRecord(q: {
  id: string;
  interviewSessionId: string;
  question: string;
  expectedTopics: unknown;
  order: number;
  createdAt: Date;
  answers?: unknown[];
}) {
  const meta = q.expectedTopics as {
    topics?: string[];
    estimatedMinutes?: number;
    difficulty?: string;
    category?: string;
  } | null;

  const topicsArray: string[] = Array.isArray(q.expectedTopics)
    ? (q.expectedTopics as string[])
    : Array.isArray(meta?.topics)
    ? meta.topics
    : [];

  return {
    id: q.id,
    interviewSessionId: q.interviewSessionId,
    question: q.question,
    expectedTopics: topicsArray,
    estimatedMinutes: meta?.estimatedMinutes ?? null,
    difficulty: meta?.difficulty ?? null,
    category: meta?.category ?? null,
    order: q.order,
    createdAt: q.createdAt,
    answers: q.answers || [],
  };
}

/**
 * Retrieves a single interview session by ID, ensuring user ownership
 */
export async function getInterviewSessionById(userId: string, sessionId: string) {
  const session = await db.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          answers: {
            include: {
              feedback: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new SessionError("Interview session not found or access denied.", "SESSION_NOT_FOUND");
  }

  return {
    ...session,
    questions: session.questions.map(formatQuestionRecord),
  };
}

/**
 * Deletes an interview session and cascades deletion of all related questions/answers/feedback
 */
export async function deleteInterviewSession(userId: string, sessionId: string) {
  // First verify existence and ownership
  const existing = await db.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!existing) {
    throw new SessionError("Interview session not found or access denied.", "SESSION_NOT_FOUND");
  }

  // Delete session - Prisma schema onDelete: Cascade handles questions, answers, and feedback
  return await db.interviewSession.delete({
    where: { id: sessionId },
  });
}
