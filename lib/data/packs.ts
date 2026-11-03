/**
 * Lane: data
 * Core pack registry and seed lookup helpers (15 GT seeded courses).
 */
import type { CourseCode, CoursePack, CourseSummary } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { cs1332Pack } from "./seeds/cs-1332";
import { cs2110Pack } from "./seeds/cs-2110";
import { math1554Pack } from "./seeds/math-1554";
import { cs1331Pack } from "./seeds/cs-1331";
import { cs3510Pack } from "./seeds/cs-3510";
import { phys2211Pack } from "./seeds/phys-2211";
import { cs2200Pack } from "./seeds/cs-2200";
import { cs2340Pack } from "./seeds/cs-2340";
import { cs4641Pack } from "./seeds/cs-4641";
import { math2551Pack } from "./seeds/math-2551";
import { ece2020Pack } from "./seeds/ece-2020";
import { chem1310Pack } from "./seeds/chem-1310";
import { cs2050Pack } from "./seeds/cs-2050";
import { phys2212Pack } from "./seeds/phys-2212";
import { econ2100Pack } from "./seeds/econ-2100";

const SEEDS: Record<CourseCode, CoursePack> = {
  "CS 1332": cs1332Pack,
  "CS 2110": cs2110Pack,
  "MATH 1554": math1554Pack,
  "CS 1331": cs1331Pack,
  "CS 3510": cs3510Pack,
  "PHYS 2211": phys2211Pack,
  "CS 2200": cs2200Pack,
  "CS 2340": cs2340Pack,
  "CS 4641": cs4641Pack,
  "MATH 2551": math2551Pack,
  "ECE 2020": ece2020Pack,
  "CHEM 1310": chem1310Pack,
  "CS 2050": cs2050Pack,
  "PHYS 2212": phys2212Pack,
  "ECON 2100": econ2100Pack,
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
