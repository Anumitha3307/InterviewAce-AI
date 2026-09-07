import OpenAI from "openai";

/**
 * Singleton OpenAI client instance for AI operations
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock-api-key",
});
