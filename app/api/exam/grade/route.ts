/** Lane: api. POST /api/exam/grade -> GradeResponse */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError, GradeResponse } from "@/shared/contract";
import { gradeAnswer } from "@/lib/ai-tools";

export const dynamic = "force-dynamic";

const GradeRequestSchema = z.object({
  courseCode: z.string().min(1, "courseCode is required"),
  question: z.object({
    id: z.string(),
    conceptId: z.string(),
    type: z.enum(["mcq", "short"]),
    prompt: z.string(),
    choices: z.array(z.string()).optional(),
    answer: z.string(),
    explanation: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    styleSourceId: z.string().optional(),
  }),
  userAnswer: z.string(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GradeRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>({ error: msg || "Invalid GradeRequest" }, { status: 400 });
  }

  const { question, userAnswer } = parsed.data;

  try {
    const result = await gradeAnswer(question, userAnswer);
    const headers: Record<string, string> = {};
    if (result.mocked) headers["x-mocked"] = "1";
    return NextResponse.json<GradeResponse>(result, { headers });
  } catch (err) {
    console.error("[api/exam/grade] error:", err);
    return NextResponse.json<ApiError>({ error: "Failed to grade answer" }, { status: 500 });
  }
}
