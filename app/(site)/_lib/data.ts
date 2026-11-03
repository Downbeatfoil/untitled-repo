/** Lane: pages. api-client wrappers with lib/data fallbacks so the UI never shows a raw error or goes blank. */
import { getCourses, getPack } from "@/lib/api-client";
import { getSeedPack, listSeeds, makeGenericPack } from "@/lib/data";
import type { CoursePack, CourseSummary } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { buildSeedPack, seedSummaries } from "./seed";

export async function loadCourses(): Promise<CourseSummary[]> {
  try {
    const list = await getCourses();
    if (Array.isArray(list) && list.length) return list;
  } catch {}
  try {
    const seeds = listSeeds();
    if (seeds.length) return seeds;
  } catch {}
  return seedSummaries();
}

export async function loadPack(code: string): Promise<CoursePack> {
  try {
    return await getPack(code);
  } catch {
    const c = normalizeCourseCode(code);
    return getSeedPack(c) ?? buildSeedPack(c) ?? makeGenericPack(c);
  }
}
