/**
 * Lane: ai-tools. Self-check: calls every ai-tools function on the CS 1332 seed and prints PASS/FAIL + mocked flag.
 * Run:  npx tsx lib/ai-tools/selfcheck.ts          (no XAI_API_KEY needed; with a key it exercises live Grok)
 * Exit code is 1 if any check fails.
 */
import type { CoursePack, Question } from "@/shared/contract";
import { cs1332Pack, math1554Pack } from "@/lib/data";
import { generateExam, gradeAnswer, generatePlan, courseChat, draftOutreach, roastSchedule, cageMatch } from "./index";

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

  await check("cageMatch(1332, 1554)", async () => {
    const r = await cageMatch(pack, math1554Pack);
    const codes = new Set([pack.course.code, math1554Pack.course.code]);
    return { ok: r.rounds.length >= 1 && r.rounds.every((x) => codes.has(x.winner)) && codes.has(r.champion), mocked: r.mocked, note: `${r.rounds.length} rounds, champion ${r.champion}` };
  });

  // ---- edge cases: none of these may throw ----
  const empty = { ...pack, concepts: [], examTopics: [], difficulty: [], sources: [], studentQuotes: [], professors: [], tips: [] } as CoursePack;
  await check("edge: generateExam(empty pack)", async () => {
    const e = await generateExam(empty, 6);
    return { ok: Array.isArray(e.questions), mocked: e.mocked, note: `${e.questions.length} questions` };
  });
  await check("edge: generateExam(count=0 / NaN / 99)", async () => {
    const out = await Promise.all([generateExam(pack, 0), generateExam(pack, NaN), generateExam(pack, 99)]);
    return { ok: out.every((e) => e.questions.length >= 1 && e.questions.length <= 12), mocked: out[0].mocked, note: out.map((e) => e.questions.length).join("/") };
  });
  await check("edge: generatePlan(empty pack)", async () => {
    const p = await generatePlan(empty, "2099-01-01", 2);
    return { ok: Array.isArray(p.days) && p.days.length >= 1, mocked: p.mocked, note: `${p.days.length} days` };
  });
  await check("edge: generatePlan(hours 0 / -5 / NaN)", async () => {
    const out = await Promise.all([generatePlan(pack, "2099-01-01", 0), generatePlan(pack, "2099-01-01", -5), generatePlan(pack, "2099-01-01", NaN)]);
    return { ok: out.every((p) => p.days.every((d) => d.minutes >= 15 && d.minutes <= 720)), mocked: out[0].mocked, note: "minutes clamped 15..720" };
  });
  await check("edge: draftOutreach(empty pack, no professor)", async () => {
    const o = await draftOutreach(empty);
    return { ok: o.mailto.startsWith("mailto:") && !!o.body, mocked: o.mocked, note: `to=${o.to ?? "(none)"}` };
  });
  await check("edge: courseChat(empty pack / assistant-only msgs)", async () => {
    const a = await courseChat(empty, [{ role: "user", content: "what is on the exam?" }]);
    const b = await courseChat(pack, [{ role: "assistant", content: "hi" }]);
    return { ok: !!a.reply && !!b.reply, mocked: a.mocked, note: "replies produced" };
  });
  await check("edge: roastSchedule([]) / cageMatch(same, same)", async () => {
    const r = await roastSchedule([]);
    const c = await cageMatch(pack, pack);
    return { ok: !!r.verdict && c.rounds.length >= 1, mocked: r.mocked, note: `odds ${r.survivalOdds}` };
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
