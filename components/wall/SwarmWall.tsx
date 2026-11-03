"use client";
/** Lane: wall. /wall/swarm: "how it was built". Agent-lane graph + live board rail + giant counters. */
import Link from "next/link";
import { useEffect } from "react";
import BoardTicker from "./BoardTicker";
import SwarmCounter from "./SwarmCounter";
import QRPanel from "./QRPanel";
import SwarmGraph from "./SwarmGraph";
import { useBoard } from "./useBoard";

export default function SwarmWall() {
  const { feed, live } = useBoard();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4 p-5 lg:p-7">
      <header className="flex items-center gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">How it was built</div>
          <h1 className="text-[clamp(1.5rem,3vw,3rem)] font-black leading-none tracking-tight">
            Built by a <span className="text-goldb">swarm</span> of AI agents, coordinating on one PR
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-5 text-sm text-muted">
          <span className="hidden items-center gap-4 xl:flex">
            {[["GrokBot", "#d6c78a"], ["Antigravity", "#3d8bff"], ["Claude", "#ff9b6b"]].map(([n, c]) => (
              <span key={n} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{n}</span>
            ))}
          </span>
          <Link href="/wall" className="rounded-lg border border-electric/50 bg-electric/10 px-3 py-1.5 font-semibold text-electric hover:bg-electric/20">← Course wall</Link>
          <Link href="/" className="hover:text-foreground">Exit</Link>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,28%)]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-panel/60"><SwarmGraph feed={feed} className="h-full w-full" /></div>
          <SwarmCounter feed={feed} />
        </div>
        <aside className="flex min-h-0 flex-col gap-4"><div className="min-h-0 flex-1"><BoardTicker feed={feed} live={live} max={8} /></div><QRPanel /></aside>
      </div>
    </div>
  );
}
