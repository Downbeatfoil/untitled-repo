"use client";
/** Lane: viz. Sources popping in over time (newest on top). Feed it the growing sources array during a scout. */
import { useEffect, useMemo, useRef, useState } from "react";
import { AGENTS, type Source } from "@/shared/contract";
import { KIND_META } from "./SourceKindDonut";

export interface SourceTimelineProps {
  sources: Source[];
  /** Max height in px before the list scrolls. Default 420. */
  maxHeight?: number;
  className?: string;
}

const emoji = (n: string) => AGENTS.find((a) => a.name === n)?.emoji ?? "🔎";
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

export default function SourceTimeline({ sources, maxHeight = 420, className = "" }: SourceTimelineProps) {
  const t0 = useRef<number>(Date.now());
  const stamps = useRef<Map<string, number>>(new Map());
  const [, force] = useState(0);

  // record when each source first appeared (for the "+12s" labels)
  sources.forEach((s) => { if (!stamps.current.has(s.id)) stamps.current.set(s.id, Date.now()); });
  useEffect(() => { const t = setInterval(() => force((x) => x + 1), 1000); return () => clearInterval(t); }, []);

  const ordered = useMemo(() => [...sources].reverse(), [sources]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    sources.forEach((s) => m.set(s.kind, (m.get(s.kind) ?? 0) + 1));
    return [...m.entries()];
  }, [sources]);
  const elapsed = (id: string) => Math.max(0, Math.round(((stamps.current.get(id) ?? Date.now()) - t0.current) / 1000));

  return (
    <div className={`w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 p-3 ${className}`}>
      <style>{`@keyframes vz-pop{0%{opacity:0;transform:translateY(-14px) scale(.96)}60%{opacity:1;transform:translateY(2px) scale(1.01)}100%{opacity:1;transform:none}}`}</style>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">Sources <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 tabular-nums">{sources.length}</span></div>
        <div className="flex h-2 w-32 overflow-hidden rounded-full bg-slate-800">
          {counts.map(([k, n]) => <span key={k} title={`${KIND_META[k as keyof typeof KIND_META]?.label ?? k}: ${n}`} style={{ width: `${(n / Math.max(1, sources.length)) * 100}%`, background: KIND_META[k as keyof typeof KIND_META]?.color ?? "#64748b", transition: "width .5s" }} />)}
        </div>
      </div>
      {ordered.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-slate-500"><span className="animate-pulse">Agents are searching…</span></div>
      ) : (
        <ol className="relative space-y-2 overflow-y-auto pr-1" style={{ maxHeight }}>
          <span className="absolute bottom-2 left-[11px] top-2 w-px bg-slate-700/70" />
          {ordered.map((s) => {
            const meta = KIND_META[s.kind] ?? KIND_META.other;
            return (
              <li key={s.id} className="relative flex gap-2.5 pl-0" style={{ animation: "vz-pop .55s cubic-bezier(.2,.8,.2,1) both" }}>
                <span className="z-10 mt-1 flex h-[23px] w-[23px] flex-none items-center justify-center rounded-full border-2 text-[11px]" style={{ borderColor: meta.color, background: "#0b1020" }} title={s.foundBy}>{emoji(s.foundBy)}</span>
                <a href={s.url} target="_blank" rel="noreferrer" className="block min-w-0 flex-1 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5 transition-colors hover:border-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-950" style={{ background: meta.color }}>{s.kind}</span>
                    <span className="truncate text-sm font-semibold text-slate-100">{s.title}</span>
                    <span className="ml-auto flex-none text-[10px] tabular-nums text-slate-500">+{elapsed(s.id)}s</span>
                  </div>
                  <div className="truncate text-[11px] text-slate-500">{host(s.url)}</div>
                  {s.snippet && <div className="mt-0.5 line-clamp-2 text-xs text-slate-400">{s.snippet}</div>}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
