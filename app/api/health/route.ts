/** Lane: api. GET /api/health */
import { NextResponse } from "next/server";
import type { HealthResponse } from "@/shared/contract";
import { grokConfigured } from "@/lib/ai/grok";

export const dynamic = "force-dynamic";

export function GET() {
  const configured = grokConfigured();
  const headers: Record<string, string> = {};
  if (!configured) {
    headers["x-mocked"] = "1";
  }
  return NextResponse.json<HealthResponse>(
    { ok: true, grokConfigured: configured },
    { headers }
  );
}
