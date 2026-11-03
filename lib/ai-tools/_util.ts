/**
 * Lane: ai-tools. Shared helpers: Grok voice, timeouts, pack digests, safe parsing.
 * Nothing in lib/ai-tools may throw to callers: every public function falls back to a mock.
 */
import type { CoursePack } from "@/shared/contract";

/** Grok's voice for every study tool: witty, confident, actually helpful. */
export const GROK_VOICE =
  "You are Grok, the study partner inside SmartPath Scout for Georgia Tech students. " +
  "Voice: witty, confident, a little cheeky, but genuinely helpful and kind. Never condescending. " +
  "Be concrete (name the actual concept, trap or technique), keep it tight, no filler, no markdown headings. " +
  "Only use facts from the provided course pack; never invent URLs, emails or sources.";

/** Reject after `ms` so a slow Grok call can never hang a route. */
export function withTimeout<T>(p: Promise<T>, ms: number, label = "grok"): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(t)) as Promise<T>;
}

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
export const str = (v: unknown, d = "") => (typeof v === "string" && v.trim() ? v.trim() : d);
export const slug = (code: string) => code.toLowerCase().replace(/\s+/g, "-");

/** Frequency of a concept on past exams (0..1), default 0.3 if unknown. */
export function freqOf(pack: CoursePack, conceptId: string): number {
  return pack.examTopics?.find((t) => t.conceptId === conceptId)?.frequency ?? 0.3;
}
/** How hard students find a concept (0..1), default 0.5 if unknown. */
export function diffOf(pack: CoursePack, conceptId: string): number {
  return pack.difficulty?.find((d) => d.conceptId === conceptId)?.score ?? 0.5;
}
/** Concept label for an id (falls back to the id). */
export function labelOf(pack: CoursePack, conceptId: string): string {
  return pack.concepts?.find((c) => c.id === conceptId)?.label ?? conceptId;
}
/** Concepts sorted by exam-frequency × difficulty (the "study this first" order). */
export function rankConcepts(pack: CoursePack) {
  return [...(pack.concepts ?? [])]
    .map((c) => ({ c, w: (0.25 + freqOf(pack, c.id)) * (0.25 + diffOf(pack, c.id)) }))
    .sort((a, b) => b.w - a.w);
}
/** The hardest concept by student difficulty. */
export function hardestConcept(pack: CoursePack) {
  const sorted = [...(pack.concepts ?? [])].sort((a, b) => diffOf(pack, b.id) - diffOf(pack, a.id));
  return sorted[0];
}

/** Compact, grounded text digest of a pack for prompts. */
export function packDigest(pack: CoursePack, opts: { sources?: boolean; maxConcepts?: number } = {}): string {
  const ranked = rankConcepts(pack).slice(0, opts.maxConcepts ?? 20);
  const lines = [
    `COURSE: ${pack.course.code} ${pack.course.title} (${pack.course.school}); fear score ${pack.fearScore}/100`,
    `SUMMARY: ${pack.summary}`,
    "CONCEPTS (id | label | exam frequency | difficulty | description):",
    ...ranked.map(
      ({ c }) =>
        `- ${c.id} | ${c.label} | ${freqOf(pack, c.id).toFixed(2)} | ${diffOf(pack, c.id).toFixed(2)} | ${c.description}`,
    ),
  ];
  if (opts.sources !== false && pack.sources?.length) {
    lines.push(
      "SOURCES (id | kind | title | why it matters):",
      ...pack.sources.map((s) => `- ${s.id} | ${s.kind} | ${s.title} | ${s.snippet}`),
    );
  }
  if (pack.studentQuotes?.length) {
    lines.push("STUDENT QUOTES:", ...pack.studentQuotes.slice(0, 5).map((q) => `- "${q.text}" (${q.sourceId})`));
  }
  if (pack.tips?.length) lines.push("TIPS:", ...pack.tips.map((t) => `- ${t}`));
  return lines.join("\n");
}
