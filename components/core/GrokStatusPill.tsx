"use client";
/** Lane: components. 'Live Grok' (green) vs 'Demo data' (amber). Pass `pack` or an explicit `mocked` flag. */
import type { CoursePack } from "@/shared/contract";

export interface GrokStatusPillProps {
  pack?: Pick<CoursePack, "mocked">;
  /** Overrides pack.mocked. Pass e.g. `!health.grokConfigured`. */
  mocked?: boolean;
  className?: string;
}

export default function GrokStatusPill({ pack, mocked, className = "" }: GrokStatusPillProps) {
  const demo = mocked ?? pack?.mocked ?? true;
  return (
    <span
      role="status"
      title={demo ? "Showing seeded demo data (no live Grok call)" : "Generated live by Grok"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        demo ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      } ${className}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${demo ? "bg-amber-400" : "animate-pulse bg-emerald-400"}`} />
      {demo ? "Demo data" : "Live Grok"}
    </span>
  );
}
