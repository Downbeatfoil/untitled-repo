/**
 * Lane: ai-tools. Course Cage Match: a Grok sports-commentator battle between two courses (used by the lab lane).
 * cageMatch(a, b) -> VersusResult. "Winner" = the more brutal / more feared course in that round.
 * Never throws; mocked:true fallback when Grok is unavailable.
 */
import type { CoursePack } from "@/shared/contract";
import { mockVersus } from "@/lib/data";
import { courseLine, grokJsonOrNull, hardestOf, toStr, topExamTopic } from "./jsonCall";

export interface VersusRound {
  title: string;
  /** Course code of the round winner (exactly one of the two input codes). */
  winner: string;
  commentary: string;
}

export interface VersusResult {
  rounds: VersusRound[];
  /** Course code that won the match (the most brutal overall). */
  champion: string;
  mocked: boolean;
}

const VERSUS_SYSTEM =
  "You are Grok, a hyped-up pay-per-view commentator calling a Cage Match between two Georgia Tech courses. The contest: which course is more BRUTAL for students? " +
  "Voice: big play-by-play energy, wrestling-announcer flair, quick-witted, affectionate toward the students (the COURSES are the fighters, never the people). " +
  "Make each round a different kind of fight (fear score, exam chaos, hardest concept, student trauma) and call each one with a vivid image and a punchline, e.g. 'AVL rotation comes in from the left... and he's DIZZY!'. " +
  "Use ONLY the facts given (fear scores, hardest concepts, exam topics, concept counts, student quotes) and name a real concept in every round. " +
  "Each round commentary is 1-2 punchy sentences (max 45 words). Keep it close and dramatic. Respond with a single JSON object only.";

/** Tally round winners into a champion; ties are broken by fear score. */
function pickChampion(rounds: VersusRound[], a: CoursePack, b: CoursePack): string {
  const wa = rounds.filter((r) => r.winner === a.course.code).length;
  const wb = rounds.filter((r) => r.winner === b.course.code).length;
  if (wa !== wb) return wa > wb ? a.course.code : b.course.code;
  return a.fearScore >= b.fearScore ? a.course.code : b.course.code;
}

function inlineVersus(a: CoursePack, b: CoursePack): VersusResult {
  const scary = a.fearScore >= b.fearScore ? a : b;
  const rounds: VersusRound[] = [
    {
      title: "Round 1: Fear Factor",
      winner: scary.course.code,
      commentary: `${scary.course.code} steps in with a ${scary.fearScore}/100 fear score and the crowd goes silent!`,
    },
    {
      title: "Round 2: Exam Chaos",
      winner: (a.concepts?.length ?? 0) >= (b.concepts?.length ?? 0) ? a.course.code : b.course.code,
      commentary: `More material, more problems: ${topExamTopic(a)} vs ${topExamTopic(b)}, and somebody's GPA is on the mat.`,
    },
    {
      title: "Round 3: Hardest Concept",
      winner: hardestOf(a).score >= hardestOf(b).score ? a.course.code : b.course.code,
      commentary: `${hardestOf(a).label} squares off against ${hardestOf(b).label}, and it is brutal!`,
    },
  ];
  return { rounds, champion: pickChampion(rounds, a, b), mocked: true };
}

/** Run a Cage Match between two courses. Never throws. */
export async function cageMatch(a: CoursePack, b: CoursePack): Promise<VersusResult> {
  try {
    const codeA = a.course.code;
    const codeB = b.course.code;
    const prompt = [
      "Call the Cage Match! Which Georgia Tech course is more brutal?",
      `FIGHTER A: ${courseLine(a)}`,
      `FIGHTER B: ${courseLine(b)}`,
      "",
      `Write exactly 4 rounds with fun titles (e.g. "Round 1: Fear Factor", "Round 2: Exam Chaos", "Round 3: Hardest Concept", "Round 4: Student Trauma"). Each round has a winner: exactly "${codeA}" or "${codeB}" (the more brutal course in that round). Make it close and fun; don't let one course win every round unless the facts demand it.`,
      'Return JSON: {"rounds": [{"title": string, "winner": string, "commentary": string}], "champion": string (the overall winner, must be one of the two codes)}.',
    ].join("\n");
    const out = await grokJsonOrNull<{ rounds?: { title?: string; winner?: string; commentary?: string }[]; champion?: string }>(
      prompt,
      VERSUS_SYSTEM,
      0.9,
    );
    if (out && Array.isArray(out.rounds)) {
      const resolve = (w: unknown): string | null => {
        const s = toStr(w).toUpperCase().replace(/\s+/g, "");
        if (s === codeA.toUpperCase().replace(/\s+/g, "")) return codeA;
        if (s === codeB.toUpperCase().replace(/\s+/g, "")) return codeB;
        return null;
      };
      const rounds: VersusRound[] = [];
      out.rounds.forEach((r, i) => {
        const winner = resolve(r?.winner);
        const commentary = toStr(r?.commentary);
        if (winner && commentary) rounds.push({ title: toStr(r?.title, `Round ${i + 1}`), winner, commentary });
      });
      if (rounds.length >= 3) {
        const trimmed = rounds.slice(0, 5);
        const claimed = resolve(out.champion);
        const tallied = pickChampion(trimmed, a, b);
        // Trust Grok's champion only if it agrees with the round tally (or the tally is a tie).
        const wa = trimmed.filter((r) => r.winner === codeA).length;
        const champion = claimed && (wa * 2 === trimmed.length || claimed === tallied) ? claimed : tallied;
        return { rounds: trimmed, champion, mocked: false };
      }
    }
  } catch (err) {
    console.warn("[ai-tools] cageMatch failed:", (err as Error)?.message);
  }
  try {
    const m = mockVersus(a, b);
    if (m?.rounds?.length && m.champion) return { rounds: m.rounds, champion: m.champion, mocked: true };
  } catch {
    /* fall through */
  }
  try {
    return inlineVersus(a, b);
  } catch {
    const code = a?.course?.code ?? "A";
    return { rounds: [], champion: code, mocked: true };
  }
}
