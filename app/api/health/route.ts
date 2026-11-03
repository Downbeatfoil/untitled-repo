/** Lane: api. GET /api/health */
import { NextResponse } from "next/server";
import type { HealthResponse } from "@/shared/contract";
import { grokConfigured } from "@/lib/ai/grok";

export const dynamic = "force-dynamic";

export function GET() {
  const hasXai = grokConfigured();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const provider: HealthResponse["provider"] = hasXai ? "grok" : hasGemini ? "gemini" : "none";
  const isConfigured = provider !== "none";

  const headers: Record<string, string> = {};
  if (!isConfigured) {
    headers["x-mocked"] = "1";
  }

  return NextResponse.json<HealthResponse>(
    { ok: true, grokConfigured: isConfigured, provider },
    { headers }
  );
}
