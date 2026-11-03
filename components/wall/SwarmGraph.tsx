"use client";
/**
 * Lane: wall. Live visualization of the agent lanes as nodes. A node pulses when its lane posts on the board;
 * edges light up (with a travelling packet) on `TO:` handoffs. New posts jump the queue; between live posts
 * the last ~15 posts replay in a loop so the screen is never static.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { BoardFeed, BoardPost } from "./types";
import { LANES, ORCH, TYPE_COLOR } from "./types";

const W = 1000;
const H = 700;
const CX = W / 2;
const CY = 285;
const RX = 385;
const RY = 218;
const STEP_MS = 2200;
const LIFE_MS = 4200;
const PACKET_MS = 1300;

interface Pos { x: number; y: number }
interface Active { key: number; post: BoardPost; t0: number }

const nodePos: Record<string, Pos> = { [ORCH.id]: { x: CX, y: CY } };
LANES.forEach((l, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / LANES.length;
  nodePos[l.id] = { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
});
const META = Object.fromEntries([...LANES, ORCH].map((l) => [l.id, l]));

function targetsOf(p: BoardPost): string[] {
  const all = p.to.includes("all");
  const named = p.to.filter((t) => t !== "all" && META[t] && t !== p.lane);
  if (all) return [...LANES.map((l) => l.id), ORCH.id].filter((id) => id !== p.lane);
  return named.length ? named : p.lane === ORCH.id ? [] : [ORCH.id];
}

export default function SwarmGraph({ feed, className = "" }: { feed: BoardFeed; className?: string }) {
  const [clock, setClock] = useState(0);
  const active = useRef<Active[]>([]);
  const seen = useRef<Set<number> | null>(null);
  const live = useRef<BoardPost[]>([]);
  const replay = useRef(0);
  const keyN = useRef(0);
  const feedRef = useRef(feed);
  const [latest, setLatest] = useState<BoardPost | null>(null);

  // Detect brand-new posts (anything not in the first snapshot) and queue them ahead of the replay.
  useEffect(() => {
    feedRef.current = feed;
    if (seen.current === null) { seen.current = new Set(feed.posts.map((p) => p.id)); return; }
    for (const p of feed.posts) {
      if (!seen.current.has(p.id)) { seen.current.add(p.id); live.current.push(p); }
    }
  }, [feed]);

  useEffect(() => {
    const fire = () => {
      const posts = feedRef.current.posts;
      let post = live.current.shift();
      if (!post && posts.length) {
        const pool = posts.slice(-15);
        post = pool[replay.current % pool.length];
        replay.current += 1;
      }
      if (!post) return;
      const t0 = performance.now();
      active.current = [...active.current.filter((a) => t0 - a.t0 < LIFE_MS), { key: keyN.current++, post, t0 }];
      setLatest(post);
    };
    fire();
    const id = setInterval(fire, STEP_MS);
    let raf = 0;
    const loop = (t: number) => { setClock(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { clearInterval(id); cancelAnimationFrame(raf); };
  }, []);

  // Persistent handoff weights from the recent board history.
  const history = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of feed.posts) for (const t of p.to) {
      if (t === "all" || !META[t] || t === p.lane) continue;
      const k = `${p.lane}>${t}`;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].map(([k, n]) => ({ from: k.split(">")[0], to: k.split(">")[1], n }));
  }, [feed.posts]);

  const postsBy = useMemo(() => Object.fromEntries(feed.lanes.map((l) => [l.lane, l])), [feed.lanes]);
  const nowT = clock || performance.now();
  const live2 = active.current.filter((a) => nowT - a.t0 < LIFE_MS);

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Live map of the AI agent lanes and their board handoffs">
        <defs>
          <filter id="sg-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="sg-hub" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#ffd9c4" /><stop offset="60%" stopColor="#ff9b6b" /><stop offset="100%" stopColor="#7a3b22" />
          </radialGradient>
        </defs>
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="rgba(148,163,184,.12)" strokeDasharray="3 8" />
        <ellipse cx={CX} cy={CY} rx={RX * 0.55} ry={RY * 0.55} fill="none" stroke="rgba(148,163,184,.07)" />

        {/* faint spokes to the hub */}
        {LANES.map((l) => (
          <line key={l.id} x1={CX} y1={CY} x2={nodePos[l.id].x} y2={nodePos[l.id].y} stroke="rgba(148,163,184,.08)" />
        ))}
        {/* handoff history */}
        {history.map((h) => (
          <line key={`${h.from}>${h.to}`} x1={nodePos[h.from]?.x} y1={nodePos[h.from]?.y} x2={nodePos[h.to]?.x} y2={nodePos[h.to]?.y}
            stroke={META[h.from]?.color ?? "#8a96aa"} strokeOpacity={Math.min(0.35, 0.07 + h.n * 0.05)} strokeWidth={Math.min(3.5, 0.8 + h.n * 0.4)} />
        ))}

        {/* live handoffs */}
        {live2.map((a) => {
          const age = nowT - a.t0;
          const from = nodePos[a.post.lane];
          if (!from) return null;
          const fade = Math.max(0, 1 - age / LIFE_MS);
          const prog = Math.min(1, age / PACKET_MS);
          const col = META[a.post.lane]?.color ?? "#d6c78a";
          const targets = targetsOf(a.post);
          const broadcast = a.post.to.includes("all");
          return (
            <g key={a.key}>
              {targets.map((t) => {
                const to = nodePos[t];
                if (!to) return null;
                const e = 1 - Math.pow(1 - prog, 2);
                return (
                  <g key={t}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={col} strokeOpacity={(broadcast ? 0.22 : 0.85) * fade} strokeWidth={broadcast ? 1 : 2.5} filter={broadcast ? undefined : "url(#sg-glow)"} />
                    {prog < 1 && <circle cx={from.x + (to.x - from.x) * e} cy={from.y + (to.y - from.y) * e} r={broadcast ? 3 : 5.5} fill="#fff" filter="url(#sg-glow)" />}
                    {prog >= 1 && !broadcast && <circle cx={to.x} cy={to.y} r={30 + 22 * (1 - fade)} fill="none" stroke={col} strokeOpacity={0.5 * fade} strokeWidth={2} />}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* hub */}
        <g transform={`translate(${CX} ${CY})`}>
          <circle r={54} fill="rgba(255,155,107,.1)" />
          <circle r={40} fill="url(#sg-hub)" filter="url(#sg-glow)" />
          <text textAnchor="middle" y={-2} fontSize={13} fontWeight={800} fill="#2a1208">BOARD</text>
          <text textAnchor="middle" y={13} fontSize={10} fontWeight={700} fill="#2a1208" opacity={0.75}>PR #1</text>
          {live2.some((a) => a.post.lane === ORCH.id) && <circle r={46 + ((nowT / 20) % 24)} fill="none" stroke="#ff9b6b" strokeOpacity={0.45} strokeWidth={2} />}
          <text textAnchor="middle" y={64} fontSize={12} fontWeight={700} fill="#ff9b6b">Orchestrator</text>
        </g>

        {/* lane nodes */}
        {LANES.map((l) => {
          const p = nodePos[l.id];
          const stat = postsBy[l.id];
          const r = 25 + Math.min(12, (stat?.posts ?? 0) * 1.4);
          const mine = live2.filter((a) => a.post.lane === l.id);
          const pulse = mine.length ? Math.max(...mine.map((a) => Math.max(0, 1 - (nowT - a.t0) / 1600))) : 0;
          return (
            <g key={l.id} transform={`translate(${p.x} ${p.y})`}>
              {pulse > 0 && <circle r={r + 8 + (1 - pulse) * 34} fill="none" stroke={l.color} strokeOpacity={0.7 * pulse} strokeWidth={3} />}
              <circle r={r} fill="#0b1020" stroke={l.color} strokeWidth={2 + pulse * 2} filter={pulse > 0.1 ? "url(#sg-glow)" : undefined} />
              <circle r={r - 6} fill={l.color} fillOpacity={0.12 + pulse * 0.4} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#fff">{stat?.posts ?? 0}</text>
              <text y={r + 15} textAnchor="middle" fontSize={13} fontWeight={700} fill="#e2e8f0">{l.label}</text>
              <text y={r + 28} textAnchor="middle" fontSize={10} fill={l.color} opacity={0.85}>{stat?.commits ?? 0} commits</text>
            </g>
          );
        })}
      </svg>

      {latest && (
        <div key={latest.id + ":" + Math.floor(nowT / STEP_MS)} className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto w-[92%] max-w-3xl rounded-xl border border-line2 bg-black/60 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold uppercase tracking-wider" style={{ color: META[latest.lane]?.color ?? "#fff" }}>{latest.lane}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-black" style={{ background: TYPE_COLOR[latest.type] ?? "#8a96aa" }}>{latest.type}</span>
            {latest.to.length > 0 && <span className="text-dim">→ {latest.to.join(", ")}</span>}
          </div>
          <p className="mt-1 line-clamp-2 text-[15px] text-foreground/90">{latest.message}</p>
        </div>
      )}
    </div>
  );
}
