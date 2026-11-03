"use client";
/** Lane: viz. Donut of sources by kind (exam, syllabus, reddit, x, …). */
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CoursePack, Source, SourceKind } from "@/shared/contract";

export interface SourceKindDonutProps {
  pack?: CoursePack;
  sources?: Source[];
  height?: number;
  className?: string;
}

export const KIND_META: Record<SourceKind, { label: string; color: string }> = {
  exam: { label: "Past exams", color: "#fb7185" },
  practice: { label: "Practice tests", color: "#f59e0b" },
  syllabus: { label: "Syllabi", color: "#818cf8" },
  "course-page": { label: "Course pages", color: "#22d3ee" },
  notes: { label: "Notes", color: "#34d399" },
  reddit: { label: "Reddit", color: "#fb923c" },
  x: { label: "X posts", color: "#e2e8f0" },
  other: { label: "Other", color: "#64748b" },
};
const NONE: Source[] = [];

export default function SourceKindDonut({ pack, sources: ss, height = 220, className = "" }: SourceKindDonutProps) {
  const sources = ss ?? pack?.sources ?? NONE;
  const data = useMemo(() => {
    const m = new Map<SourceKind, number>();
    sources.forEach((s) => m.set(s.kind, (m.get(s.kind) ?? 0) + 1));
    return [...m.entries()].map(([kind, value]) => ({ kind, value, ...(KIND_META[kind] ?? KIND_META.other) })).sort((a, b) => b.value - a.value);
  }, [sources]);

  if (data.length === 0) {
    return <div className={`flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`} style={{ height }}>No sources yet.</div>;
  }
  return (
    <div className={`flex w-full flex-wrap items-center gap-4 ${className}`}>
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="92%" paddingAngle={3} stroke="none" animationDuration={900}>
              {data.map((d) => (
                <Cell key={d.kind} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} itemStyle={{ color: "#e2e8f0" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-extrabold text-white">{sources.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">sources</div>
        </div>
      </div>
      <ul className="min-w-[140px] flex-1 space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.kind} className="flex items-center gap-2 text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1">{d.label}</span>
            <span className="font-semibold tabular-nums text-slate-100">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
