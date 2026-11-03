"use client";
/** Lane: lab. Schedule Roast: pick 3–5 courses → survival odds, verdict, one roast per course, plan links. */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CourseSummary } from "@/shared/contract";
import { courseSlug, normalizeCourseCode } from "@/shared/contract";
import { SemesterHeat } from "@/components/viz";
import { useToast } from "@/components/core/Toast";
import LabStyles from "./LabStyles";
import SurvivalMeter, { oddsColor } from "./SurvivalMeter";
import { copyText, useCountUp, useTypewriter } from "./hooks";
import { postRoast } from "./labClient";
import type { RoastResult } from "./roastMock";

const MIN = 3, MAX = 5;
const CODE_RE = /^[A-Z]{2,4} \d{4}[A-Z]?$/;
const fearHue = (f: number) => (f >= 80 ? "#ff5d6c" : f >= 65 ? "#ffb547" : f >= 45 ? "#d6c78a" : "#3ddc97");

function shareText(r: RoastResult): string {
  const lines = r.perCourse.map((p) => `• ${p.code}: ${p.line}`).join("\n");
  return `🔥 I got my GT schedule roasted by Grok.\nSurvival odds: ${r.survivalOdds}% · Total fear: ${r.totalFear}\n"${r.verdict}"\n\n${lines}\n\nRoast yours → SmartPath Scout /roast`;
}

export default function RoastClient({ courses }: { courses: CourseSummary[] }) {
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [autoGo, setAutoGo] = useState<string[] | null>(null);
  const resRef = useRef<HTMLDivElement>(null);
  // Deep link: /roast?c=CS%201332,MATH%201554 prefills the schedule.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).getAll("c").flatMap((v) => v.split(","));
    const codes = [...new Set(raw.map(normalizeCourseCode).filter((c) => CODE_RE.test(c)))].slice(0, MAX);
    if (codes.length) { setPicked(codes); if (new URLSearchParams(window.location.search).get("go") === "1") setAutoGo([...codes]); }
  }, []);
  useEffect(() => { if (autoGo) { void roast(autoGo); setAutoGo(null); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGo]);
  const byCode = useMemo(() => new Map(courses.map((c) => [c.code, c])), [courses]);

  const add = (raw: string) => {
    const code = normalizeCourseCode(raw);
    if (!CODE_RE.test(code)) { setErr(`"${raw.trim()}" doesn't look like a course code. Try "CS 1332".`); return; }
    if (picked.includes(code)) { setErr(`${code} is already in your schedule.`); return; }
    if (picked.length >= MAX) { setErr(`Max ${MAX} courses. Even Grok has limits.`); return; }
    setErr(null); setPicked((p) => [...p, code]); setText("");
  };
  const toggle = (code: string) => {
    setErr(null);
    setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : p.length >= MAX ? (setErr(`Max ${MAX} courses.`), p) : [...p, code]));
  };
  const brutal = () => {
    const top = courses.slice(0, 8).map((c) => c.code);
    const pick = [...top].sort(() => Math.random() - 0.5).slice(0, 4);
    setPicked(pick); setErr(null);
  };

  async function roast(list: string[] = picked) {
    if (list.length < 1 || (list === picked && list.length < MIN)) return;
    setLoading(true); setErr(null); setResult(null);
    const t0 = Date.now();
    try {
      const r = await postRoast(list);
      const wait = Math.max(0, 1500 - (Date.now() - t0)); // let the "Grok is cooking" beat land
      await new Promise((res) => setTimeout(res, wait));
      setResult(r);
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (e) {
      setErr((e as Error).message || "The roast fizzled. Try again.");
    } finally { setLoading(false); }
  }

  const ready = picked.length >= MIN;
  const need = MIN - picked.length;

  return (
    <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <LabStyles />
      <div aria-hidden className="lab-grid pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <header className="lab-rise relative text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#9a9ca3]">Schedule Roast</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-white sm:text-6xl">How cooked is <span className="text-[#d6c78a]">your semester?</span></h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-[#8a96aa]">Pick {MIN}–{MAX} Georgia Tech classes. Grok scores your survival odds, then roasts every one of them. Gently. Mostly.</p>
      </header>

      <section className="card lab-rise delay-2 relative mt-8 p-5 sm:p-7" aria-label="Pick your schedule">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8a96aa]">Your schedule · <span className="text-white">{picked.length}</span>/{MAX}</h2>
          <button type="button" onClick={brutal} className="chip" aria-label="Fill a random brutal schedule">🎲 Random brutal schedule</button>
        </div>

        <div className="mt-3 flex min-h-[64px] flex-wrap gap-2 rounded-xl border border-dashed border-[#2a3548] bg-black/20 p-3" aria-live="polite">
          {picked.length === 0 && <span className="self-center text-sm text-[#5b6679]">Tap courses below or type your own…</span>}
          {picked.map((code) => {
            const f = byCode.get(code)?.fearScore;
            return (
              <button key={code} type="button" onClick={() => toggle(code)} title="Remove" className="lab-pop group inline-flex items-center gap-2 rounded-xl border border-[#B3A369]/50 bg-[#B3A369]/10 px-3 py-1.5 text-sm font-bold text-[#f1e6b4] transition hover:border-[#ff5d6c]/70 hover:bg-[#ff5d6c]/10 hover:text-[#ff9aa4]">
                {f !== undefined && <span className="h-2 w-2 rounded-full" style={{ background: fearHue(f) }} />}
                {code}<span className="text-[#8a96aa] group-hover:text-[#ff9aa4]">✕</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {courses.map((c) => {
            const on = picked.includes(c.code);
            return (
              <button key={c.code} type="button" onClick={() => toggle(c.code)} aria-pressed={on} title={`${c.title} · fear ${Math.round(c.fearScore)}`}
                className={`chip ${on ? "!border-[#B3A369] !bg-[#B3A369]/15 !text-[#f1e6b4]" : ""}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: fearHue(c.fearScore) }} />
                {c.code}
                <span className="text-[11px] text-[#5b6679]">{Math.round(c.fearScore)}</span>
              </button>
            );
          })}
        </div>

        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) add(text); }}>
          <input className="input" value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} placeholder="Add any course… e.g. ISYE 3770" aria-label="Add a course code" maxLength={14} />
          <button type="submit" className="btn btn-ghost" disabled={!text.trim()}>Add</button>
        </form>
        {err && <p role="alert" className="mt-3 rounded-lg border border-[#ff5d6c]/40 bg-[#ff5d6c]/10 px-3 py-2 text-sm text-[#ff9aa4]">{err}</p>}

        <button type="button" onClick={() => roast()} disabled={!ready || loading}
          className="btn btn-gold lab-btn-big mt-5 w-full !py-4 text-lg font-black tracking-wide">
          {loading ? <span className="inline-flex items-center gap-3">Grok is heating the grill<span className="lab-dots"><span /><span /><span /></span></span>
            : ready ? "Roast my schedule" : `Pick ${need} more course${need > 1 ? "s" : ""} to roast`}
        </button>
      </section>

      {loading && (
        <div className="card mt-6 grid place-items-center gap-3 p-10 text-center lab-rise" aria-busy>
          <div className="text-5xl lab-float">🔥</div>
          <p className="text-sm text-[#8a96aa]">Reading past exams · counting 3 AM Reddit posts · sharpening insults…</p>
        </div>
      )}

      {result && <Result key={result.verdict + result.survivalOdds} r={result} onCopy={async () => { const ok = await copyText(shareText(result)); toast(ok ? "Roast copied. Post it." : "Copy this roast", { kind: ok ? "success" : "info" }); }} refEl={resRef} />}
    </div>
  );
}

function Result({ r, onCopy, refEl }: { r: RoastResult; onCopy: () => void; refEl: React.RefObject<HTMLDivElement | null> }) {
  const total = useCountUp(r.totalFear, 1400);
  const { out, done } = useTypewriter(r.verdict, true);
  const color = oddsColor(r.survivalOdds);
  const hardest = [...r.courses].sort((a, b) => b.fearScore - a.fearScore)[0];
  return (
    <div ref={refEl} className="mt-8 scroll-mt-20">
      <section className="card lab-rise relative overflow-hidden p-6 sm:p-9" style={{ boxShadow: `0 30px 90px -40px ${color}88` }} aria-label="Roast result">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#3d8bff]/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#B3A369]/15 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-[300px_1fr]">
          <SurvivalMeter odds={r.survivalOdds} />
          <div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total fear" value={String(total)} accent="#ffb547" />
              <Stat label="Avg per class" value={String(r.avgFear)} accent="#d6c78a" />
              <Stat label="Boss class" value={hardest?.code ?? "—"} accent="#ff5d6c" small />
            </div>
            <p className="eyebrow mt-6">Grok&apos;s verdict</p>
            <p className={`mt-2 min-h-[5.5rem] text-xl font-semibold leading-snug text-white sm:text-2xl ${done ? "" : "lab-caret"}`}>“{out}{done ? "”" : ""}</p>
            {r.mocked && <p className="mt-2 text-[11px] uppercase tracking-widest text-[#5b6679]">Demo roast · seed data (no live AI call)</p>}
          </div>
        </div>
      </section>

      <h2 className="eyebrow mt-10">The roast, class by class</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {r.courses.map((c, i) => {
          const line = r.perCourse.find((p) => p.code === c.code)?.line ?? "";
          const hue = fearHue(c.fearScore);
          return (
            <article key={c.code} className="card card-hover lab-rise relative overflow-hidden p-5" style={{ animationDelay: `${0.12 * i + 0.1}s` }}>
              <div aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: hue, boxShadow: `0 0 18px ${hue}` }} />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-white">{c.code}</p>
                  <p className="truncate text-xs text-[#8a96aa]">{c.title}</p>
                </div>
                <div className="text-right"><p className="text-2xl font-black tabular-nums" style={{ color: hue }}>{Math.round(c.fearScore)}</p><p className="text-[10px] uppercase tracking-widest text-[#5b6679]">fear</p></div>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[#e8ecf3]">{line}</p>
              <p className="mt-3 text-xs text-[#8a96aa]">Final boss: <span className="font-semibold text-[#d6c78a]">{c.hardest}</span></p>
              <Link href={`/course/${courseSlug(c.code)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#3d8bff] hover:text-[#7fb0ff]">Build my survival plan →</Link>
            </article>
          );
        })}
      </div>

      <h2 className="eyebrow mt-10">Semester heat</h2>
      <div className="mt-3"><SemesterHeat packs={r.courses.map((c) => ({ course: { code: c.code, title: c.title }, fearScore: c.fearScore }))} /></div>

      <div className="card mt-8 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-bold text-white">Don&apos;t just survive. Scout your way out.</p>
          <p className="text-sm text-[#8a96aa]">Every class has a SmartPath: concept graph, practice exams, and a day-by-day plan.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {r.courses.map((c) => <Link key={c.code} href={`/course/${courseSlug(c.code)}`} className="btn btn-gold !py-2 text-xs">{c.code} plan</Link>)}
          <button type="button" onClick={onCopy} className="btn btn-blue !py-2 text-xs">📋 Share roast</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-[#1d2634] bg-black/25 p-3 text-center">
      <p className={`${small ? "text-xl sm:text-2xl" : "text-3xl"} font-black tabular-nums`} style={{ color: accent }}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#5b6679]">{label}</p>
    </div>
  );
}
