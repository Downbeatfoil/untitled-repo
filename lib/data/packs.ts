/**
 * Lane: data
 * Core pack registry and seed lookup helpers.
 */
import type { CourseCode, CoursePack, CourseSummary } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { cs1332Pack } from "./seeds/cs-1332";
import { cs2110Pack } from "./seeds/cs-2110";
import { math1554Pack } from "./seeds/math-1554";
import { cs1331Pack } from "./seeds/cs-1331";
import { cs3510Pack } from "./seeds/cs-3510";
import { phys2211Pack } from "./seeds/phys-2211";

const SEEDS: Record<CourseCode, CoursePack> = {
  "CS 1332": cs1332Pack,
  "CS 2110": cs2110Pack,
  "MATH 1554": math1554Pack,
  "CS 1331": cs1331Pack,
  "CS 3510": cs3510Pack,
  "PHYS 2211": phys2211Pack,
};

/** Look up a seeded CoursePack by course code (case/space-insensitive). */
export function getSeedPack(code: string): CoursePack | null {
  const normalized = normalizeCourseCode(code);
  return SEEDS[normalized] ?? null;
}

/** Check if a course code exists in seeds. */
export function hasSeed(code: string): boolean {
  const normalized = normalizeCourseCode(code);
  return normalized in SEEDS;
}

/** Return CourseSummary cards for all seeded courses (sorted by fearScore descending). */
export function listSeeds(): CourseSummary[] {
  return Object.values(SEEDS)
    .map((pack) => {
      // Find the concept with the highest difficulty score
      let topConcept = pack.concepts[0]?.label ?? "";
      let highestDiff = -1;
      for (const d of pack.difficulty) {
        if (d.score > highestDiff) {
          highestDiff = d.score;
          const match = pack.concepts.find((c) => c.id === d.conceptId);
          if (match) topConcept = match.label;
        }
      }
      return {
        code: pack.course.code,
        title: pack.course.title,
        fearScore: pack.fearScore,
        conceptCount: pack.concepts.length,
        sourceCount: pack.sources.length,
        topConcept,
      };
    })
    .sort((a, b) => b.fearScore - a.fearScore);
}

export { SEEDS };
