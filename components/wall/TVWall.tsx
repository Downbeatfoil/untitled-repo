"use client";
/**
 * Lane: wall. /wall TV mode: laptop facing the judges. Rotates seeded course packs every 12 s
 * (fear gauge, hardest concept, top exam topics, a student quote) with a live build-board rail.
 * Keys: space = pause, ←/→ = prev/next, f = fullscreen.
 */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FearGauge } from "@/components/viz";
import BoardTicker from "./BoardTicker";
import SwarmCounter from "./SwarmCounter";
import type { WallCourse } from "./types";
import { useBoard, useNow } from "./useBoard";

const ROTATE_MS = 12_000;
const TICK_MS = 100;

export default function TVWall({ courses }: { courses: WallCourse[] }) {
  const list = courses.length ? courses : [];
  const { feed, live } = useBoard();
  const now = useNow(30_000);
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState("");

  const go = useCallback((d: number) => {
    setIdx((i) => (list.length ? (i + d + list.length) % list.length : 0));
    setElapsed(0);
  }, [list.length]);

  useEffect(() => {
    if (paused || list.length < 2) return;
    const id = setInterval(() => setElapsed((e) => e + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [paused, list.length]);
  useEffect(() => {
    if (elapsed >= ROTATE_MS) go(1);
  }, [elapsed, go]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1400); };
  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " ") { e.preventDefault(); setPaused((p) => { flash(p ? "▶ Rotating" : "❚❚ Paused"); return !p; }); }
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "f" || e.key === "F") fullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, fullscreen]);

  const c = list[idx];
  const clock = new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex h-full flex-col gap-4 p-5 lg:p-7">
      <style>{`
        @keyframes wl-in{from{opacity:0;transform:translateY(14px) scale(.99)}to{opacity:1;transform:none}}
        @keyframes wl-grow{from{width:0}}
        @keyframes wl-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
      `}</style>
      <header className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-gold/50 bg-gold/10 text-xl font-black text-goldb">S</div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">SmartPath <span className="text-goldb">Scout</span></div>
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">Georgia Tech · mission control</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-5 text-sm text-muted">
          <span className="hidden items-center gap-2 xl:flex"><kbd className="rounded border border-line2 px-1.5 py-0.5 text-xs">space</kbd> pause <kbd className="rounded border border-line2 px-1.5 py-0.5 text-xs">← →</kbd> flip <kbd className="rounded border border-line2 px-1.5 py-0.5 text-xs">f</kbd> fullscreen</span>
          <Link href="/wall/swarm" className="rounded-lg border border-electric/50 bg-electric/10 px-3 py-1.5 font-semibold text-electric hover:bg-electric/20">How it was built →</Link>
          <Link href="/" className="hover:text-foreground">Exit</Link>
          <span className="text-2xl font-bold tabular-nums text-foreground">{clock}</span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,28%)]">
        <div className="flex min-h-0 flex-col gap-4">
          <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-panel/70 p-6 lg:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-30" style={{ background: "linear-gradient(180deg, rgba(61,139,255,.35), transparent)", animation: "wl-scan 7s linear infinite" }} />
            {c ? (
              <div key={c.code} className="relative grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" style={{ animation: "wl-in .7s ease-out" }}>
                <div className="flex min-w-0 flex-col">
                  <div className="text-xs font-bold uppercase tracking-[0.35em] text-gold">Most feared · {idx + 1} of {list.length}</div>
                  <h1 className="mt-2 text-[clamp(2.5rem,5.5vw,6rem)] font-black leading-none tracking-tight text-goldb">{c.code}</h1>
                  <div className="mt-2 text-[clamp(1.1rem,2vw,2rem)] font-semibold text-foreground/90">{c.title}</div>
                  <p className="mt-3 line-clamp-3 max-w-xl text-[clamp(.9rem,1.2vw,1.2rem)] leading-snug text-muted">{c.summary}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                    <FearGauge score={c.fearScore} size={380} caption="Fear score" />
                    <div className="space-y-2 pb-4 text-right text-sm text-muted">
                      <div><span className="text-2xl font-extrabold tabular-nums text-electric">{c.conceptCount}</span> concepts</div>
                      <div><span className="text-2xl font-extrabold tabular-nums text-good">{c.sourceCount}</span> cited sources</div>
                      {c.mocked && <div className="text-xs text-dim">seeded demo pack</div>}
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                  <section className="rounded-xl border border-bad/40 bg-bad/5 p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-bad">Hardest concept</h3>
                      <span className="text-2xl font-extrabold tabular-nums text-bad">{Math.round(c.hardest.score * 100)}%</span>
                    </div>
                    <div className="mt-1 text-[clamp(1.4rem,2.6vw,2.8rem)] font-extrabold leading-tight">{c.hardest.label}</div>
                    <p className="mt-1 line-clamp-2 text-[clamp(.85rem,1.1vw,1.1rem)] text-muted">{c.hardest.description}</p>
                  </section>

                  <section className="rounded-xl border border-line bg-panel2/70 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold">What&apos;s on the exam</h3>
                    <div className="mt-3 space-y-2.5">
                      {c.topics.map((t, i) => (
                        <div key={t.label} className="flex items-center gap-3">
                          <div className="w-[38%] truncate text-[clamp(.85rem,1.1vw,1.1rem)] font-semibold">{t.label}</div>
                          <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full" style={{ width: `${Math.round(t.frequency * 100)}%`, background: "linear-gradient(90deg,#b3a369,#3d8bff)", animation: `wl-grow 1.1s ${0.15 * i}s ease-out backwards` }} />
                          </div>
                          <div className="w-12 text-right text-sm font-bold tabular-nums text-muted">{Math.round(t.frequency * 100)}%</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {c.quote && (
                    <section className="relative flex-1 rounded-xl border border-electric/30 bg-electric/5 p-5">
                      <div className="absolute -top-1 left-4 text-6xl font-black leading-none text-electric/40">“</div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-electric">Students say</h3>
                      <p className="mt-2 line-clamp-4 text-[clamp(1rem,1.5vw,1.5rem)] font-medium italic leading-snug">{c.quote.text}</p>
                      <div className="mt-2 text-xs uppercase tracking-widest text-dim">via {c.quote.from}</div>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid flex-1 place-items-center text-muted">Loading course packs…</div>
            )}

            <div className="relative mt-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                {list.map((x, i) => (
                  <button key={x.code} onClick={() => { setIdx(i); setElapsed(0); }} aria-label={x.code} className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-goldb" : "w-2 bg-line2 hover:bg-muted"}`} />
                ))}
              </div>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-electric" style={{ width: `${Math.min(100, (elapsed / ROTATE_MS) * 100)}%`, transition: `width ${TICK_MS}ms linear` }} />
              </div>
              <span className="text-xs tabular-nums text-dim">{paused ? "paused" : `${Math.max(0, Math.ceil((ROTATE_MS - elapsed) / 1000))}s`}</span>
            </div>
          </main>
          <SwarmCounter feed={feed} />
        </div>

        <aside className="min-h-0"><BoardTicker feed={feed} live={live} max={8} /></aside>
      </div>

      {toast && <div className="pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-line2 bg-panel2 px-5 py-2 text-lg font-semibold shadow-2xl">{toast}</div>}
    </div>
  );
}
