/** Lane: wall. Server-side: turn seeded CoursePacks into the slim WallCourse slides (no network). */
import { getSeedPack, listSeeds } from "@/lib/data";
import type { CoursePack } from "@/shared/contract";
import type { WallCourse } from "@/components/wall/types";

const KIND: Record<string, string> = { reddit: "Reddit", x: "X", exam: "past exam", practice: "practice test", syllabus: "syllabus", "course-page": "course page", notes: "notes", other: "web" };

function toSlide(pack: CoursePack): WallCourse {
  const label = (id: string) => pack.concepts.find((c) => c.id === id)?.label ?? id;
  const hardestD = [...pack.difficulty].sort((a, b) => b.score - a.score)[0];
  const hc = pack.concepts.find((c) => c.id === hardestD?.conceptId) ?? pack.concepts[0];
  const q = pack.studentQuotes.find((x) => x.sentiment === "negative") ?? pack.studentQuotes[0] ?? hardestD?.quotes[0];
  const src = q ? pack.sources.find((s) => s.id === q.sourceId) : undefined;
  return {
    code: pack.course.code,
    title: pack.course.title,
    fearScore: pack.fearScore,
    summary: pack.summary,
    conceptCount: pack.concepts.length,
    sourceCount: pack.sources.length,
    mocked: pack.mocked,
    hardest: { label: hc?.label ?? "", description: hc?.description ?? "", score: hardestD?.score ?? 0, unit: hc?.unit },
    topics: [...pack.examTopics].sort((a, b) => b.frequency - a.frequency).slice(0, 5).map((t) => ({ label: label(t.conceptId), frequency: t.frequency })),
    quote: q ? { text: q.text, from: src ? KIND[src.kind] ?? "web" : "students", sentiment: q.sentiment } : null,
  };
}

export function loadWallCourses(): WallCourse[] {
  const out: WallCourse[] = [];
  for (const s of listSeeds()) {
    const pack = getSeedPack(s.code);
    if (pack) out.push(toSlide(pack));
  }
  return out;
}
