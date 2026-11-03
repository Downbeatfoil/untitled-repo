"use client";
/** Lane: viz. Animated semicircle gauge 0–100 with a verdict label. */
import { useEffect, useRef, useState } from "react";
import { difficultyColor } from "./colors";

export interface FearGaugeProps {
  /** 0..100 (CoursePack.fearScore) */
  score: number;
  className?: string;
  /** Pixel width of the SVG (height is half + label). Default 280. */
  size?: number;
  caption?: string;
}

export function fearLabel(score: number): string {
  if (score >= 80) return "Legendary";
  if (score >= 60) return "Brutal";
  if (score >= 40) return "Tough";
  return "Survivable";
}

const R = 90;
const CX = 110;
const CY = 110;
const polar = (deg: number, r = R) => {
  const a = (Math.PI * (180 - deg)) / 180; // 0deg = left, 180deg = right
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const;
};
const arc = (from: number, to: number, r = R) => {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

export default function FearGauge({ score, className = "", size = 280, caption = "Fear score" }: FearGaugeProps) {
  const target = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const dur = 1300;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target]);

  const color = difficultyColor(value / 100);
  const angle = (value / 100) * 180;
  const [nx, ny] = polar(angle, R - 18);
  const id = "fg-grad";

  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="img" aria-label={`${caption}: ${Math.round(target)} out of 100, ${fearLabel(target)}`}>
      <svg viewBox="0 0 220 135" width={size} height={(size * 135) / 220} className="overflow-visible">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={difficultyColor(0)} />
            <stop offset="50%" stopColor={difficultyColor(0.5)} />
            <stop offset="100%" stopColor={difficultyColor(1)} />
          </linearGradient>
          <filter id="fg-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* track */}
        <path d={arc(0, 180)} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={16} strokeLinecap="round" />
        {/* faint full gradient hint */}
        <path d={arc(0, 180)} fill="none" stroke={`url(#${id})`} strokeWidth={16} strokeLinecap="round" opacity={0.18} />
        {/* value arc */}
        {angle > 0.5 && (
          <path d={arc(0, Math.max(angle, 0.5))} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" filter="url(#fg-glow)" />
        )}
        {/* ticks */}
        {[0, 25, 50, 75, 100].map((t) => {
          const [x1, y1] = polar((t / 100) * 180, R + 14);
          const [x2, y2] = polar((t / 100) * 180, R + 20);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.45)" strokeWidth={1.5} />;
        })}
        {/* needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={7} fill="#0f172a" stroke="#e2e8f0" strokeWidth={3} />
        {/* number */}
        <text x={CX} y={CY - 34} textAnchor="middle" fontSize={34} fontWeight={800} fill={color} style={{ fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}
        </text>
        <text x={CX - R - 4} y={CY + 18} textAnchor="middle" fontSize={9} fill="#64748b">0</text>
        <text x={CX + R + 4} y={CY + 18} textAnchor="middle" fontSize={9} fill="#64748b">100</text>
      </svg>
      <div className="-mt-1 text-center">
        <div className="text-xl font-bold tracking-wide" style={{ color }}>{fearLabel(value)}</div>
        <div className="text-xs uppercase tracking-widest text-slate-400">{caption}</div>
      </div>
    </div>
  );
}
