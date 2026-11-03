/** Shared color helpers for viz components. Dark-background friendly. */

/** Map a 0..1 difficulty score to green → amber → red. */
export function difficultyColor(score: number, alpha = 1): string {
  const s = Math.max(0, Math.min(1, Number.isFinite(score) ? score : 0));
  // hue 140 (green) → 42 (amber) → 0 (red)
  const hue = s < 0.5 ? 140 - (140 - 42) * (s / 0.5) : 42 - 42 * ((s - 0.5) / 0.5);
  return `hsl(${hue.toFixed(0)} 82% 55% / ${alpha})`;
}

export function difficultyLabel(score: number): string {
  if (score >= 0.75) return "Brutal";
  if (score >= 0.5) return "Hard";
  if (score >= 0.25) return "Moderate";
  return "Easy";
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;

export const PALETTE = {
  indigo: "#818cf8",
  violet: "#a78bfa",
  cyan: "#22d3ee",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  slate: "#94a3b8",
  grid: "rgba(148,163,184,0.15)",
  text: "#cbd5e1",
};
