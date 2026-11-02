/**
 * Lane: data. Mock data + fake responses so frontend lanes never block on
 * the backend. Shapes MUST match shared/contract.ts.
 */
import type { AiResponse } from "@/shared/contract";

export function mockAiResponse(prompt: string): AiResponse {
  return {
    text: `(mock) You asked: "${prompt.slice(0, 80)}". Set XAI_API_KEY in .env.local for real Grok answers.`,
    mocked: true,
  };
}
