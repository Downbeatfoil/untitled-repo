/** Lane: api. POST /api/exam -> PracticeExam */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError, PracticeExam } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { findPack } from "@/app/api/_cache";
import { generateExam } from "@/lib/ai-tools";

export const dynamic = "force-dynamic";

const ExamRequestSchema = z.object({
  courseCode: z.string().min(1, "courseCode is required"),
  count: z.number().int().positive().optional(),
  conceptIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ExamRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>({ error: msg || "Invalid ExamRequest" }, { status: 400 });
  }

  const { courseCode, count, conceptIds } = parsed.data;
  const normalized = normalizeCourseCode(courseCode);
  const { pack, isMocked } = findPack(normalized);

  if (!pack) {
    return NextResponse.json<ApiError>({ error: `Course pack not found for '${courseCode}'` }, { status: 404 });
  }

  try {
    const exam = await generateExam(pack, count ?? 6, conceptIds);

    // Sanitize MCQ questions to ensure 4 strictly unique choices
    for (const q of exam.questions) {
      if (q.type === "mcq" && q.choices) {
        const seen = new Set<string>();
        const unique: string[] = [];
        for (const c of q.choices) {
          if (!seen.has(c)) {
            seen.add(c);
            unique.push(c);
          }
        }
        let alt = 1;
        while (unique.length < 4) {
          const candidate = `${alt}`;
          if (!seen.has(candidate) && candidate !== q.answer) {
            seen.add(candidate);
            unique.push(candidate);
          }
          alt++;
        }
        q.choices = unique;
      }
    }

    const headers: Record<string, string> = {};
    if (exam.mocked || isMocked) headers["x-mocked"] = "1";
    return NextResponse.json<PracticeExam>(exam, { headers });
  } catch (err) {
    console.error("[api/exam] generateExam error:", err);
    return NextResponse.json<ApiError>({ error: "Failed to generate exam" }, { status: 500 });
  }
}
