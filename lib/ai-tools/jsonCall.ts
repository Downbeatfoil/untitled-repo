/** Lane: ai-tools. Safe Grok JSON call + tiny coercion helpers for roast/versus/outreach. Never throws. */
import type { CoursePack } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "@/lib/ai/grok";

export const GROK_TIMEOUT = 40_000;

/** Returns parsed JSON object, or null if Grok is unconfigured / slow / errors / returns junk. */
export async function grokJsonOrNull<T>(prompt: string, system: string, temperature = 0.8): Promise<T | null> {
  if (!grokConfigured()) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const out = await Promise.race([
      askGrokJson<T>(prompt, { system, temperature }),
      new Promise<never>((_, rej) => {
        timer = setTimeout(() => rej(new Error("grok timeout")), GROK_TIMEOUT);
      }),
    ]);
    return out && typeof out === "object" ? out : null;
  } catch (err) {
    console.warn("[ai-tools] Grok failed, falling back to mock:", (err as Error)?.message);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const toStr = (v: unknown, d = ""): string => (typeof v === "string" && v.trim() ? v.trim() : d);
export const clampNum = (v: unknown, lo: number, hi: number, d: number): number =>
  Math.min(hi, Math.max(lo, typeof v === "number" && Number.isFinite(v) ? v : d));

/** Hardest concept of a pack by student difficulty score (falls back to first concept). */
export function hardestOf(pack: CoursePack): { label: string; score: number } {
  const diff = [...(pack.difficulty ?? [])].sort((a, b) => b.score - a.score)[0];
  const concept = pack.concepts?.find((c) => c.id === diff?.conceptId) ?? pack.concepts?.[0];
  return { label: concept?.label ?? "the hard parts", score: diff?.score ?? 0.6 };
}

/** Most frequently examined concept label. */
export function topExamTopic(pack: CoursePack): string {
  const top = [...(pack.examTopics ?? [])].sort((a, b) => b.frequency - a.frequency)[0];
  return pack.concepts?.find((c) => c.id === top?.conceptId)?.label ?? pack.concepts?.[0]?.label ?? "everything";
}

/** One-line grounded brief of a pack for roast/versus prompts. */
export function courseLine(pack: CoursePack): string {
  const h = hardestOf(pack);
  const quote = pack.studentQuotes?.find((q) => q.sentiment === "negative") ?? pack.studentQuotes?.[0];
  return (
    `${pack.course.code} "${pack.course.title}": fear score ${pack.fearScore}/100; hardest concept: ${h.label} (${Math.round(h.score * 100)}/100); ` +
    `most-tested topic: ${topExamTopic(pack)}; ${pack.concepts?.length ?? 0} concepts; ${pack.sources?.length ?? 0} sources` +
    (quote ? `; student says: "${quote.text}"` : "")
  );
}
