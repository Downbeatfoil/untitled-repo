"use client";
/**
 * Lane: viz. Animated SVG: 4 agent nodes orbit a course node; a packet flies in and the
 * agent pulses whenever a new source arrives. Pure SVG + requestAnimationFrame, no deps.
 */
import { useEffect, useRef, useState } from "react";
import { AGENTS, type AgentName, type AgentStatus, type Source } from "@/shared/contract";

export interface AgentSwarmVizProps {
  courseCode: string;
  /** Live statuses from "agent" ScoutEvents (missing = queued). */
  statuses?: Partial<Record<AgentName, AgentStatus>>;
  /** Sources found so far. Each newly appended source fires a pulse from its foundBy agent. */
  sources?: Source[];
  /** Pixel size of the (square) SVG. Default 360. */
  size?: number;
  className?: string;
}

const COLORS: Record<AgentName, string> = {
  "exam-hunter": "#fb7185",
  "syllabus-scout": "#818cf8",
  "student-pulse": "#22d3ee",
  "concept-mapper": "#fbbf24",
};
const STATUS_TEXT: Record<AgentStatus, string> = { queued: "queued", searching: "searching…", thinking: "thinking…", done: "done", error: "error" };
const C = 180; // center of 360 viewBox
const ORBIT = 118;
const PACKET_MS = 900;

interface Packet { id: number; agent: AgentName; t0: number }

export default function AgentSwarmViz({ courseCode, statuses = {}, sources = [], size = 360, className = "" }: AgentSwarmVizProps) {
  const [now, setNow] = useState(0);
  const packets = useRef<Packet[]>([]);
  const seen = useRef(sources.length);
  const nextId = useRef(0);
  const flashes = useRef<Partial<Record<AgentName, number>>>({});
  const t0 = useRef<number | null>(null);
  const [count, setCount] = useState(sources.length);

  // spawn a packet for each newly arrived source
  useEffect(() => {
    if (sources.length > seen.current) {
      const t = performance.now();
      sources.slice(seen.current).forEach((s, i) => {
        packets.current.push({ id: nextId.current++, agent: s.foundBy, t0: t + i * 150 });
        flashes.current[s.foundBy] = t + i * 150;
      });
    }
    seen.current = sources.length;
    setCount(sources.length);
  }, [sources]);

  useEffect(() => {
    let raf = 0;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const tick = (t: number) => {
      if (t0.current === null) t0.current = t;
      packets.current = packets.current.filter((p) => t - p.t0 < PACKET_MS);
      setNow(reduce ? 0 : t - t0.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const base = t0.current ?? 0;
  const angle0 = (now / 1000) * 0.28; // rad/s
  const pos = (i: number) => {
    const a = angle0 + (i * Math.PI * 2) / AGENTS.length - Math.PI / 2;
    return { x: C + ORBIT * Math.cos(a), y: C + ORBIT * Math.sin(a) };
  };
  const clock = now + base; // same timebase as performance.now() timestamps
  const live = AGENTS.some((a) => ["searching", "thinking"].includes(statuses[a.name] ?? "queued"));

  return (
    <div className={`inline-block ${className}`} role="img" aria-label={`${courseCode}: ${count} sources found by ${AGENTS.length} agents`}>
      <svg viewBox="0 0 360 360" width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="sw-core" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#312e81" />
          </radialGradient>
          <filter id="sw-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* orbit rings */}
        <circle cx={C} cy={C} r={ORBIT} fill="none" stroke="rgba(148,163,184,0.22)" strokeDasharray="3 7" />
        <circle cx={C} cy={C} r={ORBIT + 38} fill="none" stroke="rgba(148,163,184,0.08)" />
        <circle cx={C} cy={C} r={54 + (live ? 6 * Math.sin(now / 400) : 0)} fill="rgba(99,102,241,0.12)" />

        {/* spokes */}
        {AGENTS.map((a, i) => {
          const p = pos(i);
          const st = statuses[a.name] ?? "queued";
          return <line key={a.name} x1={C} y1={C} x2={p.x} y2={p.y} stroke={COLORS[a.name]} strokeOpacity={st === "queued" ? 0.12 : 0.35} strokeWidth={1.5} strokeDasharray={st === "searching" || st === "thinking" ? "4 5" : undefined} />;
        })}

        {/* packets */}
        {packets.current.map((pk) => {
          const i = AGENTS.findIndex((a) => a.name === pk.agent);
          if (i < 0) return null;
          const prog = Math.max(0, Math.min(1, (clock - pk.t0) / PACKET_MS));
          if (prog <= 0) return null;
          const p = pos(i);
          const e = 1 - Math.pow(1 - prog, 2);
          return <circle key={pk.id} cx={p.x + (C - p.x) * e} cy={p.y + (C - p.y) * e} r={5 - 2 * prog} fill={COLORS[pk.agent]} opacity={1 - prog * 0.5} filter="url(#sw-glow)" />;
        })}

        {/* core */}
        <circle cx={C} cy={C} r={42} fill="url(#sw-core)" filter="url(#sw-glow)" />
        <text x={C} y={C - 2} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff">{courseCode}</text>
        <text x={C} y={C + 15} textAnchor="middle" fontSize={10} fill="#c7d2fe">{count} source{count === 1 ? "" : "s"}</text>

        {/* agents */}
        {AGENTS.map((a, i) => {
          const p = pos(i);
          const st = statuses[a.name] ?? "queued";
          const active = st === "searching" || st === "thinking";
          const flashAge = clock - (flashes.current[a.name] ?? -1e9);
          const flash = flashAge >= 0 && flashAge < 700 ? 1 - flashAge / 700 : 0;
          const col = st === "error" ? "#f43f5e" : COLORS[a.name];
          return (
            <g key={a.name} transform={`translate(${p.x} ${p.y})`}>
              {(active || flash > 0) && <circle r={26 + (active ? 5 * (1 + Math.sin(now / 250 + i)) : 0) + flash * 16} fill="none" stroke={col} strokeOpacity={0.5 * (active ? 1 : flash)} strokeWidth={2} />}
              <circle r={23} fill="#0b1020" stroke={col} strokeWidth={st === "queued" ? 1.5 : 2.5} strokeOpacity={st === "queued" ? 0.5 : 1} filter={st === "done" || active ? "url(#sw-glow)" : undefined} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={20}>{a.emoji}</text>
              {st === "done" && (
                <g transform="translate(16 -16)"><circle r={7} fill="#10b981" /><path d="M-3 0 L-1 2.2 L3 -2" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
              )}
              <text y={40} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#e2e8f0">{a.label}</text>
              <text y={52} textAnchor="middle" fontSize={9} fill={col} opacity={0.9}>{STATUS_TEXT[st]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
