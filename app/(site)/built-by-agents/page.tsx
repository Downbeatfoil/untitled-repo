"use client";
/** Lane: pages. Live board stats: how this app was built by 12 AI agents. */
import { useCallback, useEffect, useState } from "react";
import { getBoardStats } from "@/lib/api-client";
import type { BoardStats } from "@/shared/contract";
import { BoardActivityChart } from "@/components/viz";
import { Skeleton } from "../_components/ui";

const LANE_META: Record<string, { color: string; who: string }> = {
  pages: { color: "#d6c78a", who: "GrokBot" }, components: { color: "#d6c78a", who: "GrokBot" }, viz: { color: "#d6c78a", who: "GrokBot" },
  api: { color: "#3d8bff", who: "Antigravity" }, ai: { color: "#3d8bff", who: "Antigravity" }, data: { color: "#3d8bff", who: "Antigravity" }, "qa-api": { color: "#3d8bff", who: "Antigravity" },
  export: { color: "#ff9b6b", who: "Claude" }, "qa-e2e": { color: "#ff9b6b", who: "Claude" }, orchestrator: { color: "#ff9b6b", who: "Claude" },
};
const TYPE_COLOR: Record<string, string> = { START: "#3d8bff", DONE: "#3ddc97", BLOCKED: "#ff5d6c", BUG: "#ff5d6c", ASK: "#ffb547", FYI: "#8a96aa" };

const FALLBACK: BoardStats = {
  posts: 0, commits: 0,
  lanes: ["pages", "components", "viz", "api", "ai", "data", "export", "qa-api", "qa-e2e"].map((lane) => ({ lane, posts: 0, commits: 0 })),
  recent: [],
};

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (!Number.isFinite(s)) return "";
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function BuiltByAgents() {
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [offline, setOffline] = useState(false);
  const load = useCallback(() => {
    getBoardStats().then((s) => { setStats(s); setOffline(false); }).catch(() => { setStats((p) => p ?? FALLBACK); setOffline(true); });
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, [load]);

  const maxP = Math.max(1, ...(stats?.lanes.map((l) => l.posts) ?? [1]));
  const maxC = Math.max(1, ...(stats?.lanes.map((l) => l.commits) ?? [1]));

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-3xl">
        <div className="eyebrow">Meta</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Built in 90 minutes by <span className="text-gradient">12 AI agents</span></h1>
        <p className="mt-4 text-muted">
          Twelve coding agents (GrokBot, Antigravity, Claude) each own a lane of the repo and coordinate only through one pinned GitHub PR, the board.
          They post START, DONE, ASK and BUG, ship small commits, and never touch each other&apos;s files. The numbers below are live.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[["Board posts", stats?.posts, "#d6c78a"], ["Commits", stats?.commits, "#3d8bff"], ["Agent lanes", stats?.lanes.length ?? 9, "#3ddc97"]].map(([l, v, c]) => (
          <div key={String(l)} className="card relative overflow-hidden p-6">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl" style={{ background: String(c) }} />
            <div className="eyebrow !text-dim">{l}</div>
            {stats ? <div className="mt-2 text-5xl font-extrabold tabular-nums" style={{ color: String(c) }}>{String(v ?? 0)}</div> : <Skeleton className="mt-3 h-12 w-24" />}
          </div>
        ))}
      </div>
      {offline && <p className="mt-3 text-xs text-dim">Live stats are warming up — showing the lane roster. Auto-refreshing every 15s.</p>}

      {stats && stats.lanes.some((l) => l.posts + l.commits > 0) && (
        <section className="card mt-8 p-6">
          <h2 className="text-lg font-bold">Posts &amp; commits by lane</h2>
          <div className="mt-4"><BoardActivityChart stats={stats} /></div>
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Per-lane activity</h2><span className="flex items-center gap-1.5 text-xs text-dim"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />live · 15s</span></div>
          <div className="mt-5 space-y-4">
            {stats ? stats.lanes.map((l) => {
              const m = LANE_META[l.lane] ?? { color: "#8a96aa", who: "" };
              return (
                <div key={l.lane}>
                  <div className="flex items-baseline justify-between text-sm"><span className="font-semibold"><span className="mono">{l.lane}</span> <span className="text-xs font-normal text-dim">{m.who}</span></span><span className="mono text-xs text-muted">{l.posts} posts · {l.commits} commits</span></div>
                  <div className="mt-1.5 space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(l.posts / maxP) * 100}%`, background: m.color }} /></div>
                    <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full opacity-60 transition-all duration-700" style={{ width: `${(l.commits / maxC) * 100}%`, background: m.color }} /></div>
                  </div>
                </div>
              );
            }) : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
          </div>
          <div className="mt-4 flex gap-4 text-[11px] text-dim"><span>▬ posts</span><span className="opacity-60">▬ commits</span></div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {!stats && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            {stats && stats.recent.length === 0 && <p className="py-10 text-center text-sm text-dim">Agents are spinning up…</p>}
            {stats?.recent.map((r, i) => (
              <div key={i} className="anim-in rounded-xl border border-line bg-[rgba(255,255,255,0.02)] p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="badge" style={{ color: TYPE_COLOR[r.type] ?? "#8a96aa", background: `${TYPE_COLOR[r.type] ?? "#8a96aa"}1a`, borderColor: `${TYPE_COLOR[r.type] ?? "#8a96aa"}40` }}>{r.type}</span>
                  <span className="mono font-semibold text-goldb">{r.lane}</span>
                  <span className="ml-auto text-dim">{ago(r.at)}</span>
                </div>
                <p className="mt-1.5 text-sm leading-snug text-muted">{r.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
