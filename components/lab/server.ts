/** Lane: lab. Server-only helpers shared by lab-api routes (pack lookup with generic fallback). */
import type { CoursePack } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { getPack, makeGenericPack } from "@/lib/data";

export const CODE_RE = /^[A-Z]{2,4} \d{4}[A-Z]?$/;

/** Normalize + validate codes; returns packs (seed/cache, else generic fallback) or an error string. */
export function packsFor(codes: unknown, min: number, max: number): { packs: CoursePack[] } | { error: string } {
  if (!Array.isArray(codes)) return { error: "Body must be { codes: string[] }" };
  const seen = new Set<string>();
  const norm: string[] = [];
  for (const raw of codes) {
    if (typeof raw !== "string") return { error: "codes must be strings" };
    const c = normalizeCourseCode(raw);
    if (!CODE_RE.test(c)) return { error: `"${raw.trim()}" doesn't look like a GT course code (try "CS 1332")` };
    if (!seen.has(c)) { seen.add(c); norm.push(c); }
  }
  if (norm.length < min) return { error: `Pick at least ${min} course${min > 1 ? "s" : ""}` };
  if (norm.length > max) return { error: `Pick at most ${max} courses` };
  return { packs: norm.map((c) => getPack(c) ?? makeGenericPack(c)) };
}
