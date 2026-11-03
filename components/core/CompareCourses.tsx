"use client";
/** Lane: components. Side-by-side comparison of two course packs: fear, difficulty, top exam topics. */
import type { CoursePack } from "@/shared/contract";
import { fearTone } from "./CourseCard";
import { hardestConcept } from "./ShareCard";

function topTopics(p: CoursePack, n = 5) {
  return [...p.examTopics]
    .sort((x, y) => y.frequency - x.frequency)
    .slice(0, n)
    .map((t) => ({ label: p.concepts.find((c) => c.id === t.conceptId)?.label ?? t.conceptId, value: t.frequency }));
}
function avgDifficulty(p: CoursePack) {
  return p.difficulty.length ? p.difficulty.reduce((s, d) => s + d.score, 0) / p.difficulty.length : 0;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10" role="presentation">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(2, Math.min(100, value * 100))}%`, background: color }} />
    </div>
  );
}

function Row({ title, a, b }: { title: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-4 border-t border-white/10 py-4 sm:gap-8">
      <div className="col-span-2 text-xs uppercase tracking-widest text-neutral-500">{title}</div>
      <div>{a}</div>
      <div>{b}</div>
    </div>
  );
}

export interface CompareCoursesProps {
  a: CoursePack;
  b: CoursePack;
}

export default function CompareCourses({ a, b }: CompareCoursesProps) {
  const packs = [a, b];
  const ta = topTopics(a);
  const tb = topTopics(b);
  const winner = a.fearScore === b.fearScore ? null : a.fearScore > b.fearScore ? a : b;
  return (
    <section aria-label={`Compare ${a.course.code} and ${b.course.code}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        {packs.map((p) => (
          <div key={p.course.code}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B3A369]">{p.course.code}</p>
            <h3 className="text-base font-semibold text-white sm:text-lg">{p.course.title}</h3>
          </div>
        ))}
      </div>
      {winner && (
        <p className="mt-3 text-sm text-neutral-400">
          <b className="text-white">{winner.course.code}</b> is the more feared class by {Math.abs(Math.round(a.fearScore - b.fearScore))} points.
        </p>
      )}

      <Row
        title="Fear score"
        a={<Fear p={a} />}
        b={<Fear p={b} />}
      />
      <Row
        title="Avg. concept difficulty"
        a={<><p className="mb-1 text-lg font-semibold text-white">{Math.round(avgDifficulty(a) * 100)}%</p><Bar value={avgDifficulty(a)} color="#2D7DFF" /></>}
        b={<><p className="mb-1 text-lg font-semibold text-white">{Math.round(avgDifficulty(b) * 100)}%</p><Bar value={avgDifficulty(b)} color="#2D7DFF" /></>}
      />
      <Row title="Hardest concept" a={<p className="text-white">{hardestConcept(a).label}</p>} b={<p className="text-white">{hardestConcept(b).label}</p>} />
      <Row
        title="Top exam topics"
        a={<Topics items={ta} />}
        b={<Topics items={tb} />}
      />
      <Row
        title="Material found"
        a={<p className="text-sm text-neutral-300">{a.concepts.length} concepts · {a.sources.length} sources</p>}
        b={<p className="text-sm text-neutral-300">{b.concepts.length} concepts · {b.sources.length} sources</p>}
      />
    </section>
  );
}

function Fear({ p }: { p: CoursePack }) {
  const t = fearTone(p.fearScore);
  return (
    <>
      <p className={`text-4xl font-extrabold tabular-nums ${t.text}`}>{Math.round(p.fearScore)}</p>
      <p className={`mb-1 text-xs font-medium ${t.text}`}>{t.label}</p>
      <Bar value={p.fearScore / 100} color={t.ring} />
    </>
  );
}

function Topics({ items }: { items: { label: string; value: number }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t.label}>
          <div className="mb-0.5 flex justify-between text-xs text-neutral-300">
            <span className="truncate pr-2">{t.label}</span>
            <span className="tabular-nums text-neutral-500">{Math.round(t.value * 100)}%</span>
          </div>
          <Bar value={t.value} color="#B3A369" />
        </li>
      ))}
    </ul>
  );
}
