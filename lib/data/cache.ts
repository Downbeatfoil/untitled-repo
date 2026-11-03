/**
 * Lane: data
 * In-memory CoursePack cache with fallback hierarchy: cache -> seed -> null.
 */
import type { CourseCode, CoursePack } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { getSeedPack } from "./packs";

const packCache = new Map<CourseCode, CoursePack>();

/** Save a live or scouted CoursePack into the in-memory cache. */
export function savePack(pack: CoursePack): void {
  const code = normalizeCourseCode(pack.course.code);
  packCache.set(code, pack);
}

/** Retrieve a cached pack if present. */
export function getCachedPack(code: string): CoursePack | null {
  const normalized = normalizeCourseCode(code);
  return packCache.get(normalized) ?? null;
}

/**
 * Retrieve a pack: in-memory cache first, then static seeds, else null.
 */
export function getPack(code: string): CoursePack | null {
  const cached = getCachedPack(code);
  if (cached) return cached;
  return getSeedPack(code);
}

/** Clear cache (useful for testing). */
export function clearCache(): void {
  packCache.clear();
}
