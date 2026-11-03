"use client";
/**
 * Lane: wall. Extra /wall slides: Schedule Roast (survival odds) and Course Cage Match.
 * Data comes from the lab lane's /lab-api/roast and /lab-api/versus; any failure falls back to a local static take.
 */
import { useEffect, useState } from "react";
import type { WallCourse } from "./types";
import { useViewportHeight } from "./useBoard";

export interface RoastData { survivalOdds: number; verdict: string; perCourse: { code: string; line: string }[]; mocked: boolean }
export interface VersusData {
  a: { code: string; title: string; fearScore: number; hardest: string };
  b: { code: string; title: string; fearScore: number; hardest: string };
  rounds: { title: string; emoji?: string; winner: string; commentary: string; aStat?: string; bStat?: string }[];
  champion: string;
  championLine: string;
  mocked: boolean;
}

/** The demo schedule: the three most feared seeded courses. */
export const rosterOf = (cs: WallCourse[]) => [...cs].sort((a, b) => b.fearScore - a.fearScore).slice(0, 3);

function fallbackRoast(cs: WallCourse[]): RoastData {
  const avg = cs.reduce((s, c) => s + c.fearScore, 0) / Math.max(1, cs.length);
  return {
    survivalOdds: Math.max(3, Math.min(97, Math.round(140 - avg * 1.5))),
    verdict: "This schedule is a group project where everyone is the final exam. Hydrate, and keep the past exams close.",
    perCourse: cs.map((c) => ({ code: c.code, line: `${c.hardest.label} is waiting for you, and it brought friends.` })),
    mocked: true,
  };
}
function fallbackVersus(a: WallCourse, b: WallCourse): VersusData {
  const f = (c: WallCourse) => ({ code: c.code, title: c.title, fearScore: c.fearScore, hardest: c.hardest.label });
  const champ = a.fearScore >= b.fearScore ? a : b;
  const loser = champ === a ? b : a;
  return {
    a: f(a), b: f(b), champion: champ.code, mocked: true,
    rounds: [
      { title: "Fear Factor", emoji: "😱", winner: champ.code, commentary: `${champ.code} walks in and the lecture hall goes quiet.`, aStat: String(a.fearScore), bStat: String(b.fearScore) },
      { title: "Hardest Boss", emoji: "👹", winner: a.hardest.score >= b.hardest.score ? a.code : b.code, commentary: `${a.hardest.label} vs ${b.hardest.label}: nobody leaves unscathed.`, aStat: `${Math.round(a.hardest.score * 100)}%`, bStat: `${Math.round(b.hardest.score * 100)}%` },
      { title: "Exam Chaos", emoji: "🎯", winner: loser.code, commentary: "Underdog energy: the exam traps here are legendary.", aStat: "", bStat: "" },
    ],
    championLine: `${champ.code} takes the belt. Respect the fear: ${champ.hardest.label} is still out there.`,
  };
}

async function post<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

/** Loads roast + versus once on mount (static fallback until/unless the routes answer). */
export function useLabSlides(courses: WallCourse[]) {
  const roster = rosterOf(courses);
  const key = roster.map((c) => c.code).join("|");
  const [roast, setRoast] = useState<RoastData>(() => fallbackRoast(roster));
  const [versus, setVersus] = useState<VersusData | null>(() => (roster.length >= 2 ? fallbackVersus(roster[0], roster[1]) : null));
  useEffect(() => {
    if (roster.length < 1) return;
    let dead = false;
    post<RoastData>("/lab-api/roast", { codes: roster.map((c) => c.code) }).then((r) => {
      if (!dead && r && typeof r.survivalOdds === "number" && Array.isArray(r.perCourse)) setRoast(r);
    });
    if (roster.length >= 2) {
      post<VersusData>("/lab-api/versus", { a: roster[0].code, b: roster[1].code }).then((v) => {
        if (!dead && v && Array.isArray(v.rounds) && v.rounds.length && v.a && v.b) setVersus(v);
      });
    }
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { roster, roast, versus };
}

const oddsColor = (n: number) => (n >= 60 ? "#3ddc97" : n >= 30 ? "#ffb547" : "#ff5d6c");

export function RoastSlide({ roster, roast }: { roster: WallCourse[]; roast: RoastData }) {
  const odds = Math.max(0, Math.min(100, Math.round(roast.survivalOdds)));
  const col = oddsColor(odds);
  const R = 88, C = 2 * Math.PI * R;
  return (
    <div className="relative grid min-h-0 flex-1 gap-6 overflow-hidden xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" style={{ animation: "wl-in .7s ease-out" }}>
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Schedule Roast · try yours at /roast</div>
        <h1 className="mt-2 text-[clamp(1.8rem,min(3.4vw,6vh),3.8rem)] font-black leading-none tracking-tight text-goldb">Can you survive this schedule?</h1>
        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {roster.map((c) => {
            const line = roast.perCourse.find((p) => p.code === c.code)?.line ?? "";
            return (
              <div key={c.code} className="rounded-xl border border-line bg-panel2/70 p-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-[clamp(1.2rem,2.2vw,2.2rem)] font-extrabold text-goldb">{c.code}</span>
                  <span className="truncate text-sm text-muted">{c.title}</span>
                  <span className="ml-auto text-xl font-extrabold tabular-nums text-bad">{c.fearScore}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[clamp(.85rem,1.2vw,1.2rem)] italic text-foreground/90">“{line}”</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-center justify-center gap-4 rounded-xl border border-line bg-panel2/50 p-5 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted">Survival odds</div>
        <svg viewBox="0 0 220 220" className="w-[min(100%,clamp(180px,34vh,340px))]" role="img" aria-label={`Survival odds ${odds} percent`}>
          <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(148,163,184,.18)" strokeWidth="16" />
          <circle cx="110" cy="110" r={R} fill="none" stroke={col} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(C * odds) / 100} ${C}`} transform="rotate(-90 110 110)" style={{ filter: `drop-shadow(0 0 10px ${col})`, transition: "stroke-dasharray 1.2s ease-out" }} />
          <text x="110" y="124" textAnchor="middle" fontSize="58" fontWeight="900" fill={col}>{odds}%</text>
        </svg>
        <p className="line-clamp-4 max-w-md text-[clamp(.95rem,1.4vw,1.4rem)] font-medium leading-snug">{roast.verdict}</p>
        {roast.mocked && <div className="text-xs text-dim">demo roast</div>}
      </div>
    </div>
  );
}

export function VersusSlide({ v }: { v: VersusData }) {
  const vh = useViewportHeight();
  const nRounds = vh >= 1000 ? 4 : 2;
  const champ = v.champion;
  const Fighter = ({ f, side }: { f: VersusData["a"]; side: "l" | "r" }) => (
    <div className={`min-w-0 flex-1 rounded-xl border p-4 ${f.code === champ ? "border-gold/70 bg-gold/10" : "border-line bg-panel2/60"} ${side === "r" ? "text-right" : ""}`}>
      <div className="text-[clamp(1.6rem,min(3.6vw,6vh),4rem)] font-black leading-none text-goldb">{f.code}</div>
      <div className="mt-1 truncate text-sm text-muted">{f.title}</div>
      <div className="mt-2 text-xs uppercase tracking-widest text-dim">Fear</div>
      <div className="text-3xl font-extrabold tabular-nums text-bad">{f.fearScore}</div>
      <div className="mt-1 truncate text-sm text-foreground/80">Boss: {f.hardest}</div>
      {f.code === champ && <div className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-gold">👑 champion</div>}
    </div>
  );
  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden" style={{ animation: "wl-in .7s ease-out" }}>
      <div className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Course Cage Match · pick your fighters at /versus</div>
      <div className="flex items-stretch gap-4">
        <Fighter f={v.a} side="l" />
        <div className="grid shrink-0 place-items-center text-[clamp(2rem,4vw,4.5rem)] font-black text-electric" style={{ textShadow: "0 0 30px rgba(61,139,255,.6)" }}>VS</div>
        <Fighter f={v.b} side="r" />
      </div>
      <div className="grid min-h-0 flex-1 content-start gap-2.5 overflow-hidden md:grid-cols-2">
        {v.rounds.slice(0, nRounds).map((r, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel2/70 p-3.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">{r.emoji ?? "🥊"}</span>
              <span className="font-bold uppercase tracking-wider text-muted">Round {i + 1} · {r.title}</span>
              <span className="ml-auto rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-goldb">{r.winner}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-[clamp(.85rem,1.15vw,1.15rem)] text-foreground/90">{r.commentary}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gold/50 bg-gold/10 px-5 py-3 text-center text-[clamp(1rem,1.6vw,1.6rem)] font-bold text-goldb">🏆 {v.championLine}</div>
    </div>
  );
}
