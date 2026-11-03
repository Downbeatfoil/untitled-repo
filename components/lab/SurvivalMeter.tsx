"use client";
/** Lane: lab. Big animated survival-odds ring (270° arc) with count-up. */
import { useEffect, useState } from "react";
import { useCountUp } from "./hooks";

export function oddsColor(o: number): string {
  if (o < 25) return "#ff5d6c";
  if (o < 50) return "#ffb547";
  if (o < 75) return "#d6c78a";
  return "#3ddc97";
}
export function oddsLabel(o: number): string {
  if (o < 20) return "Pray";
  if (o < 40) return "Grim";
  if (o < 60) return "Coin flip";
  if (o < 80) return "Decent";
  return "Cruising";
}

export default function SurvivalMeter({ odds, size = 280 }: { odds: number; size?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t); }, []);
  const shown = useCountUp(odds, 1600, on);
  const r = 100, c = 2 * Math.PI * r, arcLen = c * 0.75;
  const color = oddsColor(odds);
  const fill = (on ? odds : 0) / 100 * arcLen;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`Survival odds ${odds} percent`}>
      <div aria-hidden className="absolute inset-6 rounded-full blur-3xl" style={{ background: `${color}22` }} />
      <svg viewBox="0 0 240 240" width="100%" height="100%" className="relative">
        <defs>
          <linearGradient id="lab-odds-g" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#ff5d6c" /><stop offset="0.45" stopColor="#ffb547" /><stop offset="0.75" stopColor="#d6c78a" /><stop offset="1" stopColor="#3ddc97" />
          </linearGradient>
        </defs>
        <g transform="rotate(135 120 120)">
          <circle cx="120" cy="120" r={r} fill="none" stroke="#1d2634" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${arcLen} ${c}`} />
          {Array.from({ length: 21 }, (_, i) => {
            const a = (i / 20) * 270 * Math.PI / 180;
            const x1 = 120 + 114 * Math.cos(a), y1 = 120 + 114 * Math.sin(a), x2 = 120 + 120 * Math.cos(a), y2 = 120 + 120 * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a3548" strokeWidth="1.5" />;
          })}
          <circle cx="120" cy="120" r={r} fill="none" stroke="url(#lab-odds-g)" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${fill} ${c}`} style={{ transition: "stroke-dasharray 1.6s cubic-bezier(.2,.7,.2,1)", filter: `drop-shadow(0 0 10px ${color}99)` }} />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a96aa]">Survival odds</div>
        <div className="mt-1 text-7xl font-black leading-none tabular-nums" style={{ color, textShadow: `0 0 30px ${color}66` }}>
          {shown}<span className="text-3xl">%</span>
        </div>
        <div className="mt-2 rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-widest" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>{oddsLabel(odds)}</div>
      </div>
    </div>
  );
}
