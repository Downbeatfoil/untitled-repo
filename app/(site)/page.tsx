"use client";
/** Lane: pages. Home: hero + search + gallery. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CourseSummary } from "@/shared/contract";
import { courseSlug } from "@/shared/contract";
import CourseCard from "@/components/core/CourseCard";
import CourseSearch from "@/components/core/CourseSearch";
import { GTConstellation } from "@/components/viz";
import { Skeleton } from "./_components/ui";
import { loadCourses } from "./_lib/data";

const STEPS = [
  { n: "01", icon: "", title: "Type a course code", body: "CS 1332, MATH 1554, whatever you're registered for. No uploads, no account." },
  { n: "02", icon: "", title: "Four agents go looking", body: "Exam Hunter, Syllabus Scout, Student Pulse and Concept Mapper search the web and X in parallel." },
  { n: "03", icon: "", title: "You get a study pack", body: "A concept map, a practice exam, a day-by-day plan and a draft email to your professor. Exports to SmartPath." },
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
        {sorted && <div className="pointer-events-none absolute inset-0 opacity-20" style={{ maskImage: "linear-gradient(to right, transparent 50%, #000 80%)", WebkitMaskImage: "linear-gradient(to right, transparent 50%, #000 80%)" }}><GTConstellation courses={sorted} ambient className="h-full w-full" /></div>}
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="anim-up inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            Public sources only, every one cited
          </div>
          <h1 className="anim-up delay-1 mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            What class are you <span className="text-goldb">dreading?</span>
          </h1>
          <p className="anim-up delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Upperclassmen pass around old exams. Not everyone knows an upperclassman. Type a Georgia Tech course and we
            pull the publicly posted exams, syllabi and student threads into one study pack in about a minute.
          </p>

          <div className="anim-up delay-3 mt-8 flex max-w-2xl text-left">
            <CourseSearch onSubmit={go} autoFocus buttonLabel="Scout it" placeholder="CS 1332, math1554, phys-2211…" />
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between border-b border-line pb-4">
          <div>
            <div className="eyebrow">Fear index</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Most feared at GT</h2>
          </div>
          <span className="hidden text-sm text-dim sm:block">Ranked by how much students complain</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted
            ? sorted.map((c, i) => (
                <div key={c.code} className="anim-up" style={{ animationDelay: `${i * 70}ms` }}><CourseCard course={c} href={`/course/${courseSlug(c.code)}`} /></div>
              ))
            : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-6 border-b border-line pb-4">
          <div className="eyebrow">How it works</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Course code in, study pack out</h2>
        </div>
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <div className="mono text-sm text-gold">{s.n}</div>
              <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-dim">
          Only public material. Every claim links to its source. <Link href="/about" className="text-goldb underline-offset-4 hover:underline">Why we built this</Link>
        </p>
      </section>
    </main>
  );
}
