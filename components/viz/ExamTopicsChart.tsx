"use client";
/** Lane: viz. Horizontal bar chart of exam-topic frequency ("What's on the exam"). */
import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Concept, CoursePack, Difficulty, ExamTopic } from "@/shared/contract";
import { difficultyColor, PALETTE } from "./colors";

export interface ExamTopicsChartProps {
  /** Convenience: pass the whole CoursePack instead of the individual arrays. */
  pack?: CoursePack;
  examTopics?: ExamTopic[];
  concepts?: Concept[];
  /** Optional: color bars by difficulty (otherwise indigo gradient by frequency). */
  difficulty?: Difficulty[];
  /** Max bars to show. Default 10. */
  limit?: number;
  className?: string;
}

const NONE_T: ExamTopic[] = [];
const NONE_C: Concept[] = [];

interface Row {
  id: string;
  label: string;
  value: number;
  color: string;
  sources: number;
}

export default function ExamTopicsChart({ pack, examTopics: et, concepts: cs, difficulty: df, limit = 10, className = "" }: ExamTopicsChartProps) {
  const examTopics = et ?? pack?.examTopics ?? NONE_T;
  const concepts = cs ?? pack?.concepts ?? NONE_C;
  const difficulty = df ?? pack?.difficulty;
  const rows = useMemo<Row[]>(() => {
    const labels = new Map(concepts.map((c) => [c.id, c.label]));
    const diff = new Map((difficulty ?? []).map((d) => [d.conceptId, d.score]));
    return [...examTopics]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
      .map((t) => ({
        id: t.conceptId,
        label: labels.get(t.conceptId) ?? t.conceptId,
        value: Math.round(Math.max(0, Math.min(1, t.frequency)) * 100),
        color: diff.has(t.conceptId) ? difficultyColor(diff.get(t.conceptId)!) : `hsl(${240 - Math.round(t.frequency * 60)} 85% ${62 + Math.round(t.frequency * 6)}%)`,
        sources: t.evidenceSourceIds.length,
      }));
  }, [examTopics, concepts, difficulty, limit]);

  if (rows.length === 0) {
    return (
      <div className={`flex h-40 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`}>
        No exam-topic data yet.
      </div>
    );
  }
  const height = Math.max(180, rows.length * 38 + 30);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }} barCategoryGap={8}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke={PALETTE.slate} tick={{ fill: PALETTE.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={130} stroke={PALETTE.text} tick={{ fill: PALETTE.text, fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
            formatter={(v, _n, item) => [`${v}% of past exams${item?.payload?.sources ? ` · ${item.payload.sources} source${item.payload.sources === 1 ? "" : "s"}` : ""}`, "Frequency"]}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900} background={{ fill: "rgba(148,163,184,0.07)", radius: 6 }}>
            {rows.map((r) => (
              <Cell key={r.id} fill={r.color} />
            ))}
            <LabelList dataKey="value" position="right" formatter={(v: unknown) => `${v}%`} fill={PALETTE.text} fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
