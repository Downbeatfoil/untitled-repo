"use client";
/** Lane: viz. "Path to mastering X": the prereq chain highlighted on the ConceptGraph + numbered steps. */
import { useMemo } from "react";
import type { CoursePack } from "@/shared/contract";
import ConceptGraph from "./ConceptGraph";
import { difficultyColor, difficultyLabel, pct } from "./colors";

export interface LearningPathProps {
  pack: CoursePack;
  targetConceptId: string;
  /** Height of the graph. Default 380. Pass 0 to hide the graph and show only the steps. */
  graphHeight?: number;
  className?: string;
}

/** Ordered learning steps (prereqs first, target last). Exported for reuse. */
export function learningSteps(pack: CoursePack, targetId: string): string[] {
  const ids = new Set(pack.concepts.map((c) => c.id));
  if (!ids.has(targetId)) return [];
  const prereq = pack.edges.filter((e) => e.relation === "prereq" && ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  // ancestors of target
  const chain = new Set<string>([targetId]);
  const stack = [targetId];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const e of prereq) if (e.to === cur && !chain.has(e.from)) { chain.add(e.from); stack.push(e.from); }
  }
  const sub = prereq.filter((e) => chain.has(e.from) && chain.has(e.to));
  const level = new Map<string, number>([...chain].map((id) => [id, 0]));
  for (let i = 0; i < chain.size; i++) {
    let changed = false;
    for (const e of sub) {
      const n = (level.get(e.from) ?? 0) + 1;
      if (n > (level.get(e.to) ?? 0) && n < chain.size) { level.set(e.to, n); changed = true; }
    }
    if (!changed) break;
  }
  const freq = new Map(pack.examTopics.map((t) => [t.conceptId, t.frequency]));
  return [...chain].sort((a, b) => {
    if (a === targetId) return 1;
    if (b === targetId) return -1;
    return (level.get(a)! - level.get(b)!) || ((freq.get(b) ?? 0) - (freq.get(a) ?? 0));
  });
}

export default function LearningPath({ pack, targetConceptId, graphHeight = 380, className = "" }: LearningPathProps) {
  const steps = useMemo(() => learningSteps(pack, targetConceptId), [pack, targetConceptId]);
  const byId = useMemo(() => new Map(pack.concepts.map((c) => [c.id, c])), [pack.concepts]);
  const diff = useMemo(() => new Map(pack.difficulty.map((d) => [d.conceptId, d])), [pack.difficulty]);
  const freq = useMemo(() => new Map(pack.examTopics.map((t) => [t.conceptId, t.frequency])), [pack.examTopics]);
  const numbers = useMemo(() => Object.fromEntries(steps.map((id, i) => [id, i + 1])), [steps]);

  const target = byId.get(targetConceptId);
  if (!target) {
    return <div className={`rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 text-sm text-slate-400 ${className}`}>Pick a concept to see its learning path.</div>;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-white">Path to mastering <span className="text-indigo-300">{target.label}</span></h3>
        <span className="text-xs text-slate-400">{steps.length} step{steps.length === 1 ? "" : "s"}{steps.length === 1 ? " · no prerequisites" : ""}</span>
      </div>
      {graphHeight > 0 && (
        <ConceptGraph
          pack={pack}
          highlightIds={steps}
          stepNumbers={numbers}
          height={graphHeight}
          className="mb-4"
        />
      )}
      <ol className="relative space-y-2.5">
        {steps.map((id, i) => {
          const c = byId.get(id)!;
          const d = diff.get(id);
          const last = i === steps.length - 1;
          return (
            <li key={id} className="relative flex gap-3">
              {!last && <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-gradient-to-b from-indigo-400/70 to-indigo-400/10" />}
              <span
                className="z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-extrabold text-white"
                style={{ background: last ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "linear-gradient(135deg,#6366f1,#4338ca)", boxShadow: last ? "0 0 16px #f59e0b88" : undefined }}
              >
                {last ? "★" : i + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">{c.label}</span>
                  <span className="flex items-center gap-2 text-[11px]">
                    {freq.has(id) && <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-indigo-300">{pct(freq.get(id)!)} of exams</span>}
                    {d && <span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: difficultyColor(d.score, 0.16), color: difficultyColor(d.score) }}>{difficultyLabel(d.score)}</span>}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{c.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
