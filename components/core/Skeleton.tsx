"use client";
/** Lane: components. Shimmering loading placeholder. */
export default function Skeleton({ className = "", lines }: { className?: string; lines?: number }) {
  if (lines && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-white/10" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
        ))}
      </div>
    );
  }
  return <div aria-hidden className={`animate-pulse rounded-lg bg-white/10 ${className || "h-4 w-full"}`} />;
}
