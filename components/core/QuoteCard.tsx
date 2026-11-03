"use client";
/** Lane: components. Student quote with sentiment accent and source link. */
import type { Quote, Source } from "@/shared/contract";

const SENT = {
  positive: { bar: "bg-emerald-400", icon: "😌", label: "Positive" },
  neutral: { bar: "bg-[#2D7DFF]", icon: "🤔", label: "Neutral" },
  negative: { bar: "bg-rose-400", icon: "😰", label: "Negative" },
} as const;

export interface QuoteCardProps {
  quote: Quote;
  /** Pass pack.sources to link the quote to its source. */
  sources?: Source[];
}

export default function QuoteCard({ quote, sources = [] }: QuoteCardProps) {
  const s = SENT[quote.sentiment] ?? SENT.neutral;
  const src = sources.find((x) => x.id === quote.sourceId);
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 pl-5">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} />
      <blockquote className="text-sm leading-relaxed text-neutral-100">
        <span aria-hidden className="mr-1 text-lg text-[#B3A369]">“</span>
        {quote.text}
        <span aria-hidden className="ml-0.5 text-lg text-[#B3A369]">”</span>
      </blockquote>
      <figcaption className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
        <span title={s.label} aria-label={s.label}>{s.icon}</span>
        {src ? (
          <a href={src.url} target="_blank" rel="noopener noreferrer" className="truncate text-[#7FB0FF] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF]">
            {src.title}
          </a>
        ) : (
          <span>source {quote.sourceId}</span>
        )}
      </figcaption>
    </figure>
  );
}
