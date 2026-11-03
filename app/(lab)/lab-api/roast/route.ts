/** Lane: lab. POST { codes: string[] } -> RoastResult. Mock fallback; never throws. */
import { NextResponse } from "next/server";
import { packsFor } from "@/components/lab/server";
import { mockRoast } from "@/components/lab/roastMock";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { codes?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const r = packsFor(body.codes, 1, 6);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  try {
    return NextResponse.json(mockRoast(r.packs));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "roast failed" }, { status: 500 });
  }
}
