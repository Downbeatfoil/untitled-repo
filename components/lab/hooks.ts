"use client";
/** Lane: lab. Tiny animation hooks. */
import { useEffect, useState } from "react";

export function useCountUp(target: number, ms = 1400, run = true): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, run]);
  return v;
}

export function useTypewriter(text: string, run = true, cps = 70): { out: string; done: boolean } {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!run) return;
    const id = setInterval(() => setN((x) => (x >= text.length ? x : x + 2)), 1000 / cps * 2);
    return () => clearInterval(id);
  }, [text, run, cps]);
  return { out: text.slice(0, n), done: n >= text.length };
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { try { window.prompt("Copy this:", text); } catch { /* noop */ } return false; }
}
