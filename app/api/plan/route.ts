/** Lane: api. POST /api/plan -> StudyPlan */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError, StudyPlan } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { findPack } from "@/app/api/_cache";
import { mockPlan } from "@/lib/data";

export const dynamic = "force-dynamic";

const PlanRequestSchema = z.object({
  courseCode: z.string().min(1, "courseCode is required"),
  examDate: z.string().min(1, "examDate is required"),
  hoursPerDay: z.number().positive("hoursPerDay must be positive"),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PlanRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>({ error: msg || "Invalid PlanRequest" }, { status: 400 });
  }

  const { courseCode, examDate, hoursPerDay } = parsed.data;
  const normalized = normalizeCourseCode(courseCode);
  const { pack, isMocked } = findPack(normalized);

  if (!pack) {
    return NextResponse.json<ApiError>({ error: `Course pack not found for '${courseCode}'` }, { status: 404 });
  }

  try {
    const plan = mockPlan(pack, examDate, hoursPerDay);
    const headers: Record<string, string> = {};
    if (plan.mocked || isMocked) headers["x-mocked"] = "1";
    return NextResponse.json<StudyPlan>(plan, { headers });
  } catch (err) {
    console.error("[api/plan] error:", err);
    return NextResponse.json<ApiError>({ error: "Failed to create study plan" }, { status: 500 });
  }
}
