export type InterviewType = "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "BEHAVIORAL";
export type InterviewDifficulty = "EASY" | "MEDIUM" | "HARD";
export type InterviewStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export interface InterviewFeedbackData {
  id?: string;
  interviewAnswerId?: string;
  score: number;
  technicalAccuracy: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  improvementSuggestions: string[];
  idealAnswer: string;
  followUpQuestions: string[];
  overallFeedback: string;
  createdAt?: string | Date;
}

export interface InterviewAnswerData {
  id: string;
  interviewQuestionId: string;
  answer: string;
  durationSeconds?: number | null;
  createdAt: string | Date;
  feedback?: InterviewFeedbackData | null;
}

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
  answers?: InterviewAnswerData[];
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
