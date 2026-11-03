/** Lane: lab. POST { a: string, b: string } -> VersusResult. Mock fallback; never throws. */
import { NextResponse } from "next/server";
import { packsFor } from "@/components/lab/server";
import { mockVersus } from "@/components/lab/versusMock";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { a?: unknown; b?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const r = packsFor([body.a, body.b], 2, 2);
  if ("error" in r) return NextResponse.json({ error: r.error === "Pick at least 2 courses" ? "Pick two different courses" : r.error }, { status: 400 });
  try {
    return NextResponse.json(mockVersus(r.packs[0], r.packs[1]));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "cage match failed" }, { status: 500 });
  }
}
