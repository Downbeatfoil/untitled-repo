"use client";
/** Lane: pages. Scout run, composed from components/core ScoutProgress (startScout under the hood). */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ScoutProgress from "@/components/core/ScoutProgress";
import { normalizeCourseCode } from "@/shared/contract";
import { buildSeedPack } from "../../_lib/seed";

export default function ScoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const code = normalizeCourseCode(String(slug).replace("-", " "));
  const [failed, setFailed] = useState<string | null>(null);
  const hasSeed = !!buildSeedPack(code);

  return (
    <main className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/" className="mb-5 inline-block text-sm text-muted hover:text-goldb">← All courses</Link>
      <ScoutProgress
        courseCode={code}
        onComplete={() => router.push(`/course/${slug}`)}
        onError={(m) => setFailed(m)}
      />
      {failed && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-[rgba(255,255,255,0.03)] p-4 text-sm text-muted">
          <span>Live scouting isn&apos;t available right now.</span>
          {hasSeed ? (
            <Link href={`/course/${slug}`} className="btn btn-gold">Open seeded pack for {code}</Link>
          ) : (
            <Link href="/" className="btn btn-ghost">Pick a seeded course</Link>
          )}
        </div>
      )}
    </main>
  );
}
