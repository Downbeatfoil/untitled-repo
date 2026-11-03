"use client";
/** Lane: viz. Posts + commits per lane (for /built-by-agents). */
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BoardStats } from "@/shared/contract";

export interface BoardActivityChartProps {
  stats: Pick<BoardStats, "lanes">;
  height?: number;
  className?: string;
}

export default function BoardActivityChart({ stats, height = 320, className = "" }: BoardActivityChartProps) {
  const data = useMemo(() => [...(stats?.lanes ?? [])].sort((a, b) => b.posts + b.commits - (a.posts + a.commits)), [stats]);
  if (data.length === 0) {
    return <div className={`flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`} style={{ height: 120 }}>No board activity yet.</div>;
  }
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -12 }} barGap={3}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="lane" tick={{ fill: "#cbd5e1", fontSize: 11 }} stroke="#475569" tickLine={false} interval={0} angle={-25} textAnchor="end" height={54} />
          <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
          <Bar dataKey="posts" name="Board posts" fill="#818cf8" radius={[5, 5, 0, 0]} animationDuration={900} />
          <Bar dataKey="commits" name="Commits" fill="#34d399" radius={[5, 5, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
