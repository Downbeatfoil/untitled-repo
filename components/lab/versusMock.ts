/** Lane: lab. Inline mock Cage Match (used until/unless Grok `cageMatch` is available). Pure + deterministic. */
import type { CoursePack } from "@/shared/contract";
import { hardestLabel } from "./roastMock";

export interface Fighter { code: string; title: string; fearScore: number; hardest: string }
export interface VersusRound {
  title: string;
  emoji: string;
  winner: string; // course code
  commentary: string;
  aStat: string;
  bStat: string;
  damage: number; // HP the loser loses (0..35)
}
export interface VersusResult {
  a: Fighter;
  b: Fighter;
  rounds: VersusRound[];
  champion: string;
  championLine: string;
  mocked: boolean;
}

const fighter = (p: CoursePack): Fighter => ({ code: p.course.code, title: p.course.title, fearScore: p.fearScore, hardest: hardestLabel(p) });

function topExam(p: CoursePack): number {
  return [...p.examTopics].map((t) => t.frequency).sort((x, y) => y - x).slice(0, 3).reduce((s, f) => s + f, 0) / 3;
}
function maxDiff(p: CoursePack): number {
  return p.difficulty.reduce((m, d) => Math.max(m, d.score), 0);
}
function tears(p: CoursePack): number {
  const all = [...p.studentQuotes, ...p.difficulty.flatMap((d) => d.quotes)];
  return all.filter((q) => q.sentiment === "negative").length;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function mockVersus(pa: CoursePack, pb: CoursePack): VersusResult {
  const A = fighter(pa), B = fighter(pb);
  type M = { title: string; emoji: string; a: number; b: number; fmt: (n: number) => string; lines: (w: Fighter, l: Fighter, close: boolean) => string };
  const metrics: M[] = [
    { title: "Fear Factor", emoji: "😱", a: pa.fearScore, b: pb.fearScore, fmt: (n) => String(Math.round(n)),
      lines: (w, l, c) => c ? `A razor-thin call: ${w.code} edges ${l.code} on raw dread. The crowd is gasping.` : `${w.code} walks in and the whole lecture hall goes quiet. ${l.code} never stood a chance.` },
    { title: "Concept Overload", emoji: "🧠", a: pa.concepts.length, b: pb.concepts.length, fmt: (n) => `${n} concepts`,
      lines: (w, l, c) => c ? `Both are stuffed with ideas, but ${w.code} squeezes in just a few more.` : `${w.code} unloads a mountain of material. ${l.code} is still looking for the syllabus.` },
    { title: "Exam Ambush", emoji: "🎯", a: topExam(pa), b: topExam(pb), fmt: pct,
      lines: (w, l, c) => c ? `Both love to repeat their favorite topics, but ${w.code} is more predictable and more ruthless.` : `${w.code} recycles its hardest topics on every exam. ${l.code} sweats from the corner.` },
    { title: "Boss Fight", emoji: "👹", a: maxDiff(pa), b: maxDiff(pb), fmt: pct,
      lines: (w, l, c) => c ? `Both have a nightmare topic. ${w.code}'s ${w.hardest} just hits a little harder.` : `${w.hardest}!!! ${w.code}'s final boss one-shots ${l.code}'s best topic.` },
    { title: "Tears on r/gatech", emoji: "😭", a: tears(pa), b: tears(pb), fmt: (n) => `${n} cries`,
      lines: (w, l, c) => c ? `Student chatter is bleak on both sides. ${w.code} takes the crown of woe.` : `The reddit threads for ${w.code} read like survivor testimonies. ${l.code} gets a sympathy emoji.` },
  ];

  let aw = 0, bw = 0;
  const rounds: VersusRound[] = metrics.map((m) => {
    const tie = m.a === m.b;
    const aWins = tie ? pa.fearScore >= pb.fearScore : m.a > m.b;
    const w = aWins ? A : B, l = aWins ? B : A;
    if (aWins) aw++; else bw++;
    const hi = Math.max(m.a, m.b, 1);
    const margin = Math.abs(m.a - m.b) / hi;
    return {
      title: m.title, emoji: m.emoji, winner: w.code,
      commentary: m.lines(w, l, margin < 0.12),
      aStat: m.fmt(m.a), bStat: m.fmt(m.b),
      damage: Math.round(14 + Math.min(1, margin * 2.2) * 14),
    };
  });
  const champion = aw === bw ? (pa.fearScore >= pb.fearScore ? A.code : B.code) : aw > bw ? A.code : B.code;
  const cw = champion === A.code ? A : B;
  const score = `${Math.max(aw, bw)}–${Math.min(aw, bw)}`;
  return { a: A, b: B, rounds, champion, championLine: `${cw.code} takes it ${score}. Respect the fear: ${cw.hardest} is still out there.`, mocked: true };
}
