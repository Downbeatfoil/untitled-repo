/** Lane: ai-tools. Small helpers shared by the study tools. Not part of the public barrel. */
import type { CoursePack } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "@/lib/ai/grok";

export const GROK_TIMEOUT_MS = 40_000;

/**
 * Run Grok and parse JSON. Returns null (never throws) when Grok is not configured,
 * times out, errors, or returns invalid JSON, so callers fall back to mocks.
 */
export async function tryGrokJson<T>(
  prompt: string,
  system: string,
  temperature = 0.7,
): Promise<T | null> {
  if (!grokConfigured()) return null;
  try {
    const result = await Promise.race([
      askGrokJson<T>(prompt, { system, temperature }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("grok timeout")), GROK_TIMEOUT_MS)),
    ]);
    return result && typeof result === "object" ? result : null;
  } catch (err) {
    console.warn("[ai-tools] Grok call failed, using mock:", (err as Error)?.message);
    return null;
  }
}

export const clamp01 = (n: unknown, fallback = 0): number => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(1, Math.max(0, v));
};

export const str = (v: unknown, fallback = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fallback);

export const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim()) : [];

export const slugCode = (code: string) => code.toLowerCase().replace(/\s+/g, "-");

/** Per-concept stats joined from the pack (exam frequency + difficulty). */
export function conceptStats(pack: CoursePack) {
  return pack.concepts.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
    unit: c.unit,
    frequency: pack.examTopics.find((t) => t.conceptId === c.id)?.frequency ?? 0.3,
    difficulty: pack.difficulty.find((d) => d.conceptId === c.id)?.score ?? 0.5,
  }));
}

/** Compact text brief of a pack for prompts. */
export function packBrief(pack: CoursePack, opts: { sources?: boolean; quotes?: boolean } = {}): string {
  const lines = [
    `Course: ${pack.course.code} - ${pack.course.title} (${pack.course.school}). Fear score ${pack.fearScore}/100.`,
    `Summary: ${pack.summary}`,
    "Concepts (id | label | exam frequency 0-1 | difficulty 0-1 | description):",
    ...conceptStats(pack).map(
      (c) => `- ${c.id} | ${c.label} | ${c.frequency.toFixed(2)} | ${c.difficulty.toFixed(2)} | ${c.description}`,
    ),
  ];
  if (opts.sources) {
    lines.push("Sources (id | kind | title | why it matters):");
    for (const s of pack.sources) lines.push(`- ${s.id} | ${s.kind} | ${s.title} | ${s.snippet}`);
  }
  if (opts.quotes) {
    lines.push("Student quotes:");
    for (const q of pack.studentQuotes) lines.push(`- "${q.text}" (${q.sentiment}, ${q.sourceId})`);
    lines.push("Tips: " + pack.tips.join(" | "));
  }
  return lines.join("\n");
}
