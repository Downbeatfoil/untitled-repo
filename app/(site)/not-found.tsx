import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <div className="mono text-7xl font-black text-gradient">404</div>
      <h1 className="mt-4 text-2xl font-bold">This page went off-syllabus</h1>
      <p className="mt-2 text-muted">We couldn&apos;t find what you were looking for. Try scouting a course instead.</p>
      <div className="mt-6 flex gap-3"><Link href="/" className="btn btn-gold">Back to courses</Link><Link href="/built-by-agents" className="btn btn-ghost">Built by agents</Link></div>
    </main>
  );
}
