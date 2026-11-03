"use client";
/** Lane: viz. Calendar heat strip: study minutes per day for a StudyPlan. */
import { useMemo, useState } from "react";
import type { Concept, StudyPlan } from "@/shared/contract";

export interface PlanCalendarProps {
  plan: StudyPlan;
  concepts?: Concept[];
  className?: string;
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const parse = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, day || 1));
};
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function PlanCalendar({ plan, concepts = [], className = "" }: PlanCalendarProps) {
  const [active, setActive] = useState<string | null>(null);
  const label = useMemo(() => new Map(concepts.map((c) => [c.id, c.label])), [concepts]);

  const { weeks, max, total, byDate } = useMemo(() => {
    const byDate = new Map(plan.days.map((d) => [d.date, d]));
    const dates = plan.days.map((d) => d.date).sort();
    if (!dates.length) return { weeks: [] as string[][], max: 0, total: 0, byDate };
    const start = parse(dates[0]);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const end = parse(dates[dates.length - 1]);
    const weeks: string[][] = [];
    for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 7)) {
      weeks.push(Array.from({ length: 7 }, (_, i) => iso(new Date(d.getTime() + i * 864e5))));
    }
    return { weeks, max: Math.max(...plan.days.map((d) => d.minutes), 1), total: plan.days.reduce((a, d) => a + d.minutes, 0), byDate };
  }, [plan]);

  if (!weeks.length) {
    return <div className={`flex h-24 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`}>No plan yet.</div>;
  }
  const shown = (active && byDate.get(active)) || null;
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex items-baseline justify-between text-xs text-slate-400">
        <span><b className="text-slate-100">{plan.days.length}</b> days · <b className="text-slate-100">{fmt(total)}</b> total</span>
        <span className="flex items-center gap-1.5">less
          {[0.1, 0.35, 0.6, 0.85, 1].map((a) => <span key={a} className="h-2.5 w-2.5 rounded-sm" style={{ background: `rgba(99,102,241,${a})` }} />)}
          more</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <div className="flex flex-col gap-1.5 pt-0.5 text-[9px] text-slate-500">
          {DOW.map((d, i) => <div key={i} className="flex h-7 items-center">{d}</div>)}
        </div>
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {w.map((date) => {
              const day = byDate.get(date);
              const m = day?.minutes ?? 0;
              const a = day ? (m === 0 ? 0 : 0.2 + 0.8 * (m / max)) : 0;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!day}
                  onMouseEnter={() => day && setActive(date)}
                  onFocus={() => day && setActive(date)}
                  onClick={() => day && setActive(date)}
                  title={day ? `${date}: ${m} min` : date}
                  aria-label={day ? `${date}: ${m} minutes` : `${date}: no study`}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[9px] font-semibold transition-transform hover:scale-110 disabled:cursor-default"
                  style={{
                    background: day ? (m === 0 ? "rgba(148,163,184,0.1)" : `rgba(99,102,241,${a})`) : "transparent",
                    border: day ? (active === date ? "1px solid #e2e8f0" : "1px solid rgba(148,163,184,0.15)") : "1px dashed rgba(148,163,184,0.08)",
                    color: a > 0.55 ? "#fff" : "#94a3b8",
                  }}
                >
                  {day ? parse(date).getUTCDate() : ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 min-h-[56px] rounded-lg border border-slate-700/60 bg-slate-900/60 p-2.5 text-xs text-slate-300" aria-live="polite">
        {shown ? (
          <>
            <div className="font-semibold text-slate-100">{shown.date} · {shown.minutes ? fmt(shown.minutes) : "rest day"}</div>
            {shown.conceptIds.length > 0 && <div className="mt-0.5 text-indigo-300">{shown.conceptIds.map((id) => label.get(id) ?? id).join(" · ")}</div>}
            {shown.tasks.length > 0 && <ul className="mt-1 list-disc pl-4 text-slate-400">{shown.tasks.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}</ul>}
          </>
        ) : (
          <span className="text-slate-500">Hover a day to see what’s planned.</span>
        )}
      </div>
    </div>
  );
}
