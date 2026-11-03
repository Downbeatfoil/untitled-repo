"use client";
/** Lane: viz. Big animated survival-odds dial for /roast. High odds = green, low = red. */
import { useEffect, useRef, useState } from "react";
import { difficultyColor } from "./colors";

export interface RoastMeterProps {
  /** Survival odds 0..100. */
  odds: number;
  /** Override the verdict label. */
  label?: string;
  caption?: string;
  /** Pixel width. Default 360. */
  size?: number;
  className?: string;
}

export function survivalLabel(odds: number): string {
  if (odds >= 75) return "Cruise control";
  if (odds >= 55) return "Survivable";
  if (odds >= 35) return "Send coffee";
  if (odds >= 15) return "Send help";
  return "Pray for GPA";
}

const CX = 150, CY = 150, R = 112;
const START = 135, SWEEP = 270; // degrees; dial opens at the bottom
const pt = (deg: number, r = R) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};
const arc = (a0: number, a1: number, r = R) => {
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const easeOutBack = (t: number) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

export default function RoastMeter({ odds, label, caption = "Survival odds", size = 360, className = "" }: RoastMeterProps) {
  const target = Math.max(0, Math.min(100, Number.isFinite(odds) ? odds : 0));
  const [v, setV] = useState(0);
  const cur = useRef(0);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { cur.current = target; setV(target); return; }
    const from = cur.current;
    const t0 = performance.now() + 250;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - t0) / 1900));
      cur.current = from + (target - from) * easeOutBack(t);
      setV(cur.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const shown = Math.max(0, Math.min(100, v));
  const col = difficultyColor(1 - shown / 100);
  const angle = START + (shown / 100) * SWEEP;
  const needleDeg = START + (Math.max(-4, Math.min(104, v)) / 100) * SWEEP;
  const [nx, ny] = pt(needleDeg, R - 24);
  const verdict = label ?? survivalLabel(target);

  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(target)} aria-label={`${caption}: ${Math.round(target)}%, ${verdict}`}>
      <svg viewBox="0 0 300 260" width={size} height={(size * 260) / 300} className="overflow-visible">
        <defs>
          <linearGradient id="rm-g" x1="0" y1="1" x2="1" y2="1">
            <stop offset="0%" stopColor={difficultyColor(1)} />
            <stop offset="50%" stopColor={difficultyColor(0.5)} />
            <stop offset="100%" stopColor={difficultyColor(0)} />
          </linearGradient>
          <filter id="rm-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={arc(START, START + SWEEP)} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth={22} strokeLinecap="round" />
        <path d={arc(START, START + SWEEP)} fill="none" stroke="url(#rm-g)" strokeWidth={22} strokeLinecap="round" opacity={0.2} />
        {shown > 0.4 && <path d={arc(START, Math.max(START + 0.5, angle))} fill="none" stroke={col} strokeWidth={22} strokeLinecap="round" filter="url(#rm-glow)" />}
        {Array.from({ length: 11 }, (_, i) => {
          const a = START + (i / 10) * SWEEP;
          const [x1, y1] = pt(a, R + 18), [x2, y2] = pt(a, R + (i % 5 === 0 ? 29 : 24));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.5)" strokeWidth={i % 5 === 0 ? 2 : 1.2} />;
        })}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#f1f5f9" strokeWidth={4} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={11} fill="#0b1020" stroke="#f1f5f9" strokeWidth={4} />
        <text x={CX} y={CY + 62} textAnchor="middle" fontSize={50} fontWeight={900} fill={col} style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(shown)}<tspan fontSize={24} dx={2}>%</tspan></text>
        <text x={CX - 66} y={CY + 100} textAnchor="middle" fontSize={11} fill="#64748b">doomed</text>
        <text x={CX + 66} y={CY + 100} textAnchor="middle" fontSize={11} fill="#64748b">thriving</text>
      </svg>
      <div className="-mt-3 text-center">
        <div className="text-2xl font-extrabold tracking-wide" style={{ color: col }}>{verdict}</div>
        <div className="text-xs uppercase tracking-widest text-slate-400">{caption}</div>
      </div>
    </div>
  );
}
