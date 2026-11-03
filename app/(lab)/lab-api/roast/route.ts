/** Lane: lab. POST { codes: string[] } -> RoastResult (roastSchedule from ai-tools; inline mock fallback; never throws). */
import { NextResponse } from "next/server";
import { roastSchedule } from "@/lib/ai-tools";
import { packsFor } from "@/components/lab/server";
import { mockRoast, toRoastCourse, type RoastResult } from "@/components/lab/roastMock";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { codes?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const r = packsFor(body.codes, 1, 6);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  const fallback = mockRoast(r.packs);
  try {
    const g = await roastSchedule(r.packs);
    const courses = r.packs.map(toRoastCourse);
    const totalFear = fallback.totalFear;
    const out: RoastResult = {
      survivalOdds: Math.round(g.survivalOdds),
      totalFear,
      avgFear: fallback.avgFear,
      verdict: g.verdict || fallback.verdict,
      perCourse: g.perCourse.length === courses.length
        ? g.perCourse
        : courses.map((c) => g.perCourse.find((p) => p.code === c.code) ?? fallback.perCourse.find((p) => p.code === c.code)!),
      courses,
      mocked: g.mocked,
    };
    return NextResponse.json(out);
  } catch {
    return NextResponse.json(fallback);
  }
}
