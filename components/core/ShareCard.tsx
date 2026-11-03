"use client";
/** Lane: components. Shareable summary: fear score, hardest topic, counts, Copy (shareText from lib/export). */
import { useState } from "react";
import { shareText } from "@/lib/export";
import type { CoursePack } from "@/shared/contract";
import Button from "./Button";
import { fearTone } from "./CourseCard";
import GrokStatusPill from "./GrokStatusPill";

export interface ShareCardProps {
  pack: CoursePack;
  /** Called after a successful copy (e.g. to show a toast). */
  onCopied?: () => void;
}

export function hardestConcept(pack: CoursePack) {
  const top = [...pack.difficulty].sort((a, b) => b.score - a.score)[0];
  const label = pack.concepts.find((c) => c.id === top?.conceptId)?.label ?? pack.concepts[0]?.label ?? "—";
  return { label, score: top?.score ?? 0 };
}

export default function ShareCard({ pack, onCopied }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const tone = fearTone(pack.fearScore);
  const hard = hardestConcept(pack);
  const text = shareText(pack);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this:", text);
    }
  }

  return (
    <section
      aria-label="Share"
      className="relative overflow-hidden rounded-2xl border border-[#B3A369]/40 bg-gradient-to-br from-[#14161d] via-[#0d0f14] to-[#0b1630] p-6"
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#2D7DFF]/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B3A369]">SmartPath Scout · {pack.course.code}</p>
        <GrokStatusPill pack={pack} />
      </div>
      <div className="relative mt-4 flex items-end gap-6">
        <div>
          <p className={`text-7xl font-extrabold leading-none tabular-nums ${tone.text}`}>{Math.round(pack.fearScore)}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">Fear score / 100</p>
        </div>
        <div className="min-w-0 pb-1">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Hardest topic</p>
          <p className="truncate text-xl font-semibold text-white">{hard.label}</p>
          <p className="text-xs text-neutral-400">
            {pack.concepts.length} concepts · {pack.sources.length} sources
          </p>
        </div>
      </div>
      <p className="relative mt-4 text-sm leading-relaxed text-neutral-300">{text}</p>
      <div className="relative mt-4">
        <Button variant="primary" onClick={copy}>
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </div>
    </section>
  );
}
