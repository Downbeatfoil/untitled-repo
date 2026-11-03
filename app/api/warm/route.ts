/** Lane: api. GET /api/warm -> Pre-warm cache for CS 1332 and MATH 1554 */
import { NextResponse } from "next/server";
import { cachePack, findPack } from "@/app/api/_cache";
import { SEEDS } from "@/lib/data/packs";

export const dynamic = "force-dynamic";

export async function GET() {
  const warmed: string[] = [];

  // Priority targets for demo
  const targets = ["CS 1332", "MATH 1554"];
  for (const code of targets) {
    const { pack } = findPack(code);
    if (pack) {
      cachePack(pack);
      warmed.push(code);
    }
  }

  // Pre-cache all seed packs into memory
  try {
    if (SEEDS) {
      for (const pack of Object.values(SEEDS)) {
        cachePack(pack);
      }
    }
  } catch (err) {
    console.warn("[api/warm] error warming seeds:", err);
  }

  return NextResponse.json({
    ok: true,
    warmed,
    totalCached: Object.keys(SEEDS || {}).length,
  });
}
