"use client";
/** Lane: components. Static cited-sources list, grouped by kind (exams first). */
import type { Source, SourceKind } from "@/shared/contract";
import Badge from "./Badge";
import { KIND_META } from "./SourceFeed";

const ORDER: SourceKind[] = ["exam", "practice", "syllabus", "course-page", "notes", "reddit", "x", "other"];

export interface SourceListProps {
  sources: Source[];
  title?: string;
}

export default function SourceList({ sources, title = "Sources" }: SourceListProps) {
  if (!sources.length) return null;
  const groups = ORDER.map((k) => ({ kind: k, items: sources.filter((s) => (ORDER.includes(s.kind) ? s.kind : "other") === k) })).filter((g) => g.items.length);
  return (
    <section aria-label={title} className="space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#B3A369]">
        {title} <span className="text-neutral-500">({sources.length})</span>
      </h3>
      {groups.map((g) => {
        const m = KIND_META[g.kind];
        return (
          <div key={g.kind} className="space-y-2">
            <Badge tone={m.tone}>
              {m.label} · {g.items.length}
            </Badge>
            <ul className="space-y-2">
              {g.items.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-[#2D7DFF]/60 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF]"
                  >
                    <p className="text-sm font-medium text-white">
                      {s.title} <span aria-hidden className="text-neutral-500">↗</span>
                    </p>
                    {s.snippet && <p className="mt-0.5 text-xs text-neutral-400">{s.snippet}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
