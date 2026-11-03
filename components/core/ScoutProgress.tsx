"use client";
/**
 * Lane: components. Self-contained scout run: calls startScout (lib/api-client), renders the 4 agent
 * cards, live log ticker and source feed, then "Course pack ready" and fires onComplete(pack).
 * Pages just drop this in: <ScoutProgress courseCode="CS 1332" onComplete={() => router.push(...)} />
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { startScout } from "@/lib/api-client";
import { AGENTS, type AgentName, type AgentStatus, type CoursePack, type ScoutEvent, type Source } from "@/shared/contract";
import AgentCard from "./AgentCard";
import Button from "./Button";
import Fx from "./Fx";
import LogTicker, { type LogLine } from "./LogTicker";
import SourceFeed from "./SourceFeed";

type AgentState = Record<AgentName, { status: AgentStatus; message: string }>;
const initialAgents = (): AgentState =>
  Object.fromEntries(AGENTS.map((a) => [a.name, { status: "queued" as AgentStatus, message: "" }])) as AgentState;

export interface ScoutProgressProps {
  courseCode: string;
  fresh?: boolean;
  /** Fired once when the pack arrives (after `completeDelayMs` so users see "Course pack ready"). */
  onComplete?: (pack: CoursePack) => void;
  onError?: (message: string) => void;
  /** Delay before onComplete. Default 1400ms. */
  completeDelayMs?: number;
}

export default function ScoutProgress({ courseCode, fresh, onComplete, onError, completeDelayMs = 1400 }: ScoutProgressProps) {
  const [agents, setAgents] = useState<AgentState>(initialAgents);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [pack, setPack] = useState<CoursePack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const cb = useRef({ onComplete, onError });
  cb.current = { onComplete, onError };

  const handle = useCallback((e: ScoutEvent) => {
    switch (e.type) {
      case "agent":
        setAgents((prev) => ({ ...prev, [e.agent]: { status: e.status, message: e.message || prev[e.agent].message } }));
        break;
      case "source":
        setSources((prev) => (prev.some((s) => s.id === e.source.id) ? prev : [...prev, e.source]));
        break;
      case "log":
        setLogs((prev) => [...prev, { agent: e.agent, message: e.message }].slice(-50));
        break;
      case "pack":
        setPack(e.pack);
        break;
      case "error":
        setError(e.message);
        cb.current.onError?.(e.message);
        break;
    }
  }, []);

  useEffect(() => {
    setAgents(initialAgents());
    setLogs([]);
    setSources([]);
    setPack(null);
    setError(null);
    const abort = startScout({ courseCode, fresh }, handle);
    return abort;
  }, [courseCode, fresh, run, handle]);

  useEffect(() => {
    if (!pack) return;
    setAgents((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, status: "done" }])) as AgentState);
    const t = setTimeout(() => cb.current.onComplete?.(pack), completeDelayMs);
    return () => clearTimeout(t);
  }, [pack, completeDelayMs]);

  const doneCount = AGENTS.filter((a) => agents[a.name].status === "done").length;
  const pct = pack ? 100 : Math.round((doneCount / AGENTS.length) * 85 + (sources.length ? Math.min(sources.length, 10) : 0));

  return (
    <div className="w-full space-y-6">
      <Fx />
      <div>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#B3A369]">Scouting</p>
            <h2 className="text-2xl font-bold text-white">{courseCode}</h2>
          </div>
          <span className="text-sm tabular-nums text-neutral-400" aria-live="polite">
            {pack ? "Complete" : `${doneCount}/${AGENTS.length} agents done`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, pct)}
          aria-label="Scout progress"
          className="h-2 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B3A369] to-[#2D7DFF] transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
          />
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {pack
          ? `Course pack ready for ${courseCode}`
          : AGENTS.filter((a) => agents[a.name].status !== "queued")
              .map((a) => `${a.label} ${agents[a.name].status}`)
              .join(". ")}
      </p>

      {error && !pack && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
          <span>Scout hit a snag: {error}</span>
          <Button size="sm" variant="outline" onClick={() => setRun((r) => r + 1)}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AGENTS.map((a) => (
          <AgentCard key={a.name} agent={a.name} status={agents[a.name].status} message={agents[a.name].message} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <LogTicker logs={logs} />
        <SourceFeed sources={sources} />
      </div>

      {pack && (
        <div className="sp-fly-in rounded-2xl border border-[#B3A369]/50 bg-[#B3A369]/10 p-5 text-center" role="status">
          <p className="text-xl font-bold text-[#D9CD9A]">✨ Course pack ready</p>
          <p className="mt-1 text-sm text-neutral-300">
            {pack.concepts.length} concepts · {pack.sources.length} sources{pack.mocked ? " · demo data" : ""}
          </p>
          {onComplete && (
            <div className="mt-3">
              <Button onClick={() => onComplete(pack)}>Open course →</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
