"use client";
/** Lane: components. Numbered, actionable study tips. */
export interface TipListProps {
  tips: string[];
  title?: string;
}

export default function TipList({ tips, title = "Study tips" }: TipListProps) {
  if (!tips.length) return null;
  return (
    <section aria-label={title} className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#B3A369]">{title}</h3>
      <ol className="space-y-2">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-200">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#B3A369]/15 text-xs font-bold text-[#D9CD9A]">{i + 1}</span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
