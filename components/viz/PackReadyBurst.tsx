"use client";
/**
 * Lane: viz. Full-screen "Course pack ready" reveal for the scout → course transition.
 * Renders a fixed overlay; calls onDone after `durationMs` (or on click / Esc / Enter to skip).
 * Usage: <PackReadyBurst pack={pack} onDone={() => router.push(`/course/${slug}`)} />
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { CoursePack } from "@/shared/contract";
import AnimatedNumber from "./AnimatedNumber";
import { difficultyColor } from "./colors";

export interface PackReadyBurstProps {
  /** Full pack (stats derived) or just the code/title. */
  pack?: CoursePack;
  courseCode?: string;
  courseTitle?: string;
  stats?: { concepts?: number; sources?: number; fearScore?: number };
  /** Show the overlay. Default true. */
  active?: boolean;
  /** Total time before onDone fires. Default 2800ms. */
  durationMs?: number;
  onDone?: () => void;
}

const hash = (n: number, seed: number) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
const COLORS = ["#818cf8", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#a78bfa"];

export default function PackReadyBurst({ pack, courseCode, courseTitle, stats, active = true, durationMs = 2800, onDone }: PackReadyBurstProps) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const cb = useRef(onDone);
  cb.current = onDone;

  const code = pack?.course.code ?? courseCode ?? "";
  const title = pack?.course.title ?? courseTitle ?? "";
  const concepts = stats?.concepts ?? pack?.concepts.length;
  const sources = stats?.sources ?? pack?.sources.length;
  const fear = stats?.fearScore ?? pack?.fearScore;

  const particles = useMemo(
    () => Array.from({ length: 56 }, (_, i) => {
      const a = hash(i, 1) * Math.PI * 2;
      const d = 180 + hash(i, 2) * 380;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: 4 + hash(i, 3) * 8, c: COLORS[i % COLORS.length], delay: 0.35 + hash(i, 4) * 0.25, dur: 0.9 + hash(i, 5) * 0.8, r: hash(i, 6) * 720 - 360 };
    }),
    [],
  );

  const finish = useRef(() => {});
  finish.current = () => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    setTimeout(() => cb.current?.(), 350);
  };

  useEffect(() => {
    if (!active) { done.current = false; setLeaving(false); return; }
    const t = setTimeout(() => finish.current(), durationMs);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish.current(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [active, durationMs]);

  if (!active) return null;
  const col = difficultyColor((fear ?? 50) / 100);

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => finish.current()}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 45%, #14183a 0%, #06080c 70%)", animation: `${leaving ? "vz-pr-out .35s ease-in forwards" : "vz-pr-in .35s ease-out"}` }}
    >
      <style>{`
@keyframes vz-pr-in{from{opacity:0}}
@keyframes vz-pr-out{to{opacity:0;transform:scale(1.04)}}
@keyframes vz-pr-ring{0%{transform:scale(.1);opacity:.9}100%{transform:scale(1);opacity:0}}
@keyframes vz-pr-pop{0%{opacity:0;transform:scale(.6) translateY(20px);filter:blur(8px)}60%{transform:scale(1.06)}100%{opacity:1;transform:none;filter:none}}
@keyframes vz-pr-rise{from{opacity:0;transform:translateY(16px)}}
@keyframes vz-pr-fly{0%{opacity:1;transform:translate(0,0) rotate(0) scale(1)}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(var(--r)) scale(.4)}}
@keyframes vz-pr-check{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.vz-pr *{animation-duration:.01s!important;animation-delay:0s!important}}
`}</style>
      <div className="vz-pr relative flex flex-col items-center px-6 text-center">
        {/* shockwave rings */}
        {[0, 0.18, 0.36].map((d, i) => (
          <span key={i} className="pointer-events-none absolute left-1/2 top-[38%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ border: `2px solid ${COLORS[i]}`, animation: `vz-pr-ring 1.6s cubic-bezier(.1,.7,.3,1) ${0.2 + d}s both` }} />
        ))}
        {/* particles */}
        {particles.map((p, i) => (
          <span
            key={i}
            className="pointer-events-none absolute left-1/2 top-[38%] rounded-sm"
            style={{ width: p.s, height: p.s * 0.6, background: p.c, ["--x" as string]: `${p.x}px`, ["--y" as string]: `${p.y}px`, ["--r" as string]: `${p.r}deg`, animation: `vz-pr-fly ${p.dur}s cubic-bezier(.1,.8,.3,1) ${p.delay}s both` }}
          />
        ))}

        <svg width="96" height="96" viewBox="0 0 96 96" className="relative" style={{ animation: "vz-pr-pop .6s cubic-bezier(.2,.9,.3,1.3) .1s both", filter: `drop-shadow(0 0 22px ${col})` }}>
          <circle cx="48" cy="48" r="42" fill="#0b1020" stroke={col} strokeWidth="5" />
          <path d="M28 49 L42 63 L69 34" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset="70" style={{ animation: "vz-pr-check .5s ease-out .5s forwards" }} />
        </svg>

        <h1 className="relative mt-6 text-5xl font-black tracking-tight text-white sm:text-7xl" style={{ animation: "vz-pr-pop .7s cubic-bezier(.2,.9,.3,1.2) .3s both", textShadow: "0 0 40px rgba(129,140,248,.6)" }}>
          Course pack ready
        </h1>
        {code && (
          <div className="relative mt-3 text-2xl font-bold text-indigo-300 sm:text-3xl" style={{ animation: "vz-pr-rise .6s ease-out .7s both" }}>
            {code}{title ? <span className="text-slate-300"> · {title}</span> : null}
          </div>
        )}

        {(concepts !== undefined || sources !== undefined || fear !== undefined) && (
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4" style={{ animation: "vz-pr-rise .6s ease-out .95s both" }}>
            {concepts !== undefined && <Stat n={concepts} label="concepts" color="#818cf8" delay={1000} />}
            {sources !== undefined && <Stat n={sources} label="sources" color="#22d3ee" delay={1100} />}
            {fear !== undefined && <Stat n={fear} label="fear score" color={col} delay={1200} />}
          </div>
        )}
        <div className="relative mt-10 text-xs uppercase tracking-[0.3em] text-slate-500" style={{ animation: "vz-pr-rise .6s ease-out 1.4s both" }}>click or press Enter to continue</div>
      </div>
    </div>
  );
}

function Stat({ n, label, color, delay }: { n: number; label: string; color: string; delay: number }) {
  return (
    <div className="min-w-[120px] rounded-2xl border border-slate-700/70 bg-slate-900/70 px-5 py-3 backdrop-blur">
      <div className="text-4xl font-extrabold" style={{ color }}><AnimatedNumber value={n} delay={delay} duration={1000} /></div>
      <div className="text-[11px] uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}
