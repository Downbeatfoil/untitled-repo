/** Lane: api. GET /api/health */
import { NextResponse } from "next/server";
import type { HealthResponse } from "@/shared/contract";
import { grokConfigured, provider } from "@/lib/ai/grok";

export const dynamic = "force-dynamic";

export function GET() {
  const currentProvider = provider();
  const configured = grokConfigured();

  const headers: Record<string, string> = {};
  if (!configured || currentProvider === "none") {
    headers["x-mocked"] = "1";
  }

  return NextResponse.json<HealthResponse>(
    { ok: true, grokConfigured: configured, provider: currentProvider },
    { headers }
  );
}
