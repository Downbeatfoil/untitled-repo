"use client";
/** Lane: viz. Grid of concepts colored by difficulty (hardest first); hover/focus shows student quotes. */
import { useMemo, useState } from "react";
import type { Concept, CoursePack, Difficulty, Source } from "@/shared/contract";
import { difficultyColor, difficultyLabel } from "./colors";

export interface DifficultyHeatmapProps {
  /** Convenience: pass the whole CoursePack instead of the individual arrays. */
  pack?: CoursePack;
  concepts?: Concept[];
  difficulty?: Difficulty[];
  sources?: Source[];
  className?: string;
}

const NONE_C: Concept[] = [];
const NONE_D: Difficulty[] = [];
const NONE_S: Source[] = [];

export default function DifficultyHeatmap({ pack, concepts: cs, difficulty: df, sources: ss, className = "" }: DifficultyHeatmapProps) {
  const concepts = cs ?? pack?.concepts ?? NONE_C;
  const difficulty = df ?? pack?.difficulty ?? NONE_D;
  const sources = ss ?? pack?.sources ?? NONE_S;
  const [active, setActive] = useState<string | null>(null);

  const cells = useMemo(() => {
    const d = new Map(difficulty.map((x) => [x.conceptId, x]));
    return concepts
      .map((c) => ({ c, d: d.get(c.id), score: d.get(c.id)?.score ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [concepts, difficulty]);
  const srcTitle = useMemo(() => new Map(sources.map((s) => [s.id, s.title])), [sources]);

  if (cells.length === 0) {
    return <div className={`flex h-32 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm text-slate-400 ${className}`}>No difficulty data yet.</div>;
  }
  const shown = cells.find((x) => x.c.id === active) ?? cells[0];

  return (
    <div className={`w-full ${className}`}>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))" }}>
        {cells.map(({ c, d, score }) => {
          const isActive = shown.c.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => setActive(c.id)}
              onFocus={() => setActive(c.id)}
              onClick={() => setActive(c.id)}
              className="group relative flex h-[72px] flex-col justify-between rounded-lg p-2 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              style={{
                background: `linear-gradient(135deg, ${difficultyColor(score, 0.34)}, ${difficultyColor(score, 0.14)})`,
                border: `1px solid ${difficultyColor(score, isActive ? 0.95 : 0.45)}`,
                boxShadow: isActive ? `0 0 18px -4px ${difficultyColor(score)}` : undefined,
              }}
              aria-label={`${c.label}: ${difficultyLabel(score)}, ${Math.round(score * 100)} out of 100`}
            >
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-slate-100">{c.label}</span>
              <span className="flex items-end justify-between">
                <span className="text-lg font-extrabold leading-none" style={{ color: difficultyColor(score) }}>{d ? Math.round(score * 100) : "–"}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-300/80">{d ? difficultyLabel(score) : "n/a"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-200" aria-live="polite">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-white">{shown.c.label}</span>
          <span className="text-xs font-bold" style={{ color: difficultyColor(shown.score) }}>{shown.d ? `${difficultyLabel(shown.score)} · ${Math.round(shown.score * 100)}` : "no data"}</span>
        </div>
        {shown.d && shown.d.quotes.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {shown.d.quotes.slice(0, 3).map((q, i) => (
              <li key={i} className="border-l-2 pl-2 text-xs italic text-slate-300" style={{ borderColor: q.sentiment === "negative" ? "#fb7185" : q.sentiment === "positive" ? "#34d399" : "#94a3b8" }}>
                “{q.text}” {srcTitle.get(q.sourceId) && <span className="not-italic text-slate-500">— {srcTitle.get(q.sourceId)}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-slate-500">No student quotes for this concept.</p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
        <span>easy</span>
        <span className="h-1.5 w-28 rounded-full" style={{ background: `linear-gradient(90deg, ${difficultyColor(0)}, ${difficultyColor(0.5)}, ${difficultyColor(1)})` }} />
        <span>brutal</span>
      </div>
    </div>
  );
}
