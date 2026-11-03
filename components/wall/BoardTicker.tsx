"use client";
/** Lane: wall. Right-rail live ticker of the build board (newest first). */
import { useRef } from "react";
import type { BoardFeed } from "./types";
import { TYPE_COLOR, ago, laneColor } from "./types";
import { useNow } from "./useBoard";

export default function BoardTicker({ feed, live, max = 9 }: { feed: BoardFeed; live: boolean; max?: number }) {
  const now = useNow(5000);
  const seen = useRef<Set<number>>(new Set());
  const first = seen.current.size === 0;
  const posts = [...feed.posts].reverse().slice(0, max);
  const fresh = new Set(posts.filter((p) => !seen.current.has(p.id)).map((p) => p.id));
  posts.forEach((p) => seen.current.add(p.id));

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-line bg-panel/80 p-5">
      <style>{`@keyframes wl-slide{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}`}</style>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Build board · live</h2>
        <span className="flex items-center gap-2 text-xs text-muted">
          <span className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-good" : "bg-warn"}`} />
          {live ? "GitHub" : feed.source === "stale" ? "cached" : "snapshot"}
        </span>
      </header>
      <ol className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden">
        {posts.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-line bg-panel2/80 px-4 py-3"
            style={{ borderLeft: `3px solid ${laneColor(p.lane)}`, animation: !first && fresh.has(p.id) ? "wl-slide .6s ease-out" : undefined }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider" style={{ color: laneColor(p.lane) }}>{p.lane}</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-black" style={{ background: TYPE_COLOR[p.type] ?? "#8a96aa" }}>{p.type}</span>
              {p.to.length > 0 && <span className="truncate text-dim">→ {p.to.join(", ")}</span>}
              <span className="ml-auto shrink-0 text-dim">{ago(p.at, now)}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[15px] leading-snug text-foreground/90">{p.message}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
