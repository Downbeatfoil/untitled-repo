/** Lane: api. GET /api/courses -> CourseSummary[] */
import { NextResponse } from "next/server";
import type { ApiError, CourseSummary } from "@/shared/contract";
import { getAllCourses } from "@/app/api/_cache";
import { listSeeds } from "@/lib/data/packs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = getAllCourses();
    return NextResponse.json<CourseSummary[]>(courses);
  } catch (err) {
    console.error("[api/courses] error:", err);
    try {
      const fallback = listSeeds();
      return NextResponse.json<CourseSummary[]>(fallback, {
        headers: { "x-mocked": "1" },
      });
    } catch {
      return NextResponse.json<ApiError>({ error: "Failed to retrieve courses" }, { status: 500 });
    }
  }
}
