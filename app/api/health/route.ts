/** Lane: api. GET /api/health */
import { NextResponse } from "next/server";
import type { HealthResponse } from "@/shared/contract";
import { grokConfigured } from "@/lib/ai/grok";

export function GET() {
  return NextResponse.json<HealthResponse>({ ok: true, grokConfigured: grokConfigured() });
}
