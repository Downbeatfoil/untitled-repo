"use client";
/** Lane: components. One-shot CSS confetti burst (no deps). Respects prefers-reduced-motion. */
import { useMemo } from "react";

const COLORS = ["#B3A369", "#D9CD9A", "#2D7DFF", "#7FB0FF", "#34d399", "#ffffff"];

export interface ConfettiProps {
  /** Render the burst when true. */
  active: boolean;
  pieces?: number;
}

export default function Confetti({ active, pieces = 70 }: ConfettiProps) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.8 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 220,
        rot: 360 + Math.random() * 720,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
      })),
    [pieces],
  );
  if (!active) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden motion-reduce:hidden">
      <style>{`@keyframes sp-confetti { 0% { transform: translate3d(0,-10vh,0) rotate(0); opacity: 1; } 100% { transform: translate3d(var(--dx),110vh,0) rotate(var(--rot)); opacity: .9; } }`}</style>
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block rounded-[2px]"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              "--dx": `${p.drift}px`,
              "--rot": `${p.rot}deg`,
              animation: `sp-confetti ${p.dur}s ${p.delay}s cubic-bezier(.2,.6,.3,1) both`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
