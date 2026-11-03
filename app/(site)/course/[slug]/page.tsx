"use client";
/** Lane: pages. Course dashboard. */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CoursePack } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { ConceptGraph, DifficultyHeatmap, ExamTopicsChart, FearGauge, LearningPath, SourceKindDonut } from "@/components/viz";
import ProviderPill from "../../_components/ProviderPill";
import ShareCard from "@/components/core/ShareCard";
import CourseChat from "@/components/core/CourseChat";
import ExportButton from "@/components/core/ExportButton";
import OutreachComposer from "@/components/core/OutreachComposer";
import PracticeExam from "@/components/core/PracticeExam";
import QuoteCard from "@/components/core/QuoteCard";
import SourceList from "@/components/core/SourceList";
import StudyPlanner from "@/components/core/StudyPlanner";
import TipList from "@/components/core/TipList";
import { ErrorBox, Skeleton } from "../../_components/ui";
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

  const hardest = [...pack.difficulty].sort((a, b) => b.score - a.score)[0]?.conceptId;
  const nameOf = new Map(pack.concepts.map((c) => [c.id, c.label]));
  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/" className="text-sm text-muted hover:text-goldb">← All courses</Link>
      {/* header */}
      <div className="card relative mt-3 overflow-hidden p-5 sm:p-8">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2"><span className="eyebrow">Georgia Tech</span><ProviderPill pack={pack} /></div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl"><span className="mono text-gradient">{pack.course.code}</span></h1>
            <div className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{pack.course.title}</div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{pack.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ExportButton courseCode={pack.course.code} variant="primary" />
              <Link className="btn btn-ghost" href={`/scout/${slug}`}>↻ Re-scout</Link>
              <Link className="btn btn-ghost" href={`/roast?c=${encodeURIComponent(pack.course.code)}`}>🔥 Roast this course</Link>
              <Link className="btn btn-ghost" href={`/versus?a=${encodeURIComponent(pack.course.code)}`}>⚔️ Versus…</Link>
            </div>
          </div>
          <div className="flex flex-col items-center self-center">
            <FearGauge score={pack.fearScore} size={240} />
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
              <Section title="Concept graph" sub="Click a node. Size = how often it shows up on exams; color = how hard students find it."><ConceptGraph concepts={pack.concepts} edges={pack.edges} examTopics={pack.examTopics} difficulty={pack.difficulty} sources={pack.sources} /></Section>
              <div className="grid gap-6 lg:grid-cols-2">
                <Section title="What's on the exam" sub="Share of past exams touching each topic"><ExamTopicsChart examTopics={pack.examTopics} concepts={pack.concepts} difficulty={pack.difficulty} /></Section>
                <Section title="Student voices" sub="From Reddit, X and public forums">
                  <div className="space-y-3">{pack.studentQuotes.map((q, i) => <QuoteCard key={i} quote={q} sources={pack.sources} />)}</div>
                </Section>
              </div>
              <Section title="Difficulty heatmap" sub="Hardest concepts first"><DifficultyHeatmap pack={pack} /></Section>
              {hardest && (
                <Section title="Path to mastery" sub={`The prerequisite chain to conquer the hardest concept: ${nameOf.get(hardest) ?? hardest}`}>
                  <LearningPath pack={pack} targetConceptId={hardest} graphHeight={360} />
                </Section>
              )}
              <div className="grid gap-6 lg:grid-cols-2">
                <Section title="Where the intel came from" sub="Source mix across agents"><SourceKindDonut pack={pack} /></Section>
                <ShareCard pack={pack} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <TipList tips={pack.tips} />
                <SourceList sources={pack.sources} />
              </div>
              <p className="text-center text-xs text-dim">Hardest concept: <b className="text-muted">{nameOf.get([...pack.difficulty].sort((a, b) => b.score - a.score)[0]?.conceptId ?? "") ?? "—"}</b> · generated {new Date(pack.generatedAt).toLocaleString()}</p>
            </div>
          )}
          {tab === "Practice Exam" && <PracticeExam courseCode={pack.course.code} concepts={pack.concepts} />}
          {tab === "Study Plan" && <StudyPlanner courseCode={pack.course.code} concepts={pack.concepts} />}
          {tab === "Professor Outreach" && <OutreachComposer courseCode={pack.course.code} professors={pack.professors} />}
          {tab === "Ask the Course" && <CourseChat courseCode={pack.course.code} sources={pack.sources} />}
        </div>
      </div>
    </main>
  );
}
