export type InterviewType = "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "BEHAVIORAL";
export type InterviewDifficulty = "EASY" | "MEDIUM" | "HARD";
export type InterviewStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export interface Question {
  id: string;
  interviewSessionId: string;
  question: string;
  expectedTopics: string[];
  estimatedMinutes?: number | null;
  difficulty?: string | null;
  category?: string | null;
  order: number;
  createdAt: string;
  answers?: unknown[];
}

export interface InterviewSessionData {
  id: string;
  userId: string;
  title: string;
  company?: string | null;
  role: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}
