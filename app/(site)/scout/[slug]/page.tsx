"use client";
/** Lane: pages. Live scout run: 4 agent cards, log ticker, source feed. */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { startScout } from "@/lib/api-client";
import type { AgentName, AgentStatus, ScoutEvent, Source } from "@/shared/contract";
import { AGENTS, normalizeCourseCode } from "@/shared/contract";
import { ErrorBox, KindBadge } from "../../_components/ui";
import { buildSeedPack } from "../../_lib/seed";

interface LogLine { agent: AgentName; message: string; t: number }

const STATUS_STYLE: Record<AgentStatus, { c: string; label: string }> = {
  queued: { c: "#5b6679", label: "Queued" },
  searching: { c: "#3d8bff", label: "Searching" },
  thinking: { c: "#d6c78a", label: "Thinking" },
  done: { c: "#3ddc97", label: "Done" },
  error: { c: "#ff5d6c", label: "Error" },
};

export default function ScoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const code = normalizeCourseCode(String(slug).replace("-", " "));
  const [agents, setAgents] = useState<Record<AgentName, { status: AgentStatus; message: string }>>(
    () => Object.fromEntries(AGENTS.map((a) => [a.name, { status: "queued" as AgentStatus, message: "Waiting for dispatch" }])) as never,
  );
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<(() => void) | null>(null);
  const logEnd = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setAgents(Object.fromEntries(AGENTS.map((a) => [a.name, { status: "queued" as AgentStatus, message: "Waiting for dispatch" }])) as never);
    setLogs([]); setSources([]); setReady(false); setError(null); setElapsed(0);
  }, []);

  useEffect(() => {
    reset();
    let done = false; void done;
    const onEvent = (e: ScoutEvent) => {
      if (e.type === "agent") setAgents((p) => ({ ...p, [e.agent]: { status: e.status, message: e.message } }));
      else if (e.type === "source") setSources((p) => (p.some((s) => s.id === e.source.id) ? p : [...p, e.source]));
      else if (e.type === "log") setLogs((p) => [...p.slice(-80), { agent: e.agent, message: e.message, t: Date.now() }]);
      else if (e.type === "pack") { done = true; setReady(true); }
      else if (e.type === "error") setError(e.message);
      else if (e.type === "done") { done = true; setReady(true); }
    };
    abortRef.current = startScout({ courseCode: code }, onEvent);
    return () => abortRef.current?.();
  }, [code, run, reset]);

  useEffect(() => {
    if (error || ready) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [error, ready, run]);

  useEffect(() => { logEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [logs.length]);

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => router.push(`/course/${slug}`), 1500);
    return () => clearTimeout(id);
  }, [ready, router, slug]);

  const doneCount = AGENTS.filter((a) => agents[a.name].status === "done").length;
  const progress = ready ? 100 : Math.min(96, Math.round((doneCount / AGENTS.length) * 70 + Math.min(sources.length, 12) * 2.2));
  const hasSeed = !!buildSeedPack(code);

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-goldb">← All courses</Link>
          <div className="eyebrow mt-3">Scout run · live</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Scouting <span className="text-gradient">{code}</span>
          </h1>
        </div>
        <div className="mono text-right text-sm text-muted">
          <div>T+{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</div>
          <div className="text-dim">{sources.length} sources found</div>
        </div>
      </div>

      {/* progress */}
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#b3a369,#3d8bff)", boxShadow: "0 0 18px rgba(61,139,255,.6)" }} />
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBox message={error} onRetry={() => setRun((r) => r + 1)}>
            {hasSeed && <Link href={`/course/${slug}`} className="btn btn-ghost">Open seeded pack</Link>}
            <Link href="/" className="btn btn-ghost">Pick another course</Link>
          </ErrorBox>
        </div>
      )}

      {ready && (
        <div className="card anim-up mt-6 flex items-center gap-4 border-[rgba(61,220,151,0.4)] p-5">
          <div className="text-3xl">✅</div>
          <div>
            <div className="text-lg font-bold">Course pack ready</div>
            <div className="text-sm text-muted">Opening your SmartPath dashboard…</div>
          </div>
          <Link href={`/course/${slug}`} className="btn btn-gold ml-auto">Open now →</Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {AGENTS.map((a, i) => {
              const st = agents[a.name];
              const s = STATUS_STYLE[st.status];
              const active = st.status === "searching" || st.status === "thinking";
              return (
                <div key={a.name} className="card relative overflow-hidden p-5 anim-up" style={{ animationDelay: `${i * 80}ms`, borderColor: active ? `${s.c}88` : undefined, boxShadow: active ? `0 0 40px -14px ${s.c}` : undefined }}>
                  {active && <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${s.c},transparent)` }} />}
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${active ? "pulse-ring" : ""}`} style={{ background: `${s.c}1f`, border: `1px solid ${s.c}55` }}>{a.emoji}</div>
                    <span className="badge" style={{ color: s.c, background: `${s.c}1a`, borderColor: `${s.c}44` }}>{active && <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: s.c }} />}{s.label}</span>
                  </div>
                  <div className="mt-4 text-lg font-bold">{a.label}</div>
                  <div className="mono text-[11px] uppercase tracking-widest text-dim">{a.tool === "reasoning" ? "reasoning" : `${a.tool} search`}</div>
                  <p className={`mt-3 min-h-[2.5rem] text-sm text-muted ${active ? "cursor-blink" : ""}`}>{st.message}</p>
                </div>
              );
            })}
          </div>

          {/* log ticker */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-bad/70" /><i className="h-2.5 w-2.5 rounded-full bg-warn/70" /><i className="h-2.5 w-2.5 rounded-full bg-good/70" /></span>
              <span className="mono ml-2 text-xs text-dim">grok-swarm · live thoughts</span>
            </div>
            <div className="mono h-56 space-y-1.5 overflow-y-auto p-4 text-[12.5px] leading-relaxed">
              {logs.length === 0 && <div className="cursor-blink text-dim">Dispatching agents</div>}
              {logs.map((l, i) => {
                const a = AGENTS.find((x) => x.name === l.agent);
                return (
                  <div key={i} className="anim-in flex gap-2">
                    <span className="shrink-0 text-gold">{a?.emoji} {a?.label.split(" ")[0].toLowerCase()}</span>
                    <span className="text-muted">{l.message}</span>
                  </div>
                );
              })}
              <div ref={logEnd} />
            </div>
          </div>
        </div>

        {/* source feed */}
        <aside className="card flex max-h-[760px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="font-semibold">Source feed</div>
            <span className="badge border-line2 text-muted">{sources.length}</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {sources.length === 0 && <div className="py-10 text-center text-sm text-dim">Sources will fly in here as agents find them…</div>}
            {[...sources].reverse().map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="anim-slide block rounded-xl border border-line bg-[rgba(255,255,255,0.02)] p-3 transition-colors hover:border-gold">
                <div className="flex items-center justify-between gap-2"><KindBadge kind={s.kind} /><span className="mono text-[10px] text-dim">{s.foundBy}</span></div>
                <div className="mt-2 text-sm font-semibold leading-snug">{s.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted">{s.snippet}</div>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
