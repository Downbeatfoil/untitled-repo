"use client";
/** Lane: components. Gallery card for a CourseSummary with a fear-score badge. */
import type { CourseSummary } from "@/shared/contract";
import { courseSlug } from "@/shared/contract";

export function fearTone(score: number) {
  if (score >= 75) return { label: "Dreaded", text: "text-rose-300", ring: "#fb7185" };
  if (score >= 50) return { label: "Feared", text: "text-amber-300", ring: "#fbbf24" };
  return { label: "Manageable", text: "text-emerald-300", ring: "#34d399" };
}

export interface CourseCardProps {
  course: CourseSummary;
  /** Called on click; if omitted and `href` unset, links to /scout/[slug]. */
  onSelect?: (course: CourseSummary) => void;
  href?: string;
}

export default function CourseCard({ course, onSelect, href }: CourseCardProps) {
  const tone = fearTone(course.fearScore);
  const pct = Math.max(0, Math.min(100, Math.round(course.fearScore)));
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B3A369]">{course.code}</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-white">{course.title}</h3>
        </div>
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${tone.ring} ${pct * 3.6}deg, rgba(255,255,255,0.08) 0)` }}
          aria-label={`Fear score ${pct} out of 100`}
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0d0f14]">
            <span className={`text-sm font-bold ${tone.text}`}>{pct}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-400">
        <span className={`font-medium ${tone.text}`}>{tone.label}</span> · hardest topic:{" "}
        <span className="text-neutral-200">{course.topConcept}</span>
      </p>
      <div className="mt-4 flex gap-4 text-xs text-neutral-500">
        <span>
          <b className="text-[#7FB0FF]">{course.conceptCount}</b> concepts
        </span>
        <span>
          <b className="text-[#7FB0FF]">{course.sourceCount}</b> sources
        </span>
        <span className="ml-auto text-[#B3A369] transition group-hover:translate-x-0.5">Scout →</span>
      </div>
    </>
  );
  const cls =
    "group block w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#B3A369]/60 hover:shadow-[0_8px_40px_-12px_#B3A369] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF]";
  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(course)} className={cls}>
        {body}
      </button>
    );
  }
  return (
    <a href={href ?? `/scout/${courseSlug(course.code)}`} className={cls}>
      {body}
    </a>
  );
}
