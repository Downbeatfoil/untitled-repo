"use client";
/** Lane: viz. Radar of practice-exam score per concept (averaged over questions). */
import { useMemo } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Concept } from "@/shared/contract";

export interface ScoreRadarProps {
  /** One entry per graded question: score 0..1 (GradeResponse.score). Several per concept are averaged. */
  results: { conceptId: string; score: number }[];
  concepts?: Concept[];
  height?: number;
  className?: string;
}

export default function ScoreRadar({ results, concepts = [], height = 300, className = "" }: ScoreRadarProps) {
  const data = useMemo(() => {
    const labels = new Map(concepts.map((c) => [c.id, c.label]));
    const acc = new Map<string, { sum: number; n: number }>();
    results.forEach((r) => {
      const a = acc.get(r.conceptId) ?? { sum: 0, n: 0 };
      a.sum += Math.max(0, Math.min(1, r.score));
      a.n += 1;
      acc.set(r.conceptId, a);
    });
    return [...acc.entries()].map(([id, a]) => {
      const label = labels.get(id) ?? id;
      return { id, label: label.length > 16 ? label.slice(0, 15) + "…" : label, full: label, score: Math.round((a.sum / a.n) * 100) };
    });
  }, [results, concepts]);

  if (data.length === 0) {
    return <div className={`flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`} style={{ height: 120 }}>Answer a few questions to see your strengths.</div>;
  }
  // Radar needs ≥3 axes to look like a polygon: pad with empty spokes.
  const padded = data.length >= 3 ? data : [...data, ...Array.from({ length: 3 - data.length }, (_, i) => ({ id: `pad${i}`, label: "", full: "", score: 0 }))];
  const weakest = [...data].sort((a, b) => a.score - b.score)[0];

  return (
    <div className={`w-full ${className}`}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={padded} outerRadius="72%">
            <PolarGrid stroke="rgba(148,163,184,0.25)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} formatter={(v) => [`${v}%`, "Score"]} labelFormatter={(_l, p) => p?.[0]?.payload?.full ?? ""} />
            <Radar dataKey="score" stroke="#818cf8" strokeWidth={2} fill="#818cf8" fillOpacity={0.35} dot={{ r: 3, fill: "#a5b4fc" }} animationDuration={800} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {weakest && data.length > 1 && (
        <p className="mt-1 text-center text-xs text-slate-400">Weakest area: <b className="text-rose-300">{weakest.full}</b> ({weakest.score}%)</p>
      )}
    </div>
  );
}
