"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="text-4xl">⚠️</div>
      <h1 className="mt-3 text-2xl font-bold">Something went sideways</h1>
      <p className="mt-2 text-sm text-muted">{error.message || "Unexpected error."}</p>
      <button className="btn btn-gold mt-6" onClick={reset}>Try again</button>
    </main>
  );
}
