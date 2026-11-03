import type { CourseCode, CoursePack, CourseSummary } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { getPack as getDataPack, savePack as saveDataPack } from "@/lib/data/cache";
import { getSeedPack, listSeeds } from "@/lib/data/packs";
import { makeGenericPack } from "@/lib/data/genericPack";

const livePacks = new Map<CourseCode, CoursePack>();

export function cachePack(pack: CoursePack): void {
  const code = normalizeCourseCode(pack.course.code);
  livePacks.set(code, pack);
  try {
    saveDataPack(pack);
  } catch (err) {
    console.warn("Failed to persist pack to lib/data/cache:", err);
  }
}

export function findPack(rawCode: string): { pack: CoursePack | null; isMocked: boolean } {
  if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
    return { pack: null, isMocked: true };
  }

  const code = normalizeCourseCode(rawCode);

  // 1. Check live in-memory cache
  const live = livePacks.get(code);
  if (live) return { pack: live, isMocked: Boolean(live.mocked) };

  // 2. Check lib/data pack cache
  try {
    const dataCached = getDataPack(code);
    if (dataCached) return { pack: dataCached, isMocked: Boolean(dataCached.mocked) };
  } catch {}

  // 3. Check static seed packs
  try {
    const seed = getSeedPack(code);
    if (seed) return { pack: seed, isMocked: Boolean(seed.mocked) };
  } catch {}

  // 4. Fallback to generic pack generator
  try {
    const generic = makeGenericPack(code);
    if (generic) return { pack: generic, isMocked: true };
  } catch {}

  return { pack: null, isMocked: true };
}

export function getAllCourses(): CourseSummary[] {
  const map = new Map<CourseCode, CourseSummary>();

  // Add seeds first
  try {
    for (const c of listSeeds()) {
      map.set(normalizeCourseCode(c.code), c);
    }
  } catch (err) {
    console.warn("Failed to load seed course list:", err);
  }

  // Merge live scouted packs
  for (const pack of livePacks.values()) {
    let topConcept = pack.concepts[0]?.label ?? "";
    let highestDiff = -1;
    for (const d of pack.difficulty) {
      if (d.score > highestDiff) {
        highestDiff = d.score;
        const match = pack.concepts.find((c) => c.id === d.conceptId);
        if (match) topConcept = match.label;
      }
    }
    map.set(normalizeCourseCode(pack.course.code), {
      code: pack.course.code,
      title: pack.course.title,
      fearScore: pack.fearScore,
      conceptCount: pack.concepts.length,
      sourceCount: pack.sources.length,
      topConcept,
    });
  }

  return Array.from(map.values()).sort((a, b) => b.fearScore - a.fearScore);
}
