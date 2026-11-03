"use client";
/** Lane: pages. Home: hero + search + gallery. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CourseSummary } from "@/shared/contract";
import { courseSlug } from "@/shared/contract";
import CourseCard from "@/components/core/CourseCard";
import CourseSearch from "@/components/core/CourseSearch";
import { Skeleton } from "./_components/ui";
import { loadCourses } from "./_lib/data";

const STEPS = [
  { n: "01", icon: "🔎", title: "Name your class", body: "Type any Georgia Tech course code. No uploads, no accounts." },
  { n: "02", icon: "🛰️", title: "4 Grok agents scout", body: "Exam Hunter, Syllabus Scout, Student Pulse and Concept Mapper search the web and X in parallel." },
  { n: "03", icon: "🧭", title: "Get your SmartPath", body: "Concept graph, practice exam, study plan, professor outreach, exported to SmartPath." },
];

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadCourses().then((c) => alive && setCourses(c));
    return () => { alive = false; };
  }, []);

  const sorted = useMemo(() => (courses ? [...courses].sort((a, b) => b.fearScore - a.fearScore) : null), [courses]);

  function go(code: string) {
    router.push(`/scout/${courseSlug(code)}`);
  }

  return (
    <main className="page-enter">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="anim-up inline-flex items-center gap-2 rounded-full border border-line2 bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
            4 Grok agents online · web + X search · every source cited
          </div>
          <h1 className="anim-up delay-1 mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            What class are you <span className="text-gradient">dreading?</span>
          </h1>
          <p className="anim-up delay-2 mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
            Name any Georgia Tech course. A swarm of Grok agents scours the web and X for public past exams, syllabi and
            student chatter, then builds your SmartPath study path in about 60 seconds.
          </p>

          <div className="anim-up delay-3 mx-auto mt-9 flex max-w-2xl justify-center text-left">
            <CourseSearch onSubmit={go} autoFocus buttonLabel="Scout it" placeholder="CS 1332, math1554, phys-2211…" />
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="eyebrow">Fear index</div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Most feared at GT</h2>
          </div>
          <span className="hidden text-sm text-dim sm:block">Seeded packs open instantly</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted
            ? sorted.map((c, i) => (
                <div key={c.code} className="anim-up" style={{ animationDelay: `${i * 70}ms` }}><CourseCard course={c} href={`/course/${courseSlug(c.code)}`} /></div>
              ))
            : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <div className="eyebrow">How it works</div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">From class name to study path in ~60 seconds</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card relative overflow-hidden p-6">
              <div className="mono absolute right-4 top-3 text-4xl font-black text-[rgba(255,255,255,0.05)]">{s.n}</div>
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-dim">
          Only public material. Every claim links to its source. <Link href="/about" className="text-goldb underline-offset-4 hover:underline">Why we built this →</Link>
        </p>
      </section>
    </main>
  );
}
