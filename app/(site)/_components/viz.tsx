"use client";
/** Lane: pages. Inline viz placeholders (concept graph, exam chart, heatmap). Swap for components/viz when it ships. */
import { useMemo, useState } from "react";
import type { CoursePack } from "@/shared/contract";
import { fearColor } from "./ui";

const diffColor = (d: number) => (d >= 0.75 ? "#ff5d6c" : d >= 0.55 ? "#ffb547" : d >= 0.35 ? "#d6c78a" : "#3ddc97");

export function ConceptGraph({ pack }: { pack: CoursePack }) {
  const [sel, setSel] = useState<string | null>(null);
  const freq = useMemo(() => new Map(pack.examTopics.map((t) => [t.conceptId, t.frequency])), [pack]);
  const diff = useMemo(() => new Map(pack.difficulty.map((d) => [d.conceptId, d.score])), [pack]);

  const layout = useMemo(() => {
    const ids = pack.concepts.map((c) => c.id);
    const depth = new Map<string, number>(ids.map((i) => [i, 0]));
    for (let k = 0; k < ids.length; k++)
      for (const e of pack.edges) if (e.relation === "prereq" && depth.has(e.from) && depth.has(e.to))
        depth.set(e.to, Math.max(depth.get(e.to)!, Math.min(depth.get(e.from)! + 1, 5)));
    const cols = new Map<number, string[]>();
    ids.forEach((id) => { const d = depth.get(id)!; cols.set(d, [...(cols.get(d) ?? []), id]); });
    const maxD = Math.max(...cols.keys(), 0);
    const maxRows = Math.max(...[...cols.values()].map((v) => v.length), 1);
    const W = 900, H = Math.max(380, maxRows * 84 + 40);
    const pos = new Map<string, { x: number; y: number }>();
    cols.forEach((list, d) => list.forEach((id, i) => {
      pos.set(id, { x: 70 + (maxD === 0 ? 0.5 : d / maxD) * (W - 140), y: ((i + 1) * H) / (list.length + 1) });
    }));
    return { pos, W, H };
  }, [pack]);

  const selected = pack.concepts.find((c) => c.id === sel);
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-[rgba(6,8,12,0.6)]">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="relative w-full" style={{ minHeight: 300 }}>
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#4a5a75" />
            </marker>
          </defs>
          {pack.edges.map((e, i) => {
            const a = layout.pos.get(e.from), b = layout.pos.get(e.to);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const hot = sel && (e.from === sel || e.to === sel);
            return (
              <path key={i} d={`M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`} fill="none"
                stroke={hot ? "#d6c78a" : "#2a3548"} strokeWidth={hot ? 2 : 1.4} strokeDasharray={e.relation === "related" ? "4 4" : undefined}
                markerEnd={e.relation === "prereq" ? "url(#arr)" : undefined} opacity={sel && !hot ? 0.25 : 0.9} />
            );
          })}
          {pack.concepts.map((c) => {
            const p = layout.pos.get(c.id)!;
            const r = 13 + (freq.get(c.id) ?? 0.3) * 20;
            const col = diffColor(diff.get(c.id) ?? 0.4);
            const on = sel === c.id;
            return (
              <g key={c.id} transform={`translate(${p.x},${p.y})`} onClick={() => setSel(on ? null : c.id)} style={{ cursor: "pointer" }} opacity={sel && !on ? 0.75 : 1}>
                <circle r={r + 6} fill={col} opacity={on ? 0.22 : 0.1} />
                <circle r={r} fill="#0e131b" stroke={col} strokeWidth={on ? 3 : 2} style={{ filter: `drop-shadow(0 0 8px ${col}55)` }} />
                <text y={r + 15} textAnchor="middle" fontSize="12" fontWeight="600" fill="#e8ecf3">{c.label}</text>
                <text y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill={col} className="mono">{Math.round((freq.get(c.id) ?? 0) * 100)}%</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span>Node size = exam frequency</span>
        {[["#3ddc97", "Easy"], ["#d6c78a", "Moderate"], ["#ffb547", "Hard"], ["#ff5d6c", "Brutal"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</span>
        ))}
        <span>→ prerequisite</span>
      </div>
      {selected && (
        <div className="card anim-in mt-4 p-4">
          <div className="flex items-center justify-between"><b>{selected.label}</b><span className="text-xs text-dim">{selected.unit}</span></div>
          <p className="mt-1 text-sm text-muted">{selected.description}</p>
        </div>
      )}
    </div>
  );
}

export function ExamTopicsChart({ pack }: { pack: CoursePack }) {
  const label = new Map(pack.concepts.map((c) => [c.id, c.label]));
  const rows = [...pack.examTopics].sort((a, b) => b.frequency - a.frequency).slice(0, 10);
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.conceptId} className="flex items-center gap-3">
          <div className="w-36 shrink-0 truncate text-right text-xs text-muted sm:w-44" title={label.get(r.conceptId)}>{label.get(r.conceptId) ?? r.conceptId}</div>
          <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-[rgba(255,255,255,0.04)]">
            <div className="h-full rounded-md anim-in" style={{ width: `${r.frequency * 100}%`, background: "linear-gradient(90deg,#b3a369,#3d8bff)", animationDelay: `${i * 60}ms`, transition: "width 1s" }} />
          </div>
          <div className="mono w-10 text-xs text-goldb">{Math.round(r.frequency * 100)}%</div>
        </div>
      ))}
    </div>
  );
}

export function DifficultyHeatmap({ pack }: { pack: CoursePack }) {
  const label = new Map(pack.concepts.map((c) => [c.id, c.label]));
  const unit = new Map(pack.concepts.map((c) => [c.id, c.unit ?? "Other"]));
  const freq = new Map(pack.examTopics.map((t) => [t.conceptId, t.frequency]));
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {[...pack.difficulty].sort((a, b) => b.score - a.score).map((d) => {
        const c = diffColor(d.score);
        return (
          <div key={d.conceptId} className="rounded-lg border p-3" style={{ background: `${c}${Math.round(18 + d.score * 40).toString(16).padStart(2, "0")}`, borderColor: `${c}55` }} title={unit.get(d.conceptId)}>
            <div className="text-[13px] font-semibold leading-tight">{label.get(d.conceptId) ?? d.conceptId}</div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="mono font-bold" style={{ color: c }}>{Math.round(d.score * 100)} diff</span>
              <span className="text-muted">{Math.round((freq.get(d.conceptId) ?? 0) * 100)}% exam</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { fearColor };
