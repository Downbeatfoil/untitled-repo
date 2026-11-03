"use client";
/** Lane: components. Sources fly in as scouts find them; kind badge, found-by, link out. */
import { AGENTS, type Source, type SourceKind } from "@/shared/contract";
import Badge, { type BadgeTone } from "./Badge";
import Fx from "./Fx";

export const KIND_META: Record<SourceKind, { label: string; tone: BadgeTone }> = {
  exam: { label: "Exam", tone: "red" },
  practice: { label: "Practice", tone: "amber" },
  syllabus: { label: "Syllabus", tone: "blue" },
  "course-page": { label: "Course page", tone: "gold" },
  notes: { label: "Notes", tone: "green" },
  reddit: { label: "Reddit", tone: "amber" },
  x: { label: "X", tone: "violet" },
  other: { label: "Other", tone: "neutral" },
};

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export interface SourceFeedProps {
  sources: Source[];
  /** Newest first (default true, so new finds fly in on top). */
  newestFirst?: boolean;
  emptyText?: string;
}

export default function SourceFeed({ sources, newestFirst = true, emptyText = "Sources will appear here as the scouts find them…" }: SourceFeedProps) {
  const list = newestFirst ? [...sources].reverse() : sources;
  return (
    <section aria-label="Sources found" className="space-y-2">
      <Fx />
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500">
        <span>Sources found</span>
        <span className="text-[#B3A369]">{sources.length}</span>
      </div>
      <ul className="space-y-2" aria-live="polite" aria-relevant="additions">
        {list.length === 0 && <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-neutral-600">{emptyText}</li>}
        {list.map((s) => {
          const k = KIND_META[s.kind] ?? KIND_META.other;
          const by = AGENTS.find((a) => a.name === s.foundBy);
          return (
            <li key={s.id} className="sp-fly-in">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-[#2D7DFF]/60 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF]"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={k.tone}>{k.label}</Badge>
                  <span className="truncate text-xs text-neutral-500">{host(s.url)}</span>
                  {by && (
                    <span className="ml-auto shrink-0 text-xs text-neutral-500" title={`Found by ${by.label}`}>
                      {by.emoji}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium text-white">{s.title}</p>
                {s.snippet && <p className="mt-0.5 line-clamp-2 text-xs text-neutral-400">{s.snippet}</p>}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
