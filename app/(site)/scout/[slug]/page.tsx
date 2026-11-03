"use client";
/** Lane: pages. Scout run: AgentSwarmViz hero + AgentCards + LogTicker + SourceFeed + SourceTimeline, wired to startScout. */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AgentCard from "@/components/core/AgentCard";
import Button from "@/components/core/Button";
import Fx from "@/components/core/Fx";
import LogTicker, { type LogLine } from "@/components/core/LogTicker";
import SourceFeed from "@/components/core/SourceFeed";
import { AgentSwarmViz, SourceTimeline } from "@/components/viz";
import { startScout } from "@/lib/api-client";
import type { AgentName, AgentStatus, ScoutEvent, Source } from "@/shared/contract";
import { AGENTS, normalizeCourseCode } from "@/shared/contract";
import { buildSeedPack } from "../../_lib/seed";

type AgentState = Record<AgentName, { status: AgentStatus; message: string }>;
const initial = (): AgentState =>
  Object.fromEntries(AGENTS.map((a) => [a.name, { status: "queued" as AgentStatus, message: "" }])) as AgentState;

export default function ScoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const code = normalizeCourseCode(String(slug).replace("-", " "));
  const [agents, setAgents] = useState<AgentState>(initial);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const hasSeed = !!buildSeedPack(code);

  useEffect(() => {
    setAgents(initial()); setLogs([]); setSources([]); setReady(false); setError(null); setElapsed(0);
    const abort = startScout({ courseCode: code }, (e: ScoutEvent) => {
      switch (e.type) {
        case "agent": setAgents((p) => ({ ...p, [e.agent]: { status: e.status, message: e.message || p[e.agent].message } })); break;
        case "source": setSources((p) => (p.some((s) => s.id === e.source.id) ? p : [...p, e.source])); break;
        case "log": setLogs((p) => [...p, { agent: e.agent, message: e.message }].slice(-50)); break;
        case "pack": setReady(true); setAgents((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, { ...v, status: "done" }])) as AgentState); break;
        case "done": setReady(true); break;
        case "error": setError(e.message); break;
      }
    });
    return abort;
  }, [code, run]);

  useEffect(() => {
    if (error || ready) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [error, ready, run]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => router.push(`/course/${slug}`), 1500);
    return () => clearTimeout(t);
  }, [ready, router, slug]);

  // Demo safety: live scouting unavailable + seeded pack exists → go there automatically.
  useEffect(() => {
    if (!error || !hasSeed) return;
    const t = setTimeout(() => router.push(`/course/${slug}`), 2500);
    return () => clearTimeout(t);
  }, [error, hasSeed, router, slug]);

  const doneCount = AGENTS.filter((a) => agents[a.name].status === "done").length;
  const progress = ready ? 100 : Math.min(96, Math.round((doneCount / AGENTS.length) * 70 + Math.min(sources.length, 12) * 2.2));
  const statuses = Object.fromEntries(AGENTS.map((a) => [a.name, agents[a.name].status])) as Record<AgentName, AgentStatus>;

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Fx />
      <Link href="/" className="text-sm text-muted hover:text-goldb">← All courses</Link>

      {/* hero */}
      <section className="card relative mt-3 overflow-hidden p-6 sm:p-10">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />Live scout run</div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">Scouting <span className="mono text-gradient">{code}</span></h1>
            <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">Four Grok agents are searching the web and X in parallel. Every source they find is public and cited.</p>
            <div className="mono mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
              <span>T+{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</span>
              <span><b className="text-goldb">{sources.length}</b> sources</span>
              <span><b className="text-goldb">{doneCount}/{AGENTS.length}</b> agents done</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(4, progress)}%`, background: "linear-gradient(90deg,#b3a369,#3d8bff)", boxShadow: "0 0 18px rgba(61,139,255,.6)" }} />
            </div>
          </div>
          <div className="mx-auto"><AgentSwarmViz courseCode={code} statuses={statuses} sources={sources} size={340} /></div>
        </div>
      </section>

      {error && (
        <div role="alert" className="card mt-6 flex flex-wrap items-center gap-3 border-[rgba(255,93,108,0.35)] p-4 text-sm">
          <span className="text-bad">Scout hit a snag: {error}</span>
          <span className="text-muted">{hasSeed ? "Opening the seeded pack…" : "No seeded pack for this course."}</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setRun((r) => r + 1)}>Retry</Button>
            {hasSeed ? <Link href={`/course/${slug}`} className="btn btn-gold">Open seeded pack</Link> : <Link href="/" className="btn btn-ghost">Pick a course</Link>}
          </div>
        </div>
      )}
      {ready && (
        <div className="card anim-up mt-6 flex items-center gap-4 border-[rgba(61,220,151,0.4)] p-5" role="status">
          <div className="text-3xl">✨</div>
          <div><div className="text-lg font-bold">Course pack ready</div><div className="text-sm text-muted">Opening your SmartPath dashboard…</div></div>
          <Link href={`/course/${slug}`} className="btn btn-gold ml-auto">Open now →</Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AGENTS.map((a) => <AgentCard key={a.name} agent={a.name} status={agents[a.name].status} message={agents[a.name].message} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <LogTicker logs={logs} />
        <SourceFeed sources={sources} />
      </div>
      {sources.length > 0 && (
        <section className="card mt-6 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Source timeline</h2>
          <div className="mt-4"><SourceTimeline sources={sources} /></div>
        </section>
      )}
    </main>
  );
}
