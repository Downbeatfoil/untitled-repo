/** Lane: pages. Small shared presentational helpers (inline placeholders until components/viz ships). */
import type { SourceKind } from "@/shared/contract";

export function fearColor(score: number) {
  if (score >= 80) return "#ff5d6c";
  if (score >= 65) return "#ffb547";
  if (score >= 45) return "#d6c78a";
  return "#3ddc97";
}
export function fearLabel(score: number) {
  if (score >= 80) return "Brutal";
  if (score >= 65) return "Feared";
  if (score >= 45) return "Tough";
  return "Manageable";
}

export function KindBadge({ kind }: { kind: SourceKind }) {
  const map: Record<SourceKind, [string, string]> = {
    exam: ["#ff5d6c", "Exam"], practice: ["#ffb547", "Practice"], syllabus: ["#3d8bff", "Syllabus"],
    "course-page": ["#38e1ff", "Course page"], notes: ["#3ddc97", "Notes"], reddit: ["#ff7a45", "Reddit"],
    x: ["#e8ecf3", "X"], other: ["#8a96aa", "Other"],
  };
  const [c, label] = map[kind] ?? map.other;
  return (
    <span className="badge" style={{ color: c, background: `${c}1a`, borderColor: `${c}40` }}>
      {label}
    </span>
  );
}

/** Semi-circle gauge. */
export function FearGauge({ score, size = 180 }: { score: number; size?: number }) {
  const r = 70, cx = 90, cy = 90;
  const len = Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = fearColor(score);
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div className="relative" style={{ width: size, height: size * 0.62 }} role="img" aria-label={`Fear score ${score} out of 100`}>
      <svg viewBox="0 0 180 112" width="100%" height="100%">
        <defs>
          <linearGradient id="gg" x1="0" x2="1">
            <stop offset="0" stopColor="#3ddc97" /><stop offset="0.5" stopColor="#ffb547" /><stop offset="1" stopColor="#ff5d6c" />
          </linearGradient>
        </defs>
        <path d={arc} stroke="#1d2634" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d={arc} stroke="url(#gg)" strokeWidth="12" fill="none" strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={len * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)", filter: `drop-shadow(0 0 6px ${color}66)` }} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center leading-none">
        <div className="text-3xl font-extrabold tabular-nums" style={{ color }}>{Math.round(score)}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-dim">{fearLabel(score)}</div>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function ErrorBox({ message, onRetry, children }: { message: string; onRetry?: () => void; children?: React.ReactNode }) {
  return (
    <div className="card border-[rgba(255,93,108,0.35)] p-6 text-center anim-in" role="alert">
      <div className="text-2xl">⚠️</div>
      <p className="mt-2 font-semibold text-foreground">Something went sideways</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {onRetry && <button className="btn btn-gold" onClick={onRetry}>Retry</button>}
        {children}
      </div>
    </div>
  );
}
