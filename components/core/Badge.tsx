"use client";
/** Lane: components. Small pill label. Tones follow the dark GT-gold / electric-blue theme. */
import type { ReactNode } from "react";

export type BadgeTone = "gold" | "blue" | "green" | "red" | "amber" | "violet" | "neutral";

const TONES: Record<BadgeTone, string> = {
  gold: "border-[#B3A369]/40 bg-[#B3A369]/10 text-[#D9CD9A]",
  blue: "border-[#2D7DFF]/40 bg-[#2D7DFF]/10 text-[#7FB0FF]",
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  red: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  neutral: "border-white/10 bg-white/5 text-neutral-300",
};

export default function Badge({
  tone = "neutral",
  children,
  className = "",
  title,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
