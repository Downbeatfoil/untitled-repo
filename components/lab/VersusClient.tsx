"use client";
/** Lane: lab. Course Cage Match: two pickers → animated round-by-round battle → champion banner. */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CourseSummary } from "@/shared/contract";
import { courseSlug, normalizeCourseCode } from "@/shared/contract";
import Confetti from "@/components/core/Confetti";
import { useToast } from "@/components/core/Toast";
import LabStyles from "./LabStyles";
import { copyText, useTypewriter } from "./hooks";
import { postVersus } from "./labClient";
import type { VersusResult } from "./versusMock";

const CODE_RE = /^[A-Z]{2,4} \d{4}[A-Z]?$/;
const fearHue = (f: number) => (f >= 80 ? "#ff5d6c" : f >= 65 ? "#ffb547" : f >= 45 ? "#d6c78a" : "#3ddc97");
const hpHue = (hp: number) => (hp > 60 ? "#3ddc97" : hp > 30 ? "#ffb547" : "#ff5d6c");
const MIN_HP = 6;

function shareText(r: VersusResult): string {
  const rounds = r.rounds.map((x, i) => `R${i + 1} ${x.emoji} ${x.title}: ${x.winner}`).join("\n");
  return `🥊 COURSE CAGE MATCH: ${r.a.code} vs ${r.b.code}\n${rounds}\n🏆 Champion: ${r.champion}. ${r.championLine}\nPick your fighters → SmartPath Scout /versus`;
}

function Picker({ label, side, value, onChange, courses, other }: { label: string; side: "a" | "b"; value: string; onChange: (c: string) => void; courses: CourseSummary[]; other: string }) {
  const [text, setText] = useState("");
  const accent = side === "a" ? "#B3A369" : "#3d8bff";
  const sel = courses.find((c) => c.code === value);
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5" style={{ borderColor: value ? `${accent}66` : undefined }}>
      <div aria-hidden className="absolute -top-16 h-40 w-40 rounded-full blur-3xl" style={{ background: `${accent}22`, [side === "a" ? "left" : "right"]: -40 }} />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{label}</p>
      <p className="relative mt-1 min-h-[2.5rem] text-3xl font-black text-white">{value || <span className="text-[#5b6679]">Choose…</span>}</p>
      <p className="relative min-h-[1.25rem] truncate text-xs text-[#8a96aa]">{sel ? `${sel.title} · fear ${Math.round(sel.fearScore)}` : value ? "Custom challenger" : ""}</p>
      <div className="relative mt-3 flex flex-wrap gap-1.5">
        {courses.map((c) => (
          <button key={c.code} type="button" disabled={c.code === other} onClick={() => onChange(c.code)} aria-pressed={c.code === value}
            className={`chip !px-2.5 !py-1 !text-xs disabled:cursor-not-allowed disabled:opacity-30 ${c.code === value ? "!border-current !bg-white/10 !text-white" : ""}`} style={c.code === value ? { color: accent } : undefined}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: fearHue(c.fearScore) }} />{c.code}
          </button>
        ))}
      </div>
      <form className="relative mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const c = normalizeCourseCode(text); if (CODE_RE.test(c)) { onChange(c); setText(""); } }}>
        <input className="input !py-2 !text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="or type any code…" aria-label={`${label} custom course`} maxLength={14} />
        <button className="btn btn-ghost !py-2 !text-xs" type="submit" disabled={!CODE_RE.test(normalizeCourseCode(text))}>Set</button>
      </form>
    </div>
  );
}

function HpBar({ code, title, hp, side, hit }: { code: string; title: string; hp: number; side: "a" | "b"; hit: boolean }) {
  const left = side === "a";
  const col = hpHue(hp);
  return (
    <div className={`min-w-0 flex-1 ${left ? "" : "text-right"} ${hit ? "lab-shake" : ""}`} key={hit ? "hit" + hp : "idle"}>
      <div className={`flex items-baseline gap-2 ${left ? "" : "flex-row-reverse"}`}>
        <span className="text-xl font-black text-white sm:text-3xl">{code}</span>
        <span className="hidden truncate text-xs text-[#8a96aa] sm:inline">{title}</span>
      </div>
      <div className="relative mt-1.5 h-6 overflow-hidden rounded-md border-2 border-[#2a3548] bg-[#06080c] sm:h-7" style={{ transform: `skewX(${left ? -12 : 12}deg)` }}>
        <div className="absolute inset-y-0 transition-[width] duration-[900ms] ease-out" style={{ [left ? "left" : "right"]: 0, width: `${hp}%`, background: `linear-gradient(${left ? 90 : 270}deg, ${col}, ${col}cc)`, boxShadow: `0 0 18px ${col}99` }} />
        <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, transparent 0 9.5%, rgba(6,8,12,.6) 9.5% 10%)" }} />
      </div>
      <p className="mt-1 text-xs font-bold tabular-nums" style={{ color: col }}>{Math.round(hp)} HP</p>
    </div>
  );
}

type Phase = "announce" | "hit" | "comment";

export default function VersusClient({ courses }: { courses: CourseSummary[] }) {
  const toast = useToast();
  const [a, setA] = useState(courses[0]?.code ?? "");
  const [b, setB] = useState(courses[1]?.code ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<VersusResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("announce");
  const [finished, setFinished] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  // Deep link: /versus?a=CS%201332&b=CS%202110 prefills both fighters.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ca = normalizeCourseCode(q.get("a") ?? ""), cb = normalizeCourseCode(q.get("b") ?? "");
    if (CODE_RE.test(ca)) setA(ca);
    if (CODE_RE.test(cb)) setB(cb);
  }, []);

  const same = a === b && !!a;
  const ready = !!a && !!b && !same;

  async function fight() {
    if (!ready) return;
    setLoading(true); setErr(null); setRes(null); setFinished(false);
    try {
      const t0 = Date.now();
      const r = await postVersus(a, b);
      await new Promise((x) => setTimeout(x, Math.max(0, 900 - (Date.now() - t0))));
      setRes(r); setIdx(0); setPhase("announce");
      setTimeout(() => stage.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) { setErr((e as Error).message || "Cage match cancelled. Try again."); }
    finally { setLoading(false); }
  }

  // Round sequencer: announce → hit → comment → next round → champion
  useEffect(() => {
    if (!res || finished) return;
    const ms = phase === "announce" ? 1100 : phase === "hit" ? 1100 : 2400;
    const t = setTimeout(() => {
      if (phase === "announce") setPhase("hit");
      else if (phase === "hit") setPhase("comment");
      else if (idx + 1 < res.rounds.length) { setIdx(idx + 1); setPhase("announce"); }
      else setFinished(true);
    }, ms);
    return () => clearTimeout(t);
  }, [res, idx, phase, finished]);

  const upto = res ? (finished ? res.rounds.length : phase === "announce" ? idx : idx + 1) : 0;
  const hp = useMemo(() => {
    let ha = 100, hb = 100;
    if (res) res.rounds.slice(0, upto).forEach((r) => { if (r.winner === res.a.code) hb = Math.max(MIN_HP, hb - r.damage); else ha = Math.max(MIN_HP, ha - r.damage); });
    return { a: ha, b: hb };
  }, [res, upto]);

  const round = res?.rounds[idx];
  const { out: cmt } = useTypewriter(round?.commentary ?? "", !!res && !finished && phase !== "announce", 90);
  const aWon = round && res ? round.winner === res.a.code : false;
  const hitNow = !!res && !finished && phase === "hit";

  function skip() { if (res) { setFinished(true); setIdx(res.rounds.length - 1); } }

  return (
    <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <LabStyles />
      <div aria-hidden className="lab-grid pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <header className="lab-rise relative text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#3d8bff]/40 bg-[#3d8bff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7fb0ff]">🥊 Course Cage Match</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">Which class is <span className="text-gradient">scarier?</span></h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-[#8a96aa]">Two courses enter. One leaves with the crown of dread. Five rounds, live commentary, zero mercy.</p>
      </header>

      <section className="lab-rise delay-2 relative mt-8" aria-label="Pick your fighters">
        <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
          <Picker label="Fighter 1" side="a" value={a} onChange={setA} courses={courses} other={b} />
          <div className="grid place-items-center"><div className="lab-glow grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#d6c78a] to-[#3d8bff] text-lg font-black text-[#06080c]">VS</div></div>
          <Picker label="Fighter 2" side="b" value={b} onChange={setB} courses={courses} other={a} />
        </div>
        {(err || same) && <p role="alert" className="mt-3 rounded-lg border border-[#ff5d6c]/40 bg-[#ff5d6c]/10 px-3 py-2 text-sm text-[#ff9aa4]">{err ?? "A course can't fight itself. Pick two different fighters."}</p>}
        <button type="button" onClick={fight} disabled={!ready || loading} className="btn btn-gold lab-btn-big mt-4 w-full !py-4 text-lg font-black tracking-wide">
          {loading ? <span className="inline-flex items-center gap-3">Taping up the cage<span className="lab-dots"><span /><span /><span /></span></span> : ready ? `🥊 FIGHT: ${a} vs ${b}` : "Pick two fighters"}
        </button>
      </section>

      {res && (
        <div ref={stage} className="mt-8 scroll-mt-20">
          <section className="card relative overflow-hidden p-4 sm:p-7" style={{ boxShadow: "0 30px 90px -40px rgba(61,139,255,.6)" }} aria-label="Battle arena">
            <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#B3A369]/15 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#3d8bff]/15 blur-3xl" />
            <div className="relative flex items-start gap-3 sm:gap-5">
              <HpBar code={res.a.code} title={res.a.title} hp={hp.a} side="a" hit={hitNow && !aWon} />
              <div className="mt-3 grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br from-[#d6c78a] to-[#3d8bff] text-sm font-black text-[#06080c]">VS</div>
              <HpBar code={res.b.code} title={res.b.title} hp={hp.b} side="b" hit={hitNow && aWon} />
            </div>

            {/* arena */}
            <div className="relative mt-6 flex min-h-[210px] items-center justify-between gap-2 overflow-hidden rounded-2xl border border-[#1d2634] bg-black/30 px-3 py-6 sm:px-10">
              <Fighter f={res.a} side="a" lunge={hitNow && aWon} down={finished && res.champion !== res.a.code} />
              <div className="absolute inset-x-0 top-3 text-center">
                {!finished && round && (
                  <div key={idx + phase} className={phase === "announce" ? "lab-pop" : "lab-rise"}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#B3A369]">Round {idx + 1} / {res.rounds.length}</p>
                    <p className="text-xl font-black text-white sm:text-2xl">{round.emoji} {round.title}</p>
                  </div>
                )}
              </div>
              <div className="relative z-10 mx-auto w-[34%] min-w-[110px] text-center">
                {!finished && round && phase !== "announce" && round.aStat && (
                  <div className="lab-pop rounded-xl border border-[#2a3548] bg-[#06080c]/80 px-2 py-2 text-xs sm:text-sm">
                    <span className={aWon ? "font-black text-[#d6c78a]" : "text-[#8a96aa]"}>{round.aStat}</span>
                    <span className="mx-2 text-[#5b6679]">vs</span>
                    <span className={!aWon ? "font-black text-[#7fb0ff]" : "text-[#8a96aa]"}>{round.bStat}</span>
                  </div>
                )}
                {hitNow && round && <p key={idx} className="lab-pop mt-2 text-2xl font-black text-[#ff5d6c]" style={{ textShadow: "0 0 20px #ff5d6c" }}>−{round.damage}</p>}
              </div>
              <Fighter f={res.b} side="b" lunge={hitNow && !aWon} down={finished && res.champion !== res.b.code} />
              {hitNow && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,.55), transparent 60%)", animation: "lab-flash .5s ease-out both" }} />}
            </div>

            {/* commentary */}
            {!finished && round && phase !== "announce" && (
              <p className="relative mt-4 min-h-[3.5rem] rounded-xl border border-[#1d2634] bg-black/25 p-4 text-[15px] leading-relaxed text-[#e8ecf3]">
                <span className="mr-2 text-[#B3A369]">🎙️</span>{cmt}
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-widest text-[#8a96aa]">Round winner: <span className="text-[#d6c78a]">{round.winner}</span></span>
              </p>
            )}
            {!finished && <button type="button" onClick={skip} className="relative mt-3 text-xs font-semibold text-[#5b6679] hover:text-[#d6c78a]">Skip to result »</button>}
          </section>

          {finished && <Champion r={res} onCopy={async () => { const ok = await copyText(shareText(res)); toast(ok ? "Fight recap copied." : "Copy this recap", { kind: ok ? "success" : "info" }); }} />}
        </div>
      )}
    </div>
  );
}

function Fighter({ f, side, lunge, down }: { f: { code: string; fearScore: number; hardest: string }; side: "a" | "b"; lunge: boolean; down: boolean }) {
  const accent = side === "a" ? "#B3A369" : "#3d8bff";
  return (
    <div className={`relative z-10 flex w-[26%] min-w-[96px] flex-col items-center text-center transition-all duration-500 ${lunge ? (side === "a" ? "lab-lunge-l" : "lab-lunge-r") : ""} ${down ? "scale-90 opacity-50 grayscale" : ""}`}>
      <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 text-3xl font-black text-white sm:h-24 sm:w-24" style={{ borderColor: accent, background: `linear-gradient(160deg, ${accent}33, #06080c)`, boxShadow: `0 0 30px -6px ${accent}` }}>
        <span className="text-2xl sm:text-3xl" style={{ color: accent }}>{Math.round(f.fearScore)}</span>
      </div>
      <p className="mt-2 text-sm font-black text-white sm:text-base">{f.code}</p>
      <p className="max-w-[140px] truncate text-[10px] uppercase tracking-widest text-[#5b6679]">Boss: {f.hardest}</p>
    </div>
  );
}

function Champion({ r, onCopy }: { r: VersusResult; onCopy: () => void }) {
  const win = r.champion === r.a.code ? r.a : r.b;
  const lose = win === r.a ? r.b : r.a;
  const wins = r.rounds.filter((x) => x.winner === win.code).length;
  return (
    <div className="lab-rise mt-6">
      <Confetti active pieces={90} />
      <section className="relative overflow-hidden rounded-3xl border border-[#B3A369]/60 bg-gradient-to-br from-[#1b1707] via-[#0e131b] to-[#0b1630] p-7 text-center sm:p-10" style={{ boxShadow: "0 0 90px -30px rgba(179,163,105,.8)" }} aria-label="Champion">
        <div aria-hidden className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-[#B3A369]/25 blur-3xl" />
        <p className="relative text-5xl lab-float">🏆</p>
        <p className="eyebrow relative mt-2">Reigning champion of dread</p>
        <h2 className="relative mt-2 text-5xl font-black text-gradient sm:text-7xl">{win.code}</h2>
        <p className="relative mt-1 text-sm text-[#8a96aa]">{win.title} · fear {Math.round(win.fearScore)} · won {wins} of {r.rounds.length} rounds</p>
        <p className="relative mx-auto mt-4 max-w-xl text-lg font-semibold text-white">{r.championLine}</p>
        <div className="relative mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-1.5">
          {r.rounds.map((x, i) => (
            <span key={i} className="badge" style={{ color: x.winner === win.code ? "#d6c78a" : "#8a96aa", background: x.winner === win.code ? "#b3a36922" : "#ffffff08", borderColor: x.winner === win.code ? "#b3a36966" : "#2a3548" }}>{x.emoji} {x.winner}</span>
          ))}
        </div>
        <div className="relative mt-7 flex flex-wrap justify-center gap-2">
          <Link href={`/course/${courseSlug(win.code)}`} className="btn btn-gold">Survive {win.code}: see the plan →</Link>
          <Link href={`/course/${courseSlug(lose.code)}`} className="btn btn-ghost">{lose.code} plan</Link>
          <button type="button" onClick={onCopy} className="btn btn-blue">📋 Share recap</button>
        </div>
      </section>
    </div>
  );
}
