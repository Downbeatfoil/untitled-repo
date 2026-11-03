"use client";
/** Lane: wall. Polls /wall-api/board every 20 s; keeps the last good feed; starts from the static fallback. */
import { useEffect, useState } from "react";
import { FALLBACK_FEED } from "./fallback";
import type { BoardFeed } from "./types";

export function useBoard(intervalMs = 20_000): { feed: BoardFeed; live: boolean } {
  const [feed, setFeed] = useState<BoardFeed>(FALLBACK_FEED);
  const [live, setLive] = useState(false);
  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch("/wall-api/board", { cache: "no-store" });
        const data = (await res.json()) as BoardFeed;
        if (!dead && res.ok && Array.isArray(data?.posts)) {
          setFeed(data);
          setLive(data.source === "github");
        }
      } catch {
        if (!dead) setLive(false);
      }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => { dead = true; clearInterval(id); };
  }, [intervalMs]);
  return { feed, live };
}

/** Re-render every `ms` so relative times / minute counters stay fresh. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(0); // 0 until mounted (avoids SSR/client hydration mismatch)
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** Window height in px (0 before mount). */
export function useViewportHeight(): number {
  const [h, setH] = useState(0);
  useEffect(() => {
    const on = () => setH(window.innerHeight);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return h;
}
