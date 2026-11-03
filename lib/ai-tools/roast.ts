/**
 * Lane: ai-tools. Schedule Roast: a savage-but-kind Grok roast of a semester schedule (used by the lab lane).
 * roastSchedule(packs) -> RoastResult. Never throws; mocked:true fallback when Grok is unavailable.
 */
import type { CoursePack } from "@/shared/contract";
import { clampNum, courseLine, grokJsonOrNull, hardestOf, toStr, topExamTopic } from "./jsonCall";

export interface RoastResult {
  /** Chance (0..100) of surviving the semester with sanity intact. */
  survivalOdds: number;
  /** One or two sentence roast of the whole schedule. */
  verdict: string;
  /** One roast line per course, in the same order as the input packs. */
  perCourse: { code: string; line: string }[];
  mocked: boolean;
}

const ROAST_SYSTEM =
  "You are Grok, roasting a Georgia Tech student's semester schedule: savage but kind, like a best friend at a roast who obviously wants them to survive. " +
  "Witty, confident, specific. Punch at the workload and the courses, never at the student or anyone's identity. Use ONLY the facts given (fear scores, hardest concepts, exam topics). " +
  "Each per-course line is one punchy sentence (max 28 words) that names a real concept from that course. Respond with a single JSON object only.";

/** Survival odds heuristic: heavier fear + more courses = lower odds. Deterministic. */
function computeOdds(packs: CoursePack[]): number {
  if (!packs.length) return 99;
  const avg = packs.reduce((s, p) => s + (p.fearScore ?? 50), 0) / packs.length;
  const loadPenalty = Math.max(0, packs.length - 3) * 5;
  return Math.round(Math.min(97, Math.max(3, 100 - avg * 0.9 - loadPenalty + 4)));
}

function mockLine(p: CoursePack): string {
  const h = hardestOf(p).label;
  const t = topExamTopic(p);
  const f = p.fearScore ?? 50;
  if (f >= 80) return `${p.course.code} has a ${f}/100 fear score and ${h} is waiting in the parking lot. The exam loves ${t}; so should you.`;
  if (f >= 60) return `${p.course.code}: ${h} will humble you around week 6, and ${t} shows up on the exam like a bad ex.`;
  return `${p.course.code} is the "easy" one, which is how ${h} sneaks up on you. Don't skip ${t}.`;
}

function mockRoast(packs: CoursePack[]): RoastResult {
  const odds = computeOdds(packs);
  const perCourse = packs.map((p) => ({ code: p.course.code, line: mockLine(p) }));
  const verdict = !packs.length
    ? "An empty schedule? Bold strategy. Survival odds are great, graduation odds less so."
    : odds < 25
      ? `${packs.length} courses, ${odds}% survival odds: this isn't a schedule, it's a dare. Stock up on coffee, friends and office hours.`
      : odds < 55
        ? `${odds}% survival odds. Doable, but your social life just filed for an extension. Start the hard problem sets early.`
        : `${odds}% survival odds: you'll actually live, which is suspicious. Don't get cocky: one bad midterm and the vibes shift.`;
  return { survivalOdds: odds, verdict, perCourse, mocked: true };
}

/** Roast a semester schedule. Never throws. */
export async function roastSchedule(packs: CoursePack[]): Promise<RoastResult> {
  const list = Array.isArray(packs) ? packs.filter((p) => p && p.course) : [];
  try {
    if (list.length) {
      const prompt = [
        `Roast this Georgia Tech semester schedule (${list.length} courses):`,
        ...list.map((p, i) => `${i + 1}. ${courseLine(p)}`),
        "",
        `Baseline survival odds computed from the fear scores: ${computeOdds(list)}%. Feel free to adjust by up to 15 points for course combinations that compound (e.g. two proof-heavy courses together).`,
        'Return JSON: {"survivalOdds": integer 0-100, "verdict": string (1-2 sentences, the headline roast of the whole schedule), "perCourse": [{"code": string (exactly as given), "line": string}]} with one perCourse entry per course in the same order.',
      ].join("\n");
      const out = await grokJsonOrNull<{ survivalOdds?: number; verdict?: string; perCourse?: { code?: string; line?: string }[] }>(
        prompt,
        ROAST_SYSTEM,
        0.9,
      );
      const verdict = toStr(out?.verdict);
      if (out && verdict) {
        const lines = Array.isArray(out.perCourse) ? out.perCourse : [];
        const fallback = mockRoast(list);
        const perCourse = list.map((p, i) => {
          const hit =
            lines.find((l) => toStr(l?.code).toUpperCase().replace(/\s+/g, "") === p.course.code.toUpperCase().replace(/\s+/g, "")) ?? lines[i];
          return { code: p.course.code, line: toStr(hit?.line, fallback.perCourse[i].line) };
        });
        return {
          survivalOdds: Math.round(clampNum(out.survivalOdds, 0, 100, computeOdds(list))),
          verdict,
          perCourse,
          mocked: false,
        };
      }
    }
  } catch (err) {
    console.warn("[ai-tools] roastSchedule failed:", (err as Error)?.message);
  }
  try {
    return mockRoast(list);
  } catch {
    return { survivalOdds: 50, verdict: "Your schedule is a coin flip with extra steps.", perCourse: [], mocked: true };
  }
}
