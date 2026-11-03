/** Lane: lab. Inline mock roast (used until/unless Grok `roastSchedule` is available). Pure + deterministic. */
import type { CoursePack } from "@/shared/contract";

export interface RoastCourse {
  code: string;
  title: string;
  fearScore: number;
  hardest: string;
}
export interface RoastResult {
  survivalOdds: number; // 0..100
  totalFear: number; // sum of fear scores
  avgFear: number;
  verdict: string;
  perCourse: { code: string; line: string }[];
  courses: RoastCourse[];
  mocked: boolean;
}

export function hardestLabel(p: CoursePack): string {
  const top = [...p.difficulty].sort((a, b) => b.score - a.score)[0];
  return p.concepts.find((c) => c.id === top?.conceptId)?.label ?? p.concepts[0]?.label ?? "everything";
}

export function toRoastCourse(p: CoursePack): RoastCourse {
  return { code: p.course.code, title: p.course.title, fearScore: p.fearScore, hardest: hardestLabel(p) };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

const SPECIAL: Record<string, string> = {
  "CS 1332": "Data Structures: you'll learn 14 ways to balance a tree while your own sleep schedule falls over.",
  "CS 2110": "Computer Org: LC-3 assembly is just regret with registers. Your stack frame will not be the only thing that overflows.",
  "CS 1331": "Intro OOP: 'it compiles on my machine' is not a Gradescope strategy.",
  "MATH 1554": "Linear Algebra: you will row-reduce in your dreams and still get the free variable wrong.",
  "CS 3510": "Design & Analysis of Algorithms: NP-hardness is the only thing here that's guaranteed to be proven. Your grade is not.",
  "PHYS 2211": "Physics I: frictionless surfaces, massless pulleys, and an exam that has neither mercy nor a formula sheet.",
};

const TIERS: { min: number; lines: string[] }[] = [
  { min: 80, lines: [
    "{code} ({hardest}) is the final boss, and you showed up without a save point.",
    "Students whisper '{hardest}' like it's a cursed word. Welcome to {code}.",
    "{code} doesn't test what you know; it tests how long you can stay awake without it.",
  ] },
  { min: 65, lines: [
    "{code} will be fine, if by fine you mean 3 AM office hours and a tragic amount of caffeine over {hardest}.",
    "{code}: a solid B is a personality trait here. {hardest} will humble you.",
    "Past exams for {code} lean hard on {hardest}. Your weekend plans are now fiction.",
  ] },
  { min: 45, lines: [
    "{code} is the 'reasonable' one, which is exactly why you'll ignore it until {hardest} bites.",
    "{code}: not scary, just quietly time-consuming. Don't sleep on {hardest}.",
    "{code} is the friend who says 'it's chill' then assigns a project on {hardest}.",
  ] },
  { min: 0, lines: [
    "{code} is your rest stop. Don't skip lectures, it's the only thing keeping your GPA's head above water.",
    "{code} is the cozy one. Enjoy it. {hardest} is the most it'll ask of you.",
    "{code}: a free-ish win, as long as you don't pretend {hardest} is optional.",
  ] },
];

export function roastLine(c: RoastCourse): string {
  if (c.fearScore >= 70 && SPECIAL[c.code]) return SPECIAL[c.code];
  const tier = TIERS.find((t) => c.fearScore >= t.min) ?? TIERS[TIERS.length - 1];
  const tpl = tier.lines[hash(c.code) % tier.lines.length];
  return tpl.replace(/\{code\}/g, c.code).replace(/\{hardest\}/g, c.hardest);
}

/** Weighted load → survival odds: more courses + higher fear = worse odds. */
export function survivalOddsFor(fears: number[]): number {
  const n = fears.length || 1;
  const avg = fears.reduce((s, f) => s + f, 0) / n;
  const load = avg * (0.7 + 0.3 * Math.min(n, 5) / 5) + Math.max(0, n - 3) * 2.5;
  return Math.round(Math.max(2, Math.min(97, 108 - load * 1.15)));
}

export function verdictFor(odds: number, courses: RoastCourse[]): string {
  const worst = [...courses].sort((a, b) => b.fearScore - a.fearScore)[0];
  const w = worst ? worst.code : "this schedule";
  if (odds < 20) return `Statistically, you will not see daylight this semester. ${w} alone is a reason to update your will. Strap in: it's survivable, but only with a plan.`;
  if (odds < 40) return `This schedule is a hostage situation with a syllabus. ${w} is the ringleader. You'll make it, but you'll have stories.`;
  if (odds < 60) return `Respectable chaos. Hard, but not hopeless: front-load ${w} and protect your sleep like it's a graded component.`;
  if (odds < 80) return `You picked a spicy-but-fair semester. ${w} will test you; the rest will let you breathe.`;
  return `Suspiciously easy. Either you're gaming the system or you're a genius. Don't get cocky: ${w} still has a pop quiz with your name on it.`;
}

export function mockRoast(packs: CoursePack[]): RoastResult {
  const courses = packs.map(toRoastCourse);
  const fears = courses.map((c) => c.fearScore);
  const totalFear = Math.round(fears.reduce((s, f) => s + f, 0));
  const avgFear = Math.round(totalFear / Math.max(1, courses.length));
  const survivalOdds = survivalOddsFor(fears);
  return {
    survivalOdds,
    totalFear,
    avgFear,
    verdict: verdictFor(survivalOdds, courses),
    perCourse: courses.map((c) => ({ code: c.code, line: roastLine(c) })),
    courses,
    mocked: true,
  };
}
