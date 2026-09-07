import { z } from "zod";
import { db } from "@/lib/prisma";
import { openai } from "@/lib/openai";

/**
 * Zod schema validating input for answer evaluation
 */
export const evaluateAnswerInputSchema = z.object({
  interviewSessionId: z.string().trim().min(1, "Session ID is required"),
  questionId: z.string().trim().min(1, "Question ID is required"),
  answerText: z.string().trim().min(1, "Answer text cannot be empty"),
  retry: z.boolean().optional(),
});

export type EvaluateAnswerInput = z.infer<typeof evaluateAnswerInputSchema>;

/**
 * Zod schema validating structured AI evaluation output (Requirement 2)
 */
export const evaluationResultSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1, "At least one strength must be provided"),
  weaknesses: z.array(z.string()),
  technicalAccuracy: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  missingConcepts: z.array(z.string()),
  improvementSuggestions: z.array(z.string()).min(1, "At least one improvement suggestion is required"),
  idealAnswer: z.string().min(10, "Ideal answer must be comprehensive"),
  followUpQuestions: z.array(z.string()),
  overallFeedback: z.string().min(10, "Overall feedback must be comprehensive"),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

export class EvaluationError extends Error {
  code: string;
  constructor(message: string, code = "EVALUATION_ERROR") {
    super(message);
    this.name = "EvaluationError";
    this.code = code;
  }
}

/**
 * Builds the OpenAI evaluation prompts tailored strictly to the question and submitted answer
 */
export function buildEvaluationPrompt(params: {
  question: string;
  expectedTopics: string[];
  role: string;
  company?: string | null;
  interviewType: string;
  difficulty: string;
  answerText: string;
}) {
  const { question, expectedTopics, role, company, interviewType, difficulty, answerText } = params;

  const systemPrompt = `You are a world-class principal interviewer and technical hiring bar-raiser.
Your task is to evaluate a candidate's answer to an interview question.

CONTEXT:
- Candidate Target Role: ${role}
- Interview Type: ${interviewType}
- Target Difficulty: ${difficulty}
- Target Company: ${company?.trim() ? company.trim() : "Industry Standard"}

EVALUATION GUIDELINES:
1. Evaluate ONLY the submitted candidate answer against the specific interview question and expected topics.
2. Be objective, rigorous, and constructive. Match the scoring standard to the candidate's target seniority (${role}) and difficulty (${difficulty}).
3. Scores must be integers between 0 and 100:
   - score: Overall combined quality of the response.
   - technicalAccuracy: Accuracy of technical claims, concepts, patterns, syntax, or domain knowledge.
   - communication: Clarity, structure, conciseness, articulation, and coherence.
   - problemSolving: Methodological reasoning, trade-off analysis, edge-case coverage, and practical execution.
   - confidence: Decisiveness, tone, conviction, and clarity of thought.
4. strengths: 2-4 specific positive aspects demonstrated in the candidate's answer.
5. weaknesses: 1-4 specific deficiencies or ambiguities in the answer.
6. missingConcepts: Specific concepts, keywords, or trade-offs that should have been addressed.
7. improvementSuggestions: 2-4 actionable, concrete steps to elevate this answer to staff/principal level.
8. idealAnswer: A model benchmark answer (3-6 sentences) demonstrating the ideal depth, clarity, and trade-offs.
9. followUpQuestions: 2-3 logical follow-up questions an interviewer would probe next.
10. overallFeedback: A high-level executive summary (2-4 sentences) synthesizing performance and readiness.

You must respond ONLY with a valid JSON object matching this schema:
{
  "score": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "technicalAccuracy": number (0-100),
  "communication": number (0-100),
  "problemSolving": number (0-100),
  "confidence": number (0-100),
  "missingConcepts": ["string"],
  "improvementSuggestions": ["string"],
  "idealAnswer": "string",
  "followUpQuestions": ["string"],
  "overallFeedback": "string"
}`;

  const userPrompt = `INTERVIEW QUESTION:
${question}

EXPECTED TOPICS / KEYWORDS:
${expectedTopics.length > 0 ? expectedTopics.join(", ") : "Standard core principles for this role"}

CANDIDATE SUBMITTED ANSWER:
${answerText}`;

  return { systemPrompt, userPrompt };
}

/**
 * Sends the candidate's answer to OpenAI and validates the structured evaluation
 * Never fabricates AI scores or feedback if OpenAI fails.
 */
export async function evaluateAnswerWithAI(params: {
  question: string;
  expectedTopics: string[];
  role: string;
  company?: string | null;
  interviewType: string;
  difficulty: string;
  answerText: string;
}): Promise<EvaluationResult> {
  const { systemPrompt, userPrompt } = buildEvaluationPrompt(params);

  let rawContent: string | null = null;
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    rawContent = completion.choices[0]?.message?.content ?? null;
  } catch (apiErr: unknown) {
    const message = apiErr instanceof Error ? apiErr.message : String(apiErr);
    throw new EvaluationError(`OpenAI evaluation failed: ${message}`, "OPENAI_API_ERROR");
  }

  if (!rawContent) {
    throw new EvaluationError("OpenAI returned an empty response.", "EMPTY_RESPONSE");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new EvaluationError("Failed to parse OpenAI evaluation as JSON.", "INVALID_JSON");
  }

  const validation = evaluationResultSchema.safeParse(parsed);
  if (!validation.success) {
    const details = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new EvaluationError(`AI evaluation failed schema validation: ${details}`, "SCHEMA_VALIDATION_FAILED");
  }

  return validation.data;
}

/**
 * Formats a stored InterviewFeedback DB record into the structured format
 */
export function formatFeedbackRecord(fb: {
  id: string;
  interviewAnswerId: string;
  score: number;
  technicalScore?: number | null;
  communicationScore?: number | null;
  confidenceScore?: number | null;
  strengths: unknown;
  weaknesses: unknown;
  suggestions: unknown;
  overallFeedback: string;
  createdAt: Date;
}) {
  const metaSuggestions = (fb.suggestions || {}) as {
    improvementSuggestions?: string[];
    missingConcepts?: string[];
    idealAnswer?: string;
    followUpQuestions?: string[];
    problemSolving?: number;
  };

  return {
    id: fb.id,
    interviewAnswerId: fb.interviewAnswerId,
    score: fb.score,
    technicalAccuracy: fb.technicalScore ?? fb.score,
    communication: fb.communicationScore ?? fb.score,
    problemSolving: metaSuggestions.problemSolving ?? fb.score,
    confidence: fb.confidenceScore ?? fb.score,
    strengths: Array.isArray(fb.strengths) ? (fb.strengths as string[]) : [],
    weaknesses: Array.isArray(fb.weaknesses) ? (fb.weaknesses as string[]) : [],
    missingConcepts: Array.isArray(metaSuggestions.missingConcepts) ? metaSuggestions.missingConcepts : [],
    improvementSuggestions: Array.isArray(metaSuggestions.improvementSuggestions)
      ? metaSuggestions.improvementSuggestions
      : Array.isArray(fb.suggestions)
      ? (fb.suggestions as string[])
      : [],
    idealAnswer: metaSuggestions.idealAnswer || "",
    followUpQuestions: Array.isArray(metaSuggestions.followUpQuestions) ? metaSuggestions.followUpQuestions : [],
    overallFeedback: fb.overallFeedback,
    createdAt: fb.createdAt,
  };
}

/**
 * Main service method: Validates question, saves raw answer, runs AI evaluation,
 * persists feedback, and updates interview session status automatically.
 *
 * If OpenAI fails:
 * - Saves raw answer
 * - Session continues
 * - No fake scores
 * - feedbackStatus = "Pending"
 */
export async function submitAndEvaluateAnswer(
  userId: string,
  input: EvaluateAnswerInput
) {
  // 1. Fetch Question and verify Session ownership
  const question = await db.interviewQuestion.findFirst({
    where: {
      id: input.questionId,
      interviewSessionId: input.interviewSessionId,
    },
    include: {
      interviewSession: true,
      answers: {
        include: {
          feedback: true,
        },
      },
    },
  });

  if (!question || question.interviewSession.userId !== userId) {
    throw new EvaluationError(
      "Question not found or you do not have permission to answer it.",
      "NOT_FOUND_OR_FORBIDDEN"
    );
  }

  const existingAnswer = question.answers[0];

  // Check for duplicate submission
  if (existingAnswer) {
    if (existingAnswer.feedback) {
      throw new EvaluationError(
        "This question has already been answered and evaluated.",
        "DUPLICATE_SUBMISSION"
      );
    }

    if (!input.retry) {
      throw new EvaluationError(
        "This question has already been answered. Evaluation is pending. Use retry to evaluate.",
        "DUPLICATE_SUBMISSION"
      );
    }
  }

  // 2. Save or retrieve InterviewAnswer record
  const answerRecord = existingAnswer
    ? existingAnswer
    : await db.interviewAnswer.create({
        data: {
          interviewQuestionId: question.id,
          answer: input.answerText,
        },
      });

  // Extract expected topics from question metadata
  const expectedTopicsMeta = question.expectedTopics as { topics?: string[] } | string[] | null;
  const expectedTopics: string[] = Array.isArray(expectedTopicsMeta)
    ? expectedTopicsMeta
    : Array.isArray(expectedTopicsMeta?.topics)
    ? expectedTopicsMeta.topics
    : [];

  // 3. Attempt AI Evaluation
  let evaluation: EvaluationResult | null = null;
  let feedbackRecord: ReturnType<typeof formatFeedbackRecord> | null = null;
  let feedbackStatus: "Completed" | "Pending" = "Pending";
  let warning: string | undefined = undefined;

  try {
    evaluation = await evaluateAnswerWithAI({
      question: question.question,
      expectedTopics,
      role: question.interviewSession.role,
      company: question.interviewSession.company,
      interviewType: question.interviewSession.interviewType,
      difficulty: question.interviewSession.difficulty,
      answerText: input.answerText,
    });

    // 4. Persist Feedback to DB
    const createdFeedback = await db.interviewFeedback.create({
      data: {
        interviewAnswerId: answerRecord.id,
        score: Math.round(evaluation.score),
        technicalScore: Math.round(evaluation.technicalAccuracy),
        communicationScore: Math.round(evaluation.communication),
        confidenceScore: Math.round(evaluation.confidence),
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: {
          improvementSuggestions: evaluation.improvementSuggestions,
          missingConcepts: evaluation.missingConcepts,
          idealAnswer: evaluation.idealAnswer,
          followUpQuestions: evaluation.followUpQuestions,
          problemSolving: Math.round(evaluation.problemSolving),
        },
        overallFeedback: evaluation.overallFeedback,
      },
    });

    feedbackRecord = formatFeedbackRecord(createdFeedback);
    feedbackStatus = "Completed";
  } catch (aiErr) {
    console.warn("AI answer evaluation failed. Storing raw answer as pending:", aiErr);
    // Graceful degradation: Raw answer is saved, session continues, no fake scores fabricated
    feedbackStatus = "Pending";
    warning = "Answer saved successfully, but AI evaluation could not be generated at this time.";
  }

  // 5. Update InterviewSession progress & completion status automatically (Requirements 6 & 7)
  const totalQuestions = await db.interviewQuestion.count({
    where: { interviewSessionId: question.interviewSessionId },
  });

  const answeredQuestionsCount = await db.interviewAnswer.count({
    where: {
      interviewQuestion: {
        interviewSessionId: question.interviewSessionId,
      },
    },
  });

  const isCompleted = totalQuestions > 0 && answeredQuestionsCount >= totalQuestions;
  const targetStatus = isCompleted ? "COMPLETED" : "IN_PROGRESS";

  const updatedSession = await db.interviewSession.update({
    where: { id: question.interviewSessionId },
    data: {
      status: targetStatus,
      startedAt: question.interviewSession.startedAt || new Date(),
      ...(isCompleted ? { completedAt: question.interviewSession.completedAt || new Date() } : {}),
    },
  });

  return {
    answer: answerRecord,
    feedback: feedbackRecord,
    feedbackStatus,
    warning,
    sessionStatus: updatedSession.status,
    totalQuestions,
    answeredQuestionsCount,
    isCompleted,
  };
}
