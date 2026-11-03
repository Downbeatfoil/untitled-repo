"use client";
/** Lane: viz. Star map of scouted courses: star size = fear score, click = /course/[slug]. Works as a hero background. */
import Link from "next/link";
import { useMemo, useState } from "react";
import { courseSlug, type CourseSummary } from "@/shared/contract";
import { difficultyColor } from "./colors";

export interface GTConstellationProps {
  courses: CourseSummary[];
  /** Override click behavior (default: navigate to /course/[slug]). */
  onSelect?: (course: CourseSummary) => void;
  /** Dim + disable pointer events on the background field (use true when used as a page backdrop). */
  ambient?: boolean;
  className?: string;
}

const W = 1000;
const H = 520;
const hash = (s: string, seed = 0) => {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
};

const BG_STARS = Array.from({ length: 90 }, (_, i) => ({
  x: hash("x" + i) * W, y: hash("y" + i) * H, r: 0.4 + hash("r" + i) * 1.2, d: hash("d" + i) * 4, o: 0.2 + hash("o" + i) * 0.5,
}));

export default function GTConstellation({ courses, onSelect, ambient = false, className = "" }: GTConstellationProps) {
  const [hover, setHover] = useState<string | null>(null);

  const stars = useMemo(() => {
    const pts = courses.map((c) => ({
      c,
      x: 90 + hash(c.code, 1) * (W - 180),
      y: 70 + hash(c.code, 2) * (H - 140),
      r: 7 + (Math.max(0, Math.min(100, c.fearScore)) / 100) * 17,
    }));
    // relax so stars don't overlap
    for (let it = 0; it < 80; it++) {
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const min = pts[i].r + pts[j].r + 70;
        if (dist < min) {
          const push = (min - dist) / 2;
          pts[i].x -= (dx / dist) * push; pts[i].y -= (dy / dist) * push;
          pts[j].x += (dx / dist) * push; pts[j].y += (dy / dist) * push;
        }
      }
      pts.forEach((p) => { p.x = Math.max(70, Math.min(W - 70, p.x)); p.y = Math.max(55, Math.min(H - 55, p.y)); });
    }
    return pts;
  }, [courses]);

  // constellation lines: connect each star to its nearest neighbor + next (a light MST-ish web)
  const lines = useMemo(() => {
    const set = new Set<string>();
    const out: [number, number][] = [];
    stars.forEach((a, i) => {
      stars
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach((o) => {
          const k = [i, o.j].sort().join("-");
          if (!set.has(k)) { set.add(k); out.push([i, o.j]); }
        });
    });
    return out;
  }, [stars]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ pointerEvents: ambient ? "none" : undefined }}>
      <style>{`@keyframes vz-twinkle{0%,100%{opacity:var(--o)}50%{opacity:.08}}@keyframes vz-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="group" aria-label="Course constellation">
        <defs>
          <radialGradient id="gc-bg" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#111a33" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06080c" stopOpacity="0" />
          </radialGradient>
          <filter id="gc-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <rect width={W} height={H} fill="url(#gc-bg)" />
        {BG_STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#cbd5e1" style={{ ["--o" as string]: s.o, animation: `vz-twinkle ${3 + s.d}s ease-in-out ${s.d}s infinite` }} />
        ))}
        {lines.map(([i, j]) => (
          <line key={`${i}-${j}`} x1={stars[i].x} y1={stars[i].y} x2={stars[j].x} y2={stars[j].y} stroke="#6366f1" strokeOpacity={hover && (stars[i].c.code === hover || stars[j].c.code === hover) ? 0.7 : 0.22} strokeWidth={1} strokeDasharray="2 5" />
        ))}
        {stars.map(({ c, x, y, r }, i) => {
          const col = difficultyColor(c.fearScore / 100);
          const on = hover === c.code;
          const body = (
            <g
              transform={`translate(${x} ${y})`}
              style={{ cursor: "pointer", pointerEvents: ambient ? "none" : "auto" }}
              onMouseEnter={() => setHover(c.code)}
              onMouseLeave={() => setHover(null)}
            >
              <g style={{ animation: `vz-float ${5 + (i % 4)}s ease-in-out ${i * 0.4}s infinite` }}>
                <circle r={r * 2.2} fill={col} opacity={on ? 0.45 : 0.25} filter="url(#gc-glow)" />
                <circle r={r} fill={col} stroke="#fff" strokeOpacity={on ? 0.9 : 0.35} strokeWidth={on ? 2 : 1} />
                <circle r={r * 0.4} fill="#fff" opacity={0.85} cx={-r * 0.25} cy={-r * 0.25} />
                <text y={r + 17} textAnchor="middle" fontSize={13} fontWeight={700} fill="#e2e8f0" style={{ textShadow: "0 1px 4px #000" }}>{c.code}</text>
                <text y={r + 31} textAnchor="middle" fontSize={10.5} fill={col}>fear {Math.round(c.fearScore)}</text>
                {on && (
                  <g transform={`translate(0 ${-r - 14})`}>
                    <rect x={-95} y={-26} width={190} height={34} rx={8} fill="#0b1020" stroke="#334155" />
                    <text y={-14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{c.title.length > 30 ? c.title.slice(0, 29) + "…" : c.title}</text>
                    <text y={1} textAnchor="middle" fontSize={9.5} fill="#94a3b8">Hardest: {c.topConcept}</text>
                  </g>
                )}
              </g>
            </g>
          );
          return onSelect ? (
            <g key={c.code} onClick={() => onSelect(c)}>{body}</g>
          ) : (
            <Link key={c.code} href={`/course/${courseSlug(c.code)}`} aria-label={`${c.code} ${c.title}, fear score ${Math.round(c.fearScore)}`}>
              {body}
            </Link>
          );
        })}
      </svg>
    </div>
  );
}
