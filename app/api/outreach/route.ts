/** Lane: api. POST /api/outreach -> OutreachDraft */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError, OutreachDraft } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { findPack } from "@/app/api/_cache";
import { draftOutreach } from "@/lib/ai-tools";
import { mockOutreach } from "@/lib/data";

export const dynamic = "force-dynamic";

const OutreachRequestSchema = z.object({
  courseCode: z.string().min(1, "courseCode is required"),
  professorName: z.string().min(1, "professorName is required"),
  studentName: z.string().optional(),
  tone: z.enum(["formal", "friendly"]).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OutreachRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>({ error: msg || "Invalid OutreachRequest" }, { status: 400 });
  }

  const { courseCode, professorName, studentName, tone } = parsed.data;
  const normalized = normalizeCourseCode(courseCode);
  const { pack, isMocked } = findPack(normalized);

  if (!pack) {
    return NextResponse.json<ApiError>({ error: `Course pack not found for '${courseCode}'` }, { status: 404 });
  }

  try {
    const draft = await draftOutreach(pack, professorName, studentName, tone);
    const headers: Record<string, string> = {};
    if (draft.mocked || isMocked) headers["x-mocked"] = "1";
    return NextResponse.json<OutreachDraft>(draft, { headers });
  } catch (err) {
    console.error("[api/outreach] draftOutreach error, falling back:", err);
    try {
      const fallback = mockOutreach(pack, professorName, studentName);
      return NextResponse.json<OutreachDraft>(fallback, { headers: { "x-mocked": "1" } });
    } catch {
      return NextResponse.json<ApiError>({ error: "Failed to generate outreach draft" }, { status: 500 });
    }
  }
}
