"use client";
/** Lane: pages. Course dashboard tabs: exam, plan, outreach, chat. All via lib/api-client helpers. */
import { useRef, useState, useEffect } from "react";
import { exportUrl, postChat, postExam, postGrade, postOutreach, postPlan } from "@/lib/api-client";
import type { ChatMessage, CoursePack, GradeResponse, OutreachDraft, PracticeExam, Question, StudyPlan } from "@/shared/contract";
import { ErrorBox } from "./ui";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Request failed");

/* ---------------- Practice exam ---------------- */
export function ExamTab({ pack }: { pack: CoursePack }) {
  const code = pack.course.code;
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, GradeResponse>>({});
  const [grading, setGrading] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setError(null); setGrades({}); setAnswers({});
    try { setExam(await postExam({ courseCode: code, count: 6 })); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }
  async function grade(q: Question) {
    const a = answers[q.id]; if (!a?.trim()) return;
    setGrading(q.id);
    try { const g = await postGrade({ courseCode: code, question: q, userAnswer: a }); setGrades((p) => ({ ...p, [q.id]: g })); }
    catch (e) { setError(errMsg(e)); } finally { setGrading(null); }
  }

  const gradedList = Object.values(grades);
  const total = exam?.questions.length ?? 0;
  const score = gradedList.reduce((s, g) => s + g.score, 0);

  if (!exam) return (
    <div className="card p-8 text-center">
      <div className="text-4xl">📝</div>
      <h3 className="mt-3 text-xl font-bold">Practice exam in the style of real past exams</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm text-muted">6 questions weighted toward the topics that appear most on past exams. Grok grades your answers and explains every miss.</p>
      {error && <p className="mt-3 text-sm text-bad">{error}</p>}
      <button className="btn btn-gold mt-5" onClick={generate} disabled={loading}>{loading ? "Grok is writing your exam…" : "Generate practice exam"}</button>
      {loading && <div className="mx-auto mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-line"><div className="skeleton h-full w-full" /></div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-lg font-bold">{exam.title}</div>{exam.mocked && <span className="badge border-line2 text-dim">sample questions</span>}</div>
        <button className="btn btn-ghost" onClick={generate} disabled={loading}>{loading ? "Regenerating…" : "New exam"}</button>
      </div>
      {error && <ErrorBox message={error} onRetry={() => setError(null)} />}
      {gradedList.length === total && total > 0 && (
        <div className="card anim-up flex items-center gap-5 border-[rgba(179,163,105,0.5)] p-5">
          <div className="text-4xl font-extrabold text-gradient">{Math.round((score / total) * 100)}%</div>
          <div><div className="font-bold">Score card</div><div className="text-sm text-muted">{score.toFixed(1)} / {total} points · {gradedList.filter((g) => g.correct).length} fully correct</div></div>
        </div>
      )}
      {exam.questions.map((q, i) => {
        const g = grades[q.id];
        return (
          <div key={q.id} className="card p-5 anim-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-2"><span className="mono text-xs text-gold">Q{i + 1}</span><span className="badge border-line2 text-muted">{q.type}</span><span className="badge border-line2 text-muted">{q.difficulty}</span></div>
            <p className="mt-2 font-medium leading-relaxed">{q.prompt}</p>
            {q.type === "mcq" && q.choices ? (
              <div className="mt-3 grid gap-2">
                {q.choices.map((c) => (
                  <label key={c} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${answers[q.id] === c ? "border-gold bg-[rgba(179,163,105,0.1)]" : "border-line hover:border-line2"}`}>
                    <input type="radio" name={q.id} className="accent-[#b3a369]" disabled={!!g} checked={answers[q.id] === c} onChange={() => setAnswers((p) => ({ ...p, [q.id]: c }))} />
                    {c}
                  </label>
                ))}
              </div>
            ) : (
              <textarea className="input mt-3 min-h-[90px]" placeholder="Type your answer…" disabled={!!g} value={answers[q.id] ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} />
            )}
            {!g ? (
              <button className="btn btn-blue mt-3" disabled={!answers[q.id]?.trim() || grading === q.id} onClick={() => grade(q)}>{grading === q.id ? "Grok is grading…" : "Check answer"}</button>
            ) : (
              <div className="anim-in mt-3 rounded-lg border p-3 text-sm" style={{ borderColor: g.correct ? "#3ddc9755" : "#ff5d6c55", background: g.correct ? "#3ddc9712" : "#ff5d6c12" }}>
                <b style={{ color: g.correct ? "#3ddc97" : "#ff5d6c" }}>{g.correct ? "✓ Correct" : g.score > 0 ? `◐ Partial (${Math.round(g.score * 100)}%)` : "✗ Not quite"}</b>
                <p className="mt-1 text-muted">{g.feedback}</p>
                {!g.correct && <p className="mt-2 text-xs text-dim">Model answer: <span className="text-foreground">{q.answer}</span></p>}
                <p className="mt-2 text-xs text-dim">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Study plan ---------------- */
function plusDays(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

export function PlanTab({ pack }: { pack: CoursePack }) {
  const code = pack.course.code;
  const [examDate, setExamDate] = useState(plusDays(10));
  const [hours, setHours] = useState(2);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = new Map(pack.concepts.map((c) => [c.id, c.label]));

  async function build() {
    setLoading(true); setError(null);
    try { setPlan(await postPlan({ courseCode: code, examDate, hoursPerDay: hours })); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }
  return (
    <div className="space-y-5">
      <div className="card grid items-end gap-4 p-5 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm text-muted">Exam date<input type="date" className="input mt-1.5" min={plusDays(1)} value={examDate} onChange={(e) => setExamDate(e.target.value)} /></label>
        <label className="text-sm text-muted">Hours per day: <b className="text-goldb">{hours}h</b><input type="range" min={0.5} max={8} step={0.5} className="mt-3.5 w-full accent-[#b3a369]" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
        <button className="btn btn-gold" onClick={build} disabled={loading || !examDate}>{loading ? "Planning…" : "Build my plan"}</button>
      </div>
      {error && <ErrorBox message={error} onRetry={build} />}
      {plan && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-bold">{plan.days.length}-day plan {plan.mocked && <span className="badge ml-2 border-line2 text-dim">sample</span>}</div>
            <a className="btn btn-blue" href={exportUrl(code, "ics", `&examDate=${examDate}&hoursPerDay=${hours}`)} download>📅 Add to calendar (.ics)</a>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.days.map((d, i) => (
              <div key={d.date} className="card anim-up p-4" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <div className="flex items-center justify-between"><span className="mono text-sm font-semibold text-goldb">{new Date(d.date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><span className="mono text-xs text-dim">{d.minutes} min</span></div>
                <div className="mt-2 flex flex-wrap gap-1.5">{d.conceptIds.map((c) => <span key={c} className="badge border-line2 text-muted normal-case tracking-normal">{label.get(c) ?? c}</span>)}</div>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">{d.tasks.map((t, j) => <li key={j} className="flex gap-2"><span className="text-gold">▸</span>{t}</li>)}</ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Outreach ---------------- */
export function OutreachTab({ pack }: { pack: CoursePack }) {
  const code = pack.course.code;
  const [prof, setProf] = useState(pack.professors[0]?.name ?? "");
  const [student, setStudent] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly">("friendly");
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function make() {
    setLoading(true); setError(null);
    try { setDraft(await postOutreach({ courseCode: code, professorName: prof || "Professor", studentName: student || undefined, tone })); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="card space-y-4 p-5">
        <div><div className="font-bold">Ask for past exams, politely</div><p className="mt-1 text-sm text-muted">Grok drafts the email. You review it and hit send in your own mail app. Nothing is sent automatically.</p></div>
        <label className="block text-sm text-muted">Professor<input className="input mt-1.5" list="profs" value={prof} onChange={(e) => setProf(e.target.value)} /><datalist id="profs">{pack.professors.map((p) => <option key={p.name} value={p.name} />)}</datalist></label>
        <label className="block text-sm text-muted">Your name (optional)<input className="input mt-1.5" value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Buzz Burdell" /></label>
        <div className="flex gap-2">{(["friendly", "formal"] as const).map((t) => <button key={t} onClick={() => setTone(t)} className={`chip capitalize ${tone === t ? "!border-gold !text-goldb" : ""}`}>{t}</button>)}</div>
        <button className="btn btn-gold w-full" onClick={make} disabled={loading}>{loading ? "Drafting…" : "Draft email"}</button>
      </div>
      <div>
        {error && <ErrorBox message={error} onRetry={make} />}
        {!draft && !error && <div className="card flex h-full min-h-[260px] items-center justify-center p-8 text-center text-sm text-dim">Your draft will appear here.</div>}
        {draft && (
          <div className="card anim-up overflow-hidden">
            <div className="space-y-1 border-b border-line bg-[rgba(255,255,255,0.02)] p-4 text-sm">
              <div><span className="text-dim">To:</span> {draft.to || prof || "—"}</div>
              <div><span className="text-dim">Subject:</span> <b>{draft.subject}</b></div>
            </div>
            <pre className="whitespace-pre-wrap p-5 font-sans text-sm leading-relaxed text-muted">{draft.body}</pre>
            <div className="flex flex-wrap items-center gap-3 border-t border-line p-4">
              <a className="btn btn-blue" href={draft.mailto}>✉️ Open in mail app</a>
              <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(`${draft.subject}\n\n${draft.body}`)}>Copy text</button>
              <span className="text-xs text-dim">A human sends this. We never auto-send.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Chat ---------------- */
export function ChatTab({ pack }: { pack: CoursePack }) {
  const code = pack.course.code;
  const [msgs, setMsgs] = useState<(ChatMessage & { cited?: string[] })[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [msgs.length, loading]);
  const suggestions = [`What's on the exam?`, `What should I study first?`, `Which topic do students struggle with most?`];

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next); setInput(""); setLoading(true); setError(null);
    try {
      const r = await postChat({ courseCode: code, messages: next.map(({ role, content }) => ({ role, content })) });
      setMsgs([...next, { role: "assistant", content: r.reply, cited: r.citedSourceIds }]);
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }
  const srcIdx = new Map(pack.sources.map((s, i) => [s.id, { s, n: i + 1 }]));
  return (
    <div className="card flex h-[560px] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-4xl">💬</div>
            <div className="mt-2 font-bold">Ask the course</div>
            <p className="mt-1 max-w-sm text-sm text-muted">Answers are grounded in the {code} pack and cite their sources.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">{suggestions.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""} anim-up`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-[rgba(61,139,255,0.18)] border border-[rgba(61,139,255,0.4)]" : "border border-line bg-[rgba(255,255,255,0.03)] text-muted"}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.cited && m.cited.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">{m.cited.map((id) => { const x = srcIdx.get(id); return x ? <a key={id} href={x.s.url} target="_blank" rel="noreferrer" className="badge border-line2 text-goldb hover:border-gold" title={x.s.title}>[{x.n}] {x.s.kind}</a> : null; })}</div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-dim cursor-blink">Grok is thinking</div>}
        {error && <p className="text-sm text-bad">{error}</p>}
        <div ref={end} />
      </div>
      <form className="flex gap-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input className="input" placeholder={`Ask anything about ${code}…`} value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn btn-gold" disabled={loading || !input.trim()}>Send</button>
      </form>
    </div>
  );
}
