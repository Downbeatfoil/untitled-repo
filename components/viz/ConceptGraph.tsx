"use client";
/**
 * Lane: viz. Interactive concept graph (React Flow).
 * node size ∝ exam frequency · color = difficulty (green→amber→red) · prereq edges = animated arrows
 * layered left→right layout from topological levels (no extra deps) · click node → detail panel.
 */
import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import type { Concept, ConceptEdge, CoursePack, Difficulty, ExamTopic, Source } from "@/shared/contract";
import { difficultyColor, difficultyLabel, pct } from "./colors";

export interface ConceptGraphProps {
  /** Convenience: pass the whole CoursePack instead of the individual arrays. */
  pack?: CoursePack;
  concepts?: Concept[];
  edges?: ConceptEdge[];
  examTopics?: ExamTopic[];
  difficulty?: Difficulty[];
  /** Optional: lets the side panel show source titles for quotes/evidence. */
  sources?: Source[];
  /** Height in px of the graph canvas. Default 520. */
  height?: number;
  /** Highlight a subset (e.g. a prereq chain): everything else is dimmed, edges inside the set animate. */
  highlightIds?: string[];
  /** Optional numbered badges (1-based study order) shown on nodes. */
  stepNumbers?: Record<string, number>;
  /** Fired when a node is selected (null on deselect). */
  onSelectConcept?: (conceptId: string | null) => void;
  className?: string;
}

type ConceptNodeData = {
  label: string;
  size: number;
  color: string;
  freq: number;
  selected: boolean;
  dim: boolean;
  hl: boolean;
  step?: number;
};
type CNode = Node<ConceptNodeData, "concept">;

const LEVEL_GAP = 270;
const ROW_GAP = 40;

function ConceptNode({ data }: NodeProps<CNode>) {
  const { size, color, label, freq, selected, dim, hl, step } = data;
  return (
    <div className="flex flex-col items-center" style={{ width: 150, opacity: dim ? 0.3 : 1, transition: "opacity .2s" }}>
      <div className="relative" style={{ width: size, height: size }}>
        <Handle type="target" position={Position.Left} style={{ opacity: 0, top: "50%" }} />
        <Handle type="source" position={Position.Right} style={{ opacity: 0, top: "50%" }} />
        <div
          className="flex h-full w-full items-center justify-center rounded-full text-[11px] font-bold text-slate-900 transition-transform hover:scale-110"
          style={{
            background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,.55), ${color} 55%)`,
            boxShadow: selected ? `0 0 0 3px #e2e8f0, 0 0 26px ${color}` : hl ? `0 0 0 3px #818cf8, 0 0 22px ${color}` : `0 0 16px -2px ${color}`,
            cursor: "pointer",
          }}
        >
          {freq > 0 ? pct(freq) : ""}
        </div>
        {step !== undefined && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-950 bg-indigo-500 text-[11px] font-extrabold text-white shadow-lg">{step}</div>
        )}
      </div>
      <div className="mt-1.5 text-center text-xs font-semibold leading-tight text-slate-100" style={{ textShadow: "0 1px 4px #020617" }}>
        {label}
      </div>
    </div>
  );
}
const nodeTypes = { concept: ConceptNode };
const EMPTY_CONCEPTS: Concept[] = [];
const EMPTY_EDGES: ConceptEdge[] = [];
const EMPTY_TOPICS: ExamTopic[] = [];
const EMPTY_DIFF: Difficulty[] = [];
const EMPTY_SOURCES: Source[] = [];

/** Longest-path layering over prereq edges (cycle-safe), then barycenter ordering. */
function layout(concepts: Concept[], edges: ConceptEdge[]) {
  const ids = new Set(concepts.map((c) => c.id));
  const prereq = edges.filter((e) => e.relation === "prereq" && ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  const level = new Map<string, number>(concepts.map((c) => [c.id, 0]));
  // Bellman-Ford style relaxation, bounded to n passes so cycles can't loop forever.
  for (let pass = 0; pass < concepts.length; pass++) {
    let changed = false;
    for (const e of prereq) {
      const next = (level.get(e.from) ?? 0) + 1;
      if (next > (level.get(e.to) ?? 0) && next < concepts.length) {
        level.set(e.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }
  const maxLevel = Math.max(0, ...level.values());
  const cols: string[][] = Array.from({ length: maxLevel + 1 }, () => []);
  concepts.forEach((c) => cols[level.get(c.id) ?? 0].push(c.id));

  const allEdges = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const order = new Map<string, number>();
  cols[0].forEach((id, i) => order.set(id, i));
  for (let l = 1; l <= maxLevel; l++) {
    const bary = (id: string) => {
      const ns = allEdges.filter((e) => e.to === id && (level.get(e.from) ?? 0) < l).map((e) => order.get(e.from) ?? 0);
      return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 1e3;
    };
    cols[l].sort((a, b) => bary(a) - bary(b));
    cols[l].forEach((id, i) => order.set(id, i));
  }
  return { cols, level };
}

export default function ConceptGraph({
  pack,
  concepts: conceptsProp,
  edges: edgesProp,
  examTopics: examTopicsProp,
  difficulty: difficultyProp,
  sources: sourcesProp,
  height = 520,
  highlightIds,
  stepNumbers,
  onSelectConcept,
  className = "",
}: ConceptGraphProps) {
  const concepts = conceptsProp ?? pack?.concepts ?? EMPTY_CONCEPTS;
  const edges = edgesProp ?? pack?.edges ?? EMPTY_EDGES;
  const examTopics = examTopicsProp ?? pack?.examTopics ?? EMPTY_TOPICS;
  const difficulty = difficultyProp ?? pack?.difficulty ?? EMPTY_DIFF;
  const sources = sourcesProp ?? pack?.sources ?? EMPTY_SOURCES;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const freq = useMemo(() => new Map(examTopics.map((t) => [t.conceptId, t])), [examTopics]);
  const diff = useMemo(() => new Map(difficulty.map((d) => [d.conceptId, d])), [difficulty]);
  const srcById = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const byId = useMemo(() => new Map(concepts.map((c) => [c.id, c])), [concepts]);

  const hlSet = useMemo(() => (highlightIds && highlightIds.length ? new Set(highlightIds) : null), [highlightIds]);
  const neighbors = useMemo(() => {
    if (hlSet) return hlSet;
    if (!selectedId) return null;
    const set = new Set<string>([selectedId]);
    edges.forEach((e) => {
      if (e.from === selectedId) set.add(e.to);
      if (e.to === selectedId) set.add(e.from);
    });
    return set;
  }, [selectedId, edges, hlSet]);

  const { nodes, flowEdges } = useMemo(() => {
    const { cols } = layout(concepts, edges);
    const sizeOf = (id: string) => 40 + Math.round((freq.get(id)?.frequency ?? 0.1) * 58);
    const out: CNode[] = [];
    cols.forEach((col, l) => {
      const heights = col.map((id) => sizeOf(id) + 34);
      const total = heights.reduce((a, b) => a + b, 0) + ROW_GAP * Math.max(0, col.length - 1);
      let y = -total / 2;
      col.forEach((id, i) => {
        const c = byId.get(id)!;
        const size = sizeOf(id);
        out.push({
          id,
          type: "concept",
          position: { x: l * LEVEL_GAP, y },
          // wrapper is 150 wide; circle centered → handles sit at the circle's edge via the flex layout
          data: {
            label: c.label,
            size,
            color: difficultyColor(diff.get(id)?.score ?? 0.3),
            freq: freq.get(id)?.frequency ?? 0,
            selected: id === selectedId,
            dim: !!neighbors && !neighbors.has(id),
            hl: !!hlSet && hlSet.has(id),
            step: stepNumbers?.[id],
          },
          draggable: true,
        });
        y += heights[i] + ROW_GAP;
      });
    });
    const ids = new Set(concepts.map((c) => c.id));
    const fe: Edge[] = edges
      .filter((e) => ids.has(e.from) && ids.has(e.to))
      .map((e, i) => {
        const prereq = e.relation === "prereq";
        const active = hlSet ? hlSet.has(e.from) && hlSet.has(e.to) : !neighbors || (neighbors.has(e.from) && neighbors.has(e.to) && (e.from === selectedId || e.to === selectedId));
        const stroke = prereq ? "#818cf8" : "#64748b";
        return {
          id: `e${i}-${e.from}-${e.to}`,
          source: e.from,
          target: e.to,
          animated: prereq && active,
          style: { stroke, strokeWidth: prereq ? 2 : 1.25, strokeDasharray: prereq ? undefined : "5 5", opacity: active ? 0.95 : 0.12 },
          markerEnd: prereq ? { type: MarkerType.ArrowClosed, color: stroke, width: 18, height: 18 } : undefined,
        } satisfies Edge;
      });
    return { nodes: out, flowEdges: fe };
  }, [concepts, edges, freq, diff, byId, selectedId, neighbors, hlSet, stepNumbers]);

  const fitOpts = useMemo(
    () => (hlSet ? { padding: 0.25, nodes: [...hlSet].map((id) => ({ id })) } : { padding: 0.18 }),
    [hlSet],
  );

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      onSelectConcept?.(id);
    },
    [onSelectConcept],
  );

  const sel = selectedId ? byId.get(selectedId) : undefined;
  const selFreq = selectedId ? freq.get(selectedId) : undefined;
  const selDiff = selectedId ? diff.get(selectedId) : undefined;
  const prereqs = selectedId ? edges.filter((e) => e.to === selectedId && e.relation === "prereq").map((e) => byId.get(e.from)?.label).filter(Boolean) : [];
  const unlocks = selectedId ? edges.filter((e) => e.from === selectedId && e.relation === "prereq").map((e) => byId.get(e.to)?.label).filter(Boolean) : [];

  if (concepts.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-950/60 text-sm text-slate-400 ${className}`} style={{ height }}>
        No concepts to graph yet.
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 ${className}`} style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={fitOpts}
        minZoom={0.25}
        maxZoom={1.8}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, n) => select(n.id === selectedId ? null : n.id)}
        onPaneClick={() => select(null)}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="rgba(148,163,184,0.22)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      {/* legend */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
        <div className="mb-1 font-semibold text-slate-100">Concept map</div>
        <div className="flex items-center gap-2">
          <span>easy</span>
          <span className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${difficultyColor(0)}, ${difficultyColor(0.5)}, ${difficultyColor(1)})` }} />
          <span>hard</span>
        </div>
        <div className="mt-1 text-slate-400">size = exam frequency · click a node</div>
      </div>

      {/* detail panel */}
      {sel && (
        <aside className="absolute bottom-3 right-3 top-3 w-72 max-w-[85%] overflow-y-auto rounded-xl border border-slate-600/70 bg-slate-900/95 p-4 text-sm text-slate-200 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">{sel.label}</h3>
              {sel.unit && <div className="text-xs text-indigo-300">{sel.unit}</div>}
            </div>
            <button type="button" onClick={() => select(null)} aria-label="Close" className="rounded-md px-2 text-slate-400 hover:bg-slate-800 hover:text-white">
              ✕
            </button>
          </div>
          <p className="mt-2 text-slate-300">{sel.description}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-slate-800/80 p-2">
              <div className="text-lg font-bold text-indigo-300">{selFreq ? pct(selFreq.frequency) : "–"}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">on exams</div>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-2">
              <div className="text-lg font-bold" style={{ color: difficultyColor(selDiff?.score ?? 0.3) }}>
                {selDiff ? difficultyLabel(selDiff.score) : "–"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">difficulty</div>
            </div>
          </div>

          {prereqs.length > 0 && (
            <div className="mt-3 text-xs">
              <span className="text-slate-400">Learn first: </span>
              <span className="text-slate-100">{prereqs.join(", ")}</span>
            </div>
          )}
          {unlocks.length > 0 && (
            <div className="mt-1 text-xs">
              <span className="text-slate-400">Unlocks: </span>
              <span className="text-slate-100">{unlocks.join(", ")}</span>
            </div>
          )}

          {selDiff && selDiff.quotes.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">What students say</div>
              {selDiff.quotes.map((qt, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 pl-2 text-xs italic text-slate-200"
                  style={{ borderColor: qt.sentiment === "negative" ? "#fb7185" : qt.sentiment === "positive" ? "#34d399" : "#94a3b8" }}
                >
                  “{qt.text}”
                  {srcById.get(qt.sourceId) && (
                    <a href={srcById.get(qt.sourceId)!.url} target="_blank" rel="noreferrer" className="mt-0.5 block not-italic text-[10px] text-indigo-300 hover:underline">
                      {srcById.get(qt.sourceId)!.title}
                    </a>
                  )}
                </blockquote>
              ))}
            </div>
          )}
          {selFreq && selFreq.evidenceSourceIds.length > 0 && (
            <div className="mt-3 text-[11px] text-slate-400">
              Seen in {selFreq.evidenceSourceIds.length} source{selFreq.evidenceSourceIds.length === 1 ? "" : "s"}
              {selFreq.evidenceSourceIds.some((s) => srcById.has(s)) && (
                <>: {selFreq.evidenceSourceIds.map((s) => srcById.get(s)?.title).filter(Boolean).join(", ")}</>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
