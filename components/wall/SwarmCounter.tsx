"use client";
/** Lane: wall. Giant animated counters: agents · board posts · commits · minutes. Refreshes with the board feed (20 s). */
import { useEffect, useRef, useState } from "react";
import type { BoardFeed } from "./types";
import { LANES } from "./types";
import { useNow } from "./useBoard";

function useCount(target: number, ms = 1200): number {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const val = a + (target - a) * e;
      from.current = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return Math.round(v);
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const v = useCount(value);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-panel/80 px-4 py-3 text-center">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
      <div className="text-[clamp(2rem,min(4.2vw,7vh),4.5rem)] font-extrabold leading-none tabular-nums" style={{ color, textShadow: `0 0 28px ${color}55` }}>{v}</div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-muted">{label}</div>
    </div>
  );
}

export default function SwarmCounter({ feed, className = "" }: { feed: BoardFeed; className?: string }) {
  const now = useNow(15_000);
  const minutes = now ? Math.max(0, Math.floor((now - new Date(feed.firstAt).getTime()) / 60000)) : 0;
  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${className}`}>
      <Stat label="agents" value={LANES.length + 1} color="#d6c78a" />
      <Stat label="board posts" value={feed.total} color="#3d8bff" />
      <Stat label="commits" value={feed.commits} color="#3ddc97" />
      <Stat label="minutes" value={minutes} color="#ff9b6b" />
    </div>
  );
}
