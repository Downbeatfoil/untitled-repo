"use client";
/** Lane: pages. Course dashboard. */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { exportUrl } from "@/lib/api-client";
import type { CoursePack } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { ChatTab, ExamTab, OutreachTab, PlanTab } from "../../_components/tabs";
import { ErrorBox, FearGauge, KindBadge, Skeleton } from "../../_components/ui";
import { ConceptGraph, DifficultyHeatmap, ExamTopicsChart } from "../../_components/viz";
import { loadPack } from "../../_lib/data";

const TABS = ["Overview", "Practice Exam", "Study Plan", "Professor Outreach", "Ask the Course"] as const;
type Tab = (typeof TABS)[number];

function Section({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <h3 className="text-lg font-bold">{title}</h3>
      {sub && <p className="mt-0.5 text-sm text-dim">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const code = normalizeCourseCode(String(slug).replace("-", " "));
  const [pack, setPack] = useState<CoursePack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  const load = useCallback(() => {
    setError(null); setPack(null);
    loadPack(code).then(setPack).catch((e) => setError(e instanceof Error ? e.message : "Could not load course"));
  }, [code]);
  useEffect(load, [load]);

  if (error) return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <ErrorBox message={error} onRetry={load}><Link href={`/scout/${slug}`} className="btn btn-blue">Scout {code}</Link><Link href="/" className="btn btn-ghost">All courses</Link></ErrorBox>
    </main>
  );
  if (!pack) return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-48" /><Skeleton className="h-12 w-2/3" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
    </main>
  );

  const nameOf = new Map(pack.concepts.map((c) => [c.id, c.label]));
  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/" className="text-sm text-muted hover:text-goldb">← All courses</Link>
      {/* header */}
      <div className="card relative mt-3 overflow-hidden p-5 sm:p-8">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2"><span className="eyebrow">Georgia Tech</span>{pack.mocked && <span className="badge border-line2 text-dim">seeded pack</span>}</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl"><span className="mono text-gradient">{pack.course.code}</span></h1>
            <div className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{pack.course.title}</div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{pack.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="btn btn-gold" href={exportUrl(pack.course.code, "smartpath")} download>⬇ Export to SmartPath</a>
              <Link className="btn btn-ghost" href={`/scout/${slug}`}>↻ Re-scout</Link>
            </div>
          </div>
          <div className="flex flex-col items-center self-center">
            <FearGauge score={pack.fearScore} size={230} />
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-dim">Fear score</div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-6 flex overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} data-active={tab === t} className="tab" onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div className="mt-6" key={tab}>
        <div className="anim-up">
          {tab === "Overview" && (
            <div className="space-y-6">
              <Section title="Concept graph" sub="Click a node. Size = how often it shows up on exams; color = how hard students find it."><ConceptGraph pack={pack} /></Section>
              <div className="grid gap-6 lg:grid-cols-2">
                <Section title="What's on the exam" sub="Share of past exams touching each topic"><ExamTopicsChart pack={pack} /></Section>
                <Section title="Student voices" sub="From Reddit, X and public forums">
                  <div className="space-y-3">
                    {pack.studentQuotes.map((q, i) => {
                      const c = q.sentiment === "positive" ? "#3ddc97" : q.sentiment === "negative" ? "#ff5d6c" : "#8a96aa";
                      const s = pack.sources.find((x) => x.id === q.sourceId);
                      return (
                        <blockquote key={i} className="rounded-lg border-l-2 bg-[rgba(255,255,255,0.025)] px-4 py-3" style={{ borderColor: c }}>
                          <p className="text-sm leading-relaxed">{q.text}</p>
                          {s && <a href={s.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-dim hover:text-goldb">— {s.title}</a>}
                        </blockquote>
                      );
                    })}
                  </div>
                </Section>
              </div>
              <Section title="Difficulty heatmap" sub="Hardest concepts first"><DifficultyHeatmap pack={pack} /></Section>
              <div className="grid gap-6 lg:grid-cols-2">
                <Section title="Study tips">
                  <ol className="space-y-3">{pack.tips.map((t, i) => <li key={i} className="flex gap-3 text-sm text-muted"><span className="mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[rgba(179,163,105,0.14)] text-xs font-bold text-goldb">{i + 1}</span>{t}</li>)}</ol>
                </Section>
                <Section title={`Sources (${pack.sources.length})`} sub="Every claim traces back to something public">
                  <ul className="space-y-2.5">{pack.sources.map((s, i) => (
                    <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-line p-3 transition-colors hover:border-gold">
                      <div className="flex items-center gap-2"><span className="mono text-xs text-dim">[{i + 1}]</span><KindBadge kind={s.kind} /></div>
                      <div className="mt-1 text-sm font-semibold">{s.title}</div><div className="text-xs text-muted">{s.snippet}</div></a></li>
                  ))}</ul>
                </Section>
              </div>
              <p className="text-center text-xs text-dim">Hardest concept: <b className="text-muted">{nameOf.get([...pack.difficulty].sort((a, b) => b.score - a.score)[0]?.conceptId ?? "") ?? "—"}</b> · generated {new Date(pack.generatedAt).toLocaleString()}</p>
            </div>
          )}
          {tab === "Practice Exam" && <ExamTab pack={pack} />}
          {tab === "Study Plan" && <PlanTab pack={pack} />}
          {tab === "Professor Outreach" && <OutreachTab pack={pack} />}
          {tab === "Ask the Course" && <ChatTab pack={pack} />}
        </div>
      </div>
    </main>
  );
}
