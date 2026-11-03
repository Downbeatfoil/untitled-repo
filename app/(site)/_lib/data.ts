/** Lane: pages. api-client wrappers with seeded fallback so the UI never goes blank. */
import { getCourses, getPack } from "@/lib/api-client";
import type { CoursePack, CourseSummary } from "@/shared/contract";
import { buildSeedPack, seedSummaries } from "./seed";

export async function loadCourses(): Promise<CourseSummary[]> {
  try {
    const list = await getCourses();
    if (Array.isArray(list) && list.length) return list;
  } catch {}
  return seedSummaries();
}

export async function loadPack(code: string): Promise<CoursePack> {
  try {
    return await getPack(code);
  } catch (err) {
    const seeded = buildSeedPack(code);
    if (seeded) return seeded;
    throw err;
  }
}
