"use client";
/** Lane: viz. Fighting-game style animated health bars for /versus ("Course Cage Match"). */
import { useEffect, useMemo, useState } from "react";
import type { CoursePack, CourseSummary } from "@/shared/contract";
import { difficultyColor } from "./colors";

export interface BattleBarsProps {
  a: CoursePack | CourseSummary;
  b: CoursePack | CourseSummary;
  className?: string;
}

interface Fighter { code: string; title: string; fear: number; concepts: number; sources: number; hardest: string; avgExam: number | null }

function norm(x: CoursePack | CourseSummary): Fighter {
  if ("course" in x) {
    const hardest = [...x.difficulty].sort((p, q) => q.score - p.score)[0];
    const label = x.concepts.find((c) => c.id === hardest?.conceptId)?.label ?? "—";
    const avgExam = x.examTopics.length ? x.examTopics.reduce((s, t) => s + t.frequency, 0) / x.examTopics.length : null;
    return { code: x.course.code, title: x.course.title, fear: x.fearScore, concepts: x.concepts.length, sources: x.sources.length, hardest: label, avgExam };
  }
  return { code: x.code, title: x.title, fear: x.fearScore, concepts: x.conceptCount, sources: x.sourceCount, hardest: x.topConcept, avgExam: null };
}

export default function BattleBars({ a, b, className = "" }: BattleBarsProps) {
  const A = useMemo(() => norm(a), [a]);
  const B = useMemo(() => norm(b), [b]);
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(false); const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t); }, [a, b]);
  const winner = A.fear === B.fear ? null : A.fear > B.fear ? "a" : "b";

  const Bar = ({ f, side }: { f: Fighter; side: "a" | "b" }) => {
    const hp = Math.max(0, Math.min(100, f.fear));
    const left = side === "a";
    return (
      <div className={`flex-1 ${left ? "" : "text-right"}`}>
        <div className={`flex items-baseline gap-2 ${left ? "" : "flex-row-reverse"}`}>
          <span className="text-xl font-extrabold text-white">{f.code}</span>
          <span className="truncate text-xs text-slate-400">{f.title}</span>
        </div>
        <div className="relative mt-1.5 h-7 overflow-hidden rounded-md border-2 border-slate-600 bg-slate-900" style={{ transform: "skewX(" + (left ? "-12deg" : "12deg") + ")" }}>
          <div
            className="absolute inset-y-0 transition-[width] duration-[1400ms] ease-out"
            style={{
              [left ? "left" : "right"]: 0,
              width: on ? `${hp}%` : "0%",
              background: `linear-gradient(${left ? "90deg" : "270deg"}, ${difficultyColor(0.1)}, ${difficultyColor(0.5)} 45%, ${difficultyColor(1)})`,
              boxShadow: `0 0 18px ${difficultyColor(hp / 100, 0.6)}`,
            }}
          />
          <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, transparent 0 9.5%, rgba(2,6,23,.55) 9.5% 10%)" }} />
        </div>
        <div className="mt-1 text-sm font-bold tabular-nums" style={{ color: difficultyColor(hp / 100) }}>
          {Math.round(f.fear)} <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">fear</span>
          {winner === side && <span className="ml-2 rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">👑 MORE FEARED</span>}
        </div>
      </div>
    );
  };

  const rows: { label: string; a: string; b: string; winA?: boolean; winB?: boolean }[] = [
    { label: "Concepts", a: String(A.concepts), b: String(B.concepts), winA: A.concepts > B.concepts, winB: B.concepts > A.concepts },
    { label: "Sources found", a: String(A.sources), b: String(B.sources), winA: A.sources > B.sources, winB: B.sources > A.sources },
    ...(A.avgExam !== null && B.avgExam !== null
      ? [{ label: "Avg exam coverage", a: `${Math.round(A.avgExam * 100)}%`, b: `${Math.round(B.avgExam * 100)}%`, winA: A.avgExam > B.avgExam, winB: B.avgExam > A.avgExam }]
      : []),
    { label: "Hardest concept", a: A.hardest, b: B.hardest },
  ];

  return (
    <div className={`w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 p-4 ${className}`}>
      <div className="flex items-start gap-4">
        <Bar f={A} side="a" />
        <div className="mt-3 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-black text-slate-950 shadow-[0_0_22px_#f59e0b88]">VS</div>
        <Bar f={B} side="b" />
      </div>
      <div className="mt-4 divide-y divide-slate-800/80 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1.5">
            <span className={`truncate ${r.winA ? "font-bold text-emerald-300" : "text-slate-300"}`}>{r.a}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{r.label}</span>
            <span className={`truncate text-right ${r.winB ? "font-bold text-emerald-300" : "text-slate-300"}`}>{r.b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
