/** Lane: api. GET /api/export/[code]?format=smartpath|ics */
import { NextResponse } from "next/server";
import type { ApiError } from "@/shared/contract";
import { courseSlug, normalizeCourseCode } from "@/shared/contract";
import { findPack } from "@/app/api/_cache";
import { toIcs, toSmartPath } from "@/lib/export";
import { mockPlan } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json<ApiError>({ error: "Course code is required" }, { status: 400 });
    }

    const decoded = decodeURIComponent(code.trim());
    const normalized = normalizeCourseCode(decoded);
    const { pack } = findPack(normalized);

    if (!pack) {
      return NextResponse.json<ApiError>({ error: `Course pack not found for '${decoded}'` }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "smartpath").toLowerCase();
    const slug = courseSlug(pack.course.code);

    if (format === "ics") {
      const examDate = searchParams.get("examDate") || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
      const hoursPerDay = parseFloat(searchParams.get("hoursPerDay") || "2") || 2;
      const plan = mockPlan(pack, examDate, hoursPerDay);
      const icsBody = toIcs(plan, pack);

      return new Response(icsBody, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slug}.ics"`,
          "x-mocked": "1",
        },
      });
    }

    // Default to smartpath JSON export
    const exported = toSmartPath(pack);
    return new Response(JSON.stringify(exported, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-smartpath.json"`,
        ...(pack.mocked ? { "x-mocked": "1" } : {}),
      },
    });
  } catch (err) {
    console.error("[api/export] error:", err);
    return NextResponse.json<ApiError>({ error: "Failed to generate export" }, { status: 500 });
  }
}
