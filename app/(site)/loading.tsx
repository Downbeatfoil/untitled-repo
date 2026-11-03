export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6" aria-busy>
      <div className="skeleton h-10 w-1/2" />
      <div className="skeleton h-40" />
      <div className="grid gap-4 md:grid-cols-3"><div className="skeleton h-40" /><div className="skeleton h-40" /><div className="skeleton h-40" /></div>
    </main>
  );
}
