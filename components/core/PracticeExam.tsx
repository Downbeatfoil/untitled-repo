"use client";
/**
 * Lane: components. Practice exam runner: postExam → one question at a time → postGrade → feedback →
 * final score card with per-concept breakdown. Works with mocked API responses.
 */
import { useCallback, useEffect, useState } from "react";
import { postExam, postGrade } from "@/lib/api-client";
import type { Concept, GradeResponse, PracticeExam as PracticeExamData, Question } from "@/shared/contract";
import Badge from "./Badge";
import Button from "./Button";
import Fx from "./Fx";
import Skeleton from "./Skeleton";

export interface PracticeExamProps {
  courseCode: string;
  /** Used to show concept names in the breakdown (falls back to the concept id). */
  concepts?: Concept[];
  count?: number;
  conceptIds?: string[];
  onFinish?: (result: { score: number; total: number }) => void;
}

interface Answered {
  question: Question;
  userAnswer: string;
  grade: GradeResponse;
}

const DIFF_TONE = { easy: "green", medium: "amber", hard: "red" } as const;

function prettify(id: string) {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PracticeExam({ courseCode, concepts = [], count, conceptIds, onFinish }: PracticeExamProps) {
  const [exam, setExam] = useState<PracticeExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<string>("");
  const [text, setText] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [current, setCurrent] = useState<Answered | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setExam(null);
    setIdx(0);
    setAnswers([]);
    setCurrent(null);
    setChoice("");
    setText("");
    try {
      setExam(await postExam({ courseCode, count, conceptIds }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't build the exam");
    } finally {
      setLoading(false);
    }
  }, [courseCode, count, conceptIds]);

  useEffect(() => {
    load();
  }, [load]);

  const label = (id: string) => concepts.find((c) => c.id === id)?.label ?? prettify(id);

  if (loading)
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Building practice exam">
        <p className="text-sm text-[#B3A369]">Grok is writing questions in the style of real past exams…</p>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );

  if (error || !exam || exam.questions.length === 0)
    return (
      <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-200">
        <p>{error ?? "No questions came back."}</p>
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={load}>
            Try again
          </Button>
        </div>
      </div>
    );

  const total = exam.questions.length;

  /* ---------- final score card ---------- */
  if (answers.length === total && !current) {
    const score = answers.reduce((s, a) => s + a.grade.score, 0);
    const pct = Math.round((score / total) * 100);
    const byConcept = new Map<string, { got: number; n: number }>();
    for (const a of answers) {
      const e = byConcept.get(a.question.conceptId) ?? { got: 0, n: 0 };
      e.got += a.grade.score;
      e.n += 1;
      byConcept.set(a.question.conceptId, e);
    }
    const verdict = pct >= 85 ? "Exam-ready 🔥" : pct >= 60 ? "Getting there" : "Keep drilling";
    return (
      <div className="sp-fly-in space-y-6">
        <Fx />
        <div className="rounded-2xl border border-[#B3A369]/40 bg-gradient-to-b from-[#B3A369]/10 to-transparent p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[#B3A369]">Final score</p>
          <p className="mt-1 text-6xl font-extrabold tabular-nums text-white">
            {Math.round(score * 10) / 10}
            <span className="text-3xl text-neutral-500"> / {total}</span>
          </p>
          <p className="mt-1 text-lg font-semibold text-[#7FB0FF]">
            {pct}% · {verdict}
          </p>
          {exam.mocked && <p className="mt-1 text-xs text-neutral-500">Demo questions</p>}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">By concept</h3>
          <ul className="space-y-3">
            {[...byConcept.entries()].map(([id, v]) => {
              const p = Math.round((v.got / v.n) * 100);
              return (
                <li key={id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-neutral-200">{label(id)}</span>
                    <span className="tabular-nums text-neutral-400">
                      {Math.round(v.got * 10) / 10}/{v.n} · {p}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${p >= 70 ? "bg-emerald-400" : p >= 40 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${Math.max(3, p)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <details className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <summary className="cursor-pointer text-sm text-neutral-300">Review all questions</summary>
          <ol className="mt-3 space-y-3 text-sm">
            {answers.map((a, i) => (
              <li key={a.question.id} className="border-t border-white/5 pt-3">
                <p className="text-neutral-200">
                  {i + 1}. {a.question.prompt}
                </p>
                <p className={a.grade.correct ? "text-emerald-300" : "text-rose-300"}>Your answer: {a.userAnswer || "—"}</p>
                {!a.grade.correct && <p className="text-neutral-400">Answer: {a.question.answer}</p>}
              </li>
            ))}
          </ol>
        </details>
        <div className="flex justify-center">
          <Button variant="blue" onClick={load}>
            New practice exam
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- question view ---------- */
  const q = exam.questions[idx];
  const userAnswer = q.type === "mcq" ? choice : text.trim();
  const answered = current !== null;

  async function submit() {
    if (!userAnswer || grading || answered) return;
    setGrading(true);
    setGradeError(null);
    let grade: GradeResponse;
    try {
      grade = await postGrade({ courseCode, question: q, userAnswer });
    } catch (e) {
      if (q.type === "mcq") {
        // Never block the demo: grade multiple choice locally if the API is down.
        const ok = userAnswer === q.answer;
        grade = { correct: ok, score: ok ? 1 : 0, feedback: q.explanation, mocked: true };
      } else {
        setGradeError(e instanceof Error ? e.message : "Grading failed");
        setGrading(false);
        return;
      }
    }
    setCurrent({ question: q, userAnswer, grade });
    setGrading(false);
  }

  function next() {
    if (!current) return;
    const all = [...answers, current];
    setAnswers(all);
    setCurrent(null);
    setChoice("");
    setText("");
    setGradeError(null);
    if (idx + 1 < total) setIdx(idx + 1);
    else onFinish?.({ score: all.reduce((s, a) => s + a.grade.score, 0), total });
  }

  const g = current?.grade;
  return (
    <div className="space-y-5">
      <Fx />
      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-neutral-400">
          <span>
            Question <b className="text-white">{idx + 1}</b> of {total}
          </span>
          <span className="flex gap-2">
            <Badge tone="blue">{label(q.conceptId)}</Badge>
            <Badge tone={DIFF_TONE[q.difficulty]}>{q.difficulty}</Badge>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={idx + (answered ? 1 : 0)}>
          <div className="h-full rounded-full bg-gradient-to-r from-[#B3A369] to-[#2D7DFF] transition-all" style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
        </div>
      </div>

      <div key={q.id} className="sp-fly-in space-y-4">
        <h3 className="text-xl font-semibold leading-snug text-white">{q.prompt}</h3>

        {q.type === "mcq" ? (
          <div role="radiogroup" aria-label="Answer choices" className="space-y-2">
            {(q.choices ?? []).map((c, i) => {
              const picked = choice === c;
              const isAnswer = answered && c === q.answer;
              const wrongPick = answered && picked && !g?.correct;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  disabled={answered || grading}
                  onClick={() => setChoice(c)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF] ${
                    isAnswer
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                      : wrongPick
                        ? "border-rose-400/60 bg-rose-400/10 text-rose-100"
                        : picked
                          ? "border-[#2D7DFF] bg-[#2D7DFF]/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-neutral-200 hover:border-[#B3A369]/50 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={answered || grading}
            rows={5}
            aria-label="Your answer"
            placeholder="Write your answer…"
            className="w-full rounded-xl border border-white/10 bg-[#0d0f14] p-3.5 text-white placeholder-neutral-600 outline-none transition focus:border-[#2D7DFF] disabled:opacity-70"
          />
        )}

        {gradeError && (
          <p role="alert" className="text-sm text-rose-300">
            {gradeError}
          </p>
        )}

        {!answered ? (
          <Button onClick={submit} loading={grading} disabled={!userAnswer}>
            {grading ? "Grok is grading…" : "Submit answer"}
          </Button>
        ) : (
          g && (
            <div
              role="status"
              className={`sp-fly-in space-y-2 rounded-xl border p-4 ${g.correct ? "border-emerald-400/40 bg-emerald-400/10" : g.score > 0 ? "border-amber-400/40 bg-amber-400/10" : "border-rose-400/40 bg-rose-400/10"}`}
            >
              <p className={`font-semibold ${g.correct ? "text-emerald-300" : g.score > 0 ? "text-amber-300" : "text-rose-300"}`}>
                {g.correct ? "✓ Correct" : g.score > 0 ? `◐ Partial credit (${Math.round(g.score * 100)}%)` : "✗ Not quite"}
              </p>
              <p className="text-sm text-neutral-200">{g.feedback}</p>
              <p className="text-sm text-neutral-400">
                <b className="text-neutral-300">Explanation:</b> {q.explanation}
              </p>
              {!g.correct && q.type === "short" && (
                <p className="text-sm text-neutral-400">
                  <b className="text-neutral-300">Model answer:</b> {q.answer}
                </p>
              )}
              <div className="pt-1">
                <Button variant="blue" onClick={next}>
                  {idx + 1 < total ? "Next question →" : "See my score →"}
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
