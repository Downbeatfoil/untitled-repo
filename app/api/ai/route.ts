/** Lane: api. POST /api/ai — see AiRequest/AiResponse in shared/contract.ts */
import { NextResponse } from "next/server";
import type { AiRequest, AiResponse, ApiError } from "@/shared/contract";
import { askGrok, grokConfigured } from "@/lib/ai/grok";
import { PROMPTS } from "@/lib/ai/prompts";
import { mockAiResponse } from "@/lib/data/mock";

export async function POST(req: Request) {
  let body: AiRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.prompt || typeof body.prompt !== "string") {
    return NextResponse.json<ApiError>({ error: "`prompt` is required" }, { status: 400 });
  }

  if (!grokConfigured()) return NextResponse.json<AiResponse>(mockAiResponse(body.prompt));

  try {
    const text = await askGrok(body.prompt, { system: body.system ?? PROMPTS.default });
    return NextResponse.json<AiResponse>({ text, mocked: false });
  } catch (err) {
    console.error("[api/ai]", err);
    return NextResponse.json<ApiError>({ error: "Grok request failed" }, { status: 502 });
  }
}
