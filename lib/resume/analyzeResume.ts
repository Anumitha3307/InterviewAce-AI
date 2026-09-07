import { z } from "zod";
import { openai } from "@/lib/openai";
import { db } from "@/lib/prisma";

export class ResumeAnalysisError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ResumeAnalysisError";
  }
}

/**
 * Zod schema to strictly validate OpenAI's structured JSON output
 */
export const resumeAnalysisSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  technicalSkills: z.array(z.string()).min(1, "At least one technical skill is required"),
  softSkills: z.array(z.string()).min(1, "At least one soft skill is required"),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()).min(1, "At least one strength is required"),
  weaknesses: z.array(z.string()).min(1, "At least one weakness is required"),
  improvementSuggestions: z.array(z.string()).min(1, "At least one suggestion is required"),
  resumeSummary: z.string().min(20, "Summary must be at least 20 characters"),
  experienceLevel: z.string().min(2, "Experience level is required"),
  recommendedJobRoles: z.array(z.string()).min(1, "At least one recommended role is required"),
});

export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisSchema>;

const SYSTEM_PROMPT = `You are an expert AI Resume Analyst, ATS Evaluator, and Senior Technical Recruiter.
Analyze the provided resume text thoroughly, objectively, and accurately.
You must respond ONLY with a valid JSON object matching this exact schema:
{
  "atsScore": number (integer 0-100 reflecting formatting, keyword density, role fit, and impact metrics),
  "technicalSkills": string[] (detected engineering skills, languages, tools, databases, frameworks),
  "softSkills": string[] (leadership, communication, problem solving, agile methodologies),
  "missingKeywords": string[] (high-value keywords, certifications, or modern tools missing for this profile),
  "strengths": string[] (3-5 key achievements, competencies, or strong signals),
  "weaknesses": string[] (2-4 areas lacking quantifiable metrics, unclear bullet points, or gaps),
  "improvementSuggestions": string[] (3-5 concrete, actionable suggestions to raise the ATS score),
  "resumeSummary": string (3-5 sentences summarizing candidate profile, core domain, and key strengths),
  "experienceLevel": string (e.g. "Entry-Level", "Junior", "Mid-Level", "Senior", "Lead", or "Principal"),
  "recommendedJobRoles": string[] (3-5 job titles best matched to the candidate's background)
}
Ensure all evaluations are strictly grounded in the provided resume text.`;

/**
 * Sends extracted resume text to OpenAI and returns a validated analysis result.
 *
 * @param resumeText - The cleaned plain text of the resume
 * @returns Validated ResumeAnalysisResult
 * @throws ResumeAnalysisError if text is empty, OpenAI fails, or schema validation fails
 */
export async function analyzeResumeText(resumeText: string): Promise<ResumeAnalysisResult> {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new ResumeAnalysisError("Resume text cannot be empty for AI analysis.", "EMPTY_TEXT");
  }

  // Support mock mode for isolated testing environments or CI without live OpenAI quota
  if (process.env.MOCK_OPENAI === "true") {
    return generateMockAnalysis(resumeText);
  }

  let content: string | null = null;
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `RESUME TEXT TO EVALUATE:\n\n${resumeText}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    content = completion.choices[0]?.message?.content ?? null;
  } catch (apiError: unknown) {
    const msg = apiError instanceof Error ? apiError.message : String(apiError);
    throw new ResumeAnalysisError(`OpenAI request failed: ${msg}`, "OPENAI_API_ERROR");
  }

  if (!content) {
    throw new ResumeAnalysisError("OpenAI returned an empty response.", "EMPTY_RESPONSE");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    throw new ResumeAnalysisError("Failed to parse OpenAI response as JSON.", "INVALID_JSON");
  }

  const validation = resumeAnalysisSchema.safeParse(parsedJson);
  if (!validation.success) {
    const errorDetails = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new ResumeAnalysisError(`AI response failed schema validation: ${errorDetails}`, "SCHEMA_VALIDATION_FAILED");
  }

  return validation.data;
}

/**
 * Helper to generate deterministic mock analysis for test scenarios
 */
export function generateMockAnalysis(resumeText: string): ResumeAnalysisResult {
  const isSenior = /senior|lead|architect|principal|staff/i.test(resumeText);
  return {
    atsScore: isSenior ? 88 : 78,
    technicalSkills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
    softSkills: ["Cross-functional Collaboration", "System Design", "Agile Development", "Code Review"],
    missingKeywords: ["CI/CD Pipeline", "Kubernetes", "AWS Lambda", "Performance Profiling"],
    strengths: [
      "Demonstrated experience with modern full-stack TypeScript technologies.",
      "Clear articulation of frontend component architecture and state management.",
      "Strong foundational knowledge of relational database integrations.",
    ],
    weaknesses: [
      "Bullet points could benefit from more quantifiable metrics (e.g. % performance increase).",
      "Limited mention of automated testing tools or end-to-end testing frameworks.",
    ],
    improvementSuggestions: [
      "Quantify achievements using metrics like latency reduction, active users, or revenue impact.",
      "Incorporate cloud deployment tools such as Docker, AWS, or Terraform.",
      "Add a dedicated skills matrix at the top of the resume for faster ATS indexing.",
    ],
    resumeSummary:
      "A software engineering professional with demonstrable proficiency in TypeScript, Next.js, and web application architecture. Shows a history of delivering functional user experiences and robust backend APIs. Well-positioned for competitive software engineering opportunities.",
    experienceLevel: isSenior ? "Senior" : "Mid-Level",
    recommendedJobRoles: [
      "Full Stack Engineer",
      "Frontend Engineer",
      "Software Engineer II",
      "React/Next.js Developer",
    ],
  };
}

/**
 * Persists an AI analysis result into the Prisma ResumeAnalysis table
 * linked to the corresponding Resume record.
 */
export async function saveResumeAnalysis(
  resumeId: string,
  analysis: ResumeAnalysisResult
) {
  return await db.resumeAnalysis.upsert({
    where: { resumeId },
    create: {
      resumeId,
      atsScore: analysis.atsScore,
      extractedSkills: {
        technical: analysis.technicalSkills,
        soft: analysis.softSkills,
      },
      extractedProjects: {
        summary: analysis.resumeSummary,
        experienceLevel: analysis.experienceLevel,
        recommendedRoles: analysis.recommendedJobRoles,
      },
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.improvementSuggestions,
    },
    update: {
      atsScore: analysis.atsScore,
      extractedSkills: {
        technical: analysis.technicalSkills,
        soft: analysis.softSkills,
      },
      extractedProjects: {
        summary: analysis.resumeSummary,
        experienceLevel: analysis.experienceLevel,
        recommendedRoles: analysis.recommendedJobRoles,
      },
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.improvementSuggestions,
    },
  });
}

export type PrismaResumeAnalysisLike = {
  atsScore: number;
  extractedSkills: unknown;
  extractedProjects: unknown;
  strengths: unknown;
  weaknesses: unknown;
  missingKeywords: unknown;
  suggestions: unknown;
} | null | undefined;

/**
 * Transforms a Prisma ResumeAnalysis record into a typed ResumeAnalysisResult
 */
export function formatResumeAnalysisRecord(record: PrismaResumeAnalysisLike): ResumeAnalysisResult | null {
  if (!record) return null;
  const skills = record.extractedSkills as { technical?: string[]; soft?: string[] } | null;
  const projects = record.extractedProjects as {
    summary?: string;
    experienceLevel?: string;
    recommendedRoles?: string[];
  } | null;

  return {
    atsScore: record.atsScore,
    technicalSkills: Array.isArray(skills?.technical) ? skills.technical : [],
    softSkills: Array.isArray(skills?.soft) ? skills.soft : [],
    missingKeywords: Array.isArray(record.missingKeywords) ? (record.missingKeywords as string[]) : [],
    strengths: Array.isArray(record.strengths) ? (record.strengths as string[]) : [],
    weaknesses: Array.isArray(record.weaknesses) ? (record.weaknesses as string[]) : [],
    improvementSuggestions: Array.isArray(record.suggestions) ? (record.suggestions as string[]) : [],
    resumeSummary: projects?.summary || "",
    experienceLevel: projects?.experienceLevel || "Mid-Level",
    recommendedJobRoles: Array.isArray(projects?.recommendedRoles) ? (projects.recommendedRoles as string[]) : [],
  };
}
