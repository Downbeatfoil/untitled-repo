"use client";
/** Lane: viz. Stacked fear bar for a whole schedule + per-course rows. Used by /roast. */
import { useEffect, useMemo, useState } from "react";
import type { CoursePack } from "@/shared/contract";
import { difficultyColor } from "./colors";

export type SemesterCourse = Pick<CoursePack, "fearScore"> & { course: { code: string; title: string } };

export interface SemesterHeatProps {
  /** CoursePacks (or anything with {course:{code,title}, fearScore}). */
  packs: SemesterCourse[];
  className?: string;
}

function verdict(avg: number, n: number): string {
  const load = avg * (0.75 + 0.25 * Math.min(n, 5) / 5);
  if (load >= 75) return "Pray for sleep";
  if (load >= 60) return "Brutal semester";
  if (load >= 40) return "Manageable… barely";
  return "Easy cruise";
}

export default function SemesterHeat({ packs, className = "" }: SemesterHeatProps) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, []);

  const { rows, total, avg } = useMemo(() => {
    const rows = packs.map((p) => ({ code: p.course.code, title: p.course.title, fear: Math.max(0, Math.min(100, p.fearScore)) })).sort((a, b) => b.fear - a.fear);
    const total = rows.reduce((a, r) => a + r.fear, 0);
    return { rows, total, avg: rows.length ? total / rows.length : 0 };
  }, [packs]);

  if (rows.length === 0) {
    return <div className={`flex h-24 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`}>Add courses to see your semester heat.</div>;
  }
  return (
    <div className={`w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 p-4 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400">Semester fear load</div>
          <div className="text-3xl font-extrabold" style={{ color: difficultyColor(avg / 100) }}>{Math.round(total)} <span className="text-base font-semibold text-slate-400">pts · avg {Math.round(avg)}</span></div>
        </div>
        <div className="rounded-full border px-3 py-1 text-sm font-bold" style={{ color: difficultyColor(avg / 100), borderColor: difficultyColor(avg / 100, 0.5), background: difficultyColor(avg / 100, 0.1) }}>{verdict(avg, rows.length)}</div>
      </div>

      {/* stacked bar */}
      <div className="mt-3 flex h-7 w-full overflow-hidden rounded-full bg-slate-800/70">
        {rows.map((r) => (
          <div
            key={r.code}
            title={`${r.code}: ${Math.round(r.fear)}`}
            className="flex items-center justify-center overflow-hidden text-[10px] font-bold text-slate-950 transition-[width] duration-1000 ease-out"
            style={{ width: on ? `${(r.fear / (total || 1)) * 100}%` : "0%", background: difficultyColor(r.fear / 100), borderRight: "2px solid #020617" }}
          >
            {r.fear / (total || 1) > 0.12 ? r.code : ""}
          </div>
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <li key={r.code} className="grid grid-cols-[88px_1fr_36px] items-center gap-2 text-sm">
            <span className="font-semibold text-slate-100">{r.code}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-slate-800/80" title={r.title}>
              <span className="block h-full rounded-full transition-[width] duration-1000 ease-out" style={{ width: on ? `${r.fear}%` : "0%", transitionDelay: `${i * 90}ms`, background: `linear-gradient(90deg, ${difficultyColor(0)}, ${difficultyColor(r.fear / 100)})` }} />
            </span>
            <span className="text-right font-bold tabular-nums" style={{ color: difficultyColor(r.fear / 100) }}>{Math.round(r.fear)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
