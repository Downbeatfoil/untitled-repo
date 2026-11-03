/**
 * Lane: ai-tools. Study plan generation.
 * generatePlan(pack, examDate, hoursPerDay) -> StudyPlan
 * The schedule (dates, minutes, which concepts, spaced reviews, final mock exam) is computed
 * deterministically so it is always valid; Grok (if configured) only writes the per-day task text.
 */
import type { CoursePack, PlanDay, StudyPlan } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "@/lib/ai/grok";
import { GROK_VOICE, clamp, labelOf, num, rankConcepts, str, withTimeout } from "./_util";

const MAX_DAYS = 21;
const DAY_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, "0");
/** Local-calendar YYYY-MM-DD for a Date. */
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Parse YYYY-MM-DD into a UTC-midnight day number (timezone-proof). */
function dayNum(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s ?? "");
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return Number.isNaN(t) ? null : Math.round(t / DAY_MS);
}
const fromDayNum = (n: number) => {
  const d = new Date(n * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

interface Skeleton {
  date: string;
  newIds: string[];
  reviewIds: string[];
  kind: "learn" | "review" | "mock";
}

/** Deterministic schedule: frequency × difficulty priority, spaced repetition (+1, +3 days), last day = mock exam. */
function buildSkeleton(pack: CoursePack, examDate: string): Skeleton[] {
  const now = new Date();
  const today = dayNum(ymd(now)) as number;
  let exam = dayNum(examDate);
  if (exam === null) exam = today + 7;
  if (exam < today) exam = today;
  const total = clamp(exam - today + 1, 1, MAX_DAYS);
  const start = exam - total + 1; // if exam is >21 days out, plan the final 21 days

  const ranked = rankConcepts(pack).map((r) => r.c.id);
  const studyDays = Math.max(0, total - 1);
  const skeleton: Skeleton[] = [];
  // Reserve ~the last quarter of study days (min 1 if possible) for pure review / light polish.
  const learnDays = studyDays === 0 ? 0 : Math.max(1, Math.ceil(studyDays * 0.7));
  const perDay = learnDays ? Math.ceil(ranked.length / learnDays) : 0;
  const learnedOn = new Map<string, number>(); // conceptId -> day index learned

  for (let i = 0; i < studyDays; i++) {
    let newIds: string[] = [];
    if (i < learnDays) {
      newIds = ranked.slice(i * perDay, (i + 1) * perDay);
      newIds.forEach((id) => learnedOn.set(id, i));
    }
    // spaced repetition: revisit what was learned 1 and 3 days ago (and a mixed pass on later days)
    const reviewIds = ranked.filter((id) => {
      const l = learnedOn.get(id);
      return l !== undefined && l < i && (i - l === 1 || i - l === 3 || (i >= learnDays && i - l > 3 && (i + l) % 2 === 0));
    });
    skeleton.push({
      date: fromDayNum(start + i),
      newIds,
      reviewIds: reviewIds.slice(0, 4),
      kind: newIds.length ? "learn" : "review",
    });
  }
  skeleton.push({ date: fromDayNum(start + studyDays), newIds: [], reviewIds: ranked.slice(0, 5), kind: "mock" });
  return skeleton;
}

function fallbackTasks(pack: CoursePack, s: Skeleton, isDayBeforeExam: boolean): string[] {
  const nm = (ids: string[]) => ids.map((id) => labelOf(pack, id)).join(", ");
  if (s.kind === "mock") {
    return [
      `Take a full timed mock exam for ${pack.course.code}, closed notes, no pausing`,
      "Grade yourself ruthlessly; list every miss and the concept behind it",
      `Last skim: ${nm(s.reviewIds)}. Then sleep: sleep beats cramming.`,
    ];
  }
  const tasks: string[] = [];
  if (s.newIds.length) {
    tasks.push(`Learn: ${nm(s.newIds)}. Read your notes once, then close them and re-derive the key idea.`);
    tasks.push(`Do 4-5 practice problems on ${labelOf(pack, s.newIds[0])}, writing every step by hand.`);
  }
  if (s.reviewIds.length) tasks.push(`Spaced review (active recall, no peeking): ${nm(s.reviewIds)}.`);
  if (isDayBeforeExam) tasks.push("Redo your old mistakes and make a one-page cheat sheet of traps. Light day: stop early.");
  else if (!s.newIds.length) tasks.push("Take a short 10-question quiz from the Practice Exam tab and review every miss.");
  else tasks.push("End the day with 3 flashcard-style questions from memory.");
  return tasks;
}

export function mockStudyPlan(pack: CoursePack, examDate: string, hoursPerDay: number): StudyPlan {
  const minutes = clamp(Math.round(num(hoursPerDay, 2) * 60), 15, 720);
  const sk = buildSkeleton(pack, examDate);
  const days: PlanDay[] = sk.map((s, i) => ({
    date: s.date,
    conceptIds: [...new Set([...s.newIds, ...s.reviewIds])],
    tasks: fallbackTasks(pack, s, i === sk.length - 2),
    minutes,
  }));
  return { courseCode: pack.course.code, days, mocked: true };
}

export async function generatePlan(pack: CoursePack, examDate: string, hoursPerDay: number): Promise<StudyPlan> {
  try {
    const base = mockStudyPlan(pack, examDate, hoursPerDay);
    if (!grokConfigured()) return base;

    const lines = base.days.map(
      (d, i) =>
        `Day ${i + 1} (${d.date}, ${d.minutes} min, ${i === base.days.length - 1 ? "FULL MOCK EXAM" : i === base.days.length - 2 ? "light day before exam" : "study"}): concepts = ${
          d.conceptIds.map((id) => `${id} (${labelOf(pack, id)})`).join("; ") || "none"
        }`,
    );
    const prompt = `Course: ${pack.course.code} ${pack.course.title}. Student has ${hoursPerDay} hours/day. Exam: ${examDate}.
Hardest topics per student quotes/tips: ${pack.tips.slice(0, 4).join(" | ")}
Concept notes: ${pack.concepts.map((c) => `${c.id}: ${c.description}`).join("\n")}

The schedule below is FIXED (spaced repetition and priority already decided). For each day write 2-4 concrete tasks that fit the minutes available: name specific techniques (hand-trace, derive, timed problem set, teach-it-back), reference the real concept, and when a concept repeats from an earlier day make it a review (active recall, not rereading). The final day is a full timed mock exam plus review of misses. Voice: Grok, witty but practical, one short line each.
${lines.join("\n")}
Return ONLY JSON: {"days": [{"tasks": string[]}]} with exactly ${base.days.length} entries in order.`;
    const out = await withTimeout(
      askGrokJson<{ days?: { tasks?: unknown }[] }>(prompt, { system: GROK_VOICE, temperature: 0.6 }),
      40_000,
      "generatePlan",
    );
    const got = out?.days;
    if (!Array.isArray(got) || got.length !== base.days.length) throw new Error("bad plan shape");
    const days = base.days.map((d, i) => {
      const tasks = Array.isArray(got[i]?.tasks) ? (got[i].tasks as unknown[]).map((t) => str(t)).filter(Boolean).slice(0, 5) : [];
      return { ...d, tasks: tasks.length ? tasks : d.tasks };
    });
    return { courseCode: pack.course.code, days, mocked: false };
  } catch {
    try {
      return mockStudyPlan(pack, examDate, hoursPerDay);
    } catch {
      return { courseCode: pack?.course?.code ?? "", days: [], mocked: true };
    }
  }
}
