/**
 * Lane: ai-tools. Self-check: calls every ai-tools function on the CS 1332 seed and prints PASS/FAIL + mocked flag.
 * Run:  npx tsx lib/ai-tools/selfcheck.ts          (no XAI_API_KEY needed; with a key it exercises live Grok)
 * Exit code is 1 if any check fails.
 */
import type { CoursePack, Question } from "@/shared/contract";
import { cs1332Pack, math1554Pack } from "@/lib/data";
import { generateExam, gradeAnswer, generatePlan, courseChat, draftOutreach, roastSchedule } from "./index";

interface Row { name: string; ok: boolean; mocked?: boolean; ms: number; note: string }
const rows: Row[] = [];

async function check(name: string, fn: () => Promise<{ mocked?: boolean; note: string; ok: boolean }>) {
  const t = Date.now();
  try {
    const r = await fn();
    rows.push({ name, ok: r.ok, mocked: r.mocked, ms: Date.now() - t, note: r.note });
  } catch (e) {
    rows.push({ name, ok: false, ms: Date.now() - t, note: `THREW: ${(e as Error).message}` });
  }
}

const pack: CoursePack = cs1332Pack;
const ids = new Set(pack.concepts.map((c) => c.id));
const srcIds = new Set(pack.sources.map((s) => s.id));
let questions: Question[] = [];

async function main() {
  console.log(`ai-tools selfcheck on ${pack.course.code} (XAI_API_KEY ${process.env.XAI_API_KEY ? "set: LIVE Grok" : "not set: mock fallback"})\n`);

  await check("generateExam(pack, 6)", async () => {
    const e = await generateExam(pack, 6);
    questions = e.questions;
    const ok =
      e.questions.length >= 1 &&
      e.questions.every(
        (q) => q.prompt && q.answer && ids.has(q.conceptId) && (q.type === "short" || (q.choices?.length === 4 && q.choices.includes(q.answer))),
      );
    return { ok, mocked: e.mocked, note: `${e.questions.length} questions (${e.questions.filter((q) => q.type === "mcq").length} mcq), "${e.title}"` };
  });

  await check("generateExam(pack, 3, [avl-trees])", async () => {
    const e = await generateExam(pack, 3, ["avl-trees"]);
    return { ok: e.questions.length >= 1, mocked: e.mocked, note: `${e.questions.length} questions` };
  });

  await check("gradeAnswer(mcq, correct)", async () => {
    const q = questions.find((x) => x.type === "mcq") ?? questions[0];
    const g = await gradeAnswer(q, q.answer);
    return { ok: g.correct && g.score === 1 && !!g.feedback, mocked: g.mocked, note: `score ${g.score}` };
  });

  await check("gradeAnswer(mcq, wrong)", async () => {
    const q = questions.find((x) => x.type === "mcq") ?? questions[0];
    const wrong = q.choices?.find((c) => c !== q.answer) ?? "definitely not it";
    const g = await gradeAnswer(q, wrong);
    return { ok: !g.correct && g.score === 0 && !!g.feedback, mocked: g.mocked, note: `score ${g.score}` };
  });

  await check("gradeAnswer(short, partial)", async () => {
    const q = questions.find((x) => x.type === "short") ?? { ...questions[0], type: "short" as const };
    const g = await gradeAnswer(q, q.answer.split(" ").slice(0, 8).join(" "));
    return { ok: g.score >= 0 && g.score <= 1 && !!g.feedback, mocked: g.mocked, note: `score ${g.score}` };
  });

  await check("gradeAnswer(blank)", async () => {
    const g = await gradeAnswer(questions[0], "");
    return { ok: !g.correct && g.score === 0 && !!g.feedback, mocked: g.mocked, note: "blank -> 0" };
  });

  await check("generatePlan(pack, +6 days, 2h)", async () => {
    const d = new Date(Date.now() + 6 * 86_400_000);
    const exam = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const p = await generatePlan(pack, exam, 2);
    const last = p.days[p.days.length - 1];
    const ok =
      p.days.length === 7 &&
      last.date === exam &&
      p.days.every((x) => x.minutes === 120 && x.tasks.length > 0 && x.conceptIds.every((c) => ids.has(c)));
    return { ok, mocked: p.mocked, note: `${p.days.length} days, last ${last.date}: "${last.tasks[0]?.slice(0, 50)}"` };
  });

  await check("generatePlan(bad date) never throws", async () => {
    const p = await generatePlan(pack, "not-a-date", 1);
    return { ok: p.days.length >= 1, mocked: p.mocked, note: `${p.days.length} days` };
  });

  await check("draftOutreach(pack, professor, name, formal)", async () => {
    const prof = pack.professors[0]?.name ?? "Professor Smith";
    const o = await draftOutreach(pack, prof, "Alex", "formal");
    return { ok: !!o.subject && o.body.length > 40 && o.mailto.startsWith("mailto:") && o.mailto.includes("subject="), mocked: o.mocked, note: `"${o.subject}" to=${o.to ?? "(none)"}` };
  });

  await check("courseChat(pack, [question])", async () => {
    const c = await courseChat(pack, [{ role: "user", content: "How hard are AVL trees on the exam?" }]);
    return { ok: !!c.reply && c.citedSourceIds.every((s) => srcIds.has(s)), mocked: c.mocked, note: `${c.reply.length} chars, cites [${c.citedSourceIds.join(",")}]` };
  });

  await check("courseChat(empty messages)", async () => {
    const c = await courseChat(pack, []);
    return { ok: !!c.reply, mocked: c.mocked, note: "greeting" };
  });

  await check("roastSchedule([1332, 1554])", async () => {
    const r = await roastSchedule([pack, math1554Pack]);
    const ok = r.survivalOdds >= 0 && r.survivalOdds <= 100 && !!r.verdict && r.perCourse.length === 2;
    return { ok, mocked: r.mocked, note: `odds ${r.survivalOdds}, ${r.perCourse.length} lines` };
  });

  // cageMatch is owned by another agent; check it only once versus.ts exists.
  await check("cageMatch(1332, 1554)", async () => {
    const mod = "./versus";
    let m: { cageMatch?: (a: CoursePack, b: CoursePack) => Promise<{ rounds: { winner: string }[]; champion: string; mocked: boolean }> };
    try {
      m = await import(mod);
    } catch {
      return { ok: true, note: "SKIPPED (versus.ts not on main yet)" };
    }
    if (!m.cageMatch) return { ok: true, note: "SKIPPED (no cageMatch export yet)" };
    const r = await m.cageMatch(pack, math1554Pack);
    const codes = new Set([pack.course.code, math1554Pack.course.code]);
    return { ok: r.rounds.length >= 1 && r.rounds.every((x) => codes.has(x.winner)) && codes.has(r.champion), mocked: r.mocked, note: `${r.rounds.length} rounds, champion ${r.champion}` };
  });

  const w = Math.max(...rows.map((r) => r.name.length));
  for (const r of rows) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(w)}  mocked=${String(r.mocked ?? "-").padEnd(5)}  ${String(r.ms).padStart(5)}ms  ${r.note}`);
  }
  const failed = rows.filter((r) => !r.ok).length;
  console.log(`\n${rows.length - failed}/${rows.length} passed`);
  process.exit(failed ? 1 : 0);
}

main();
